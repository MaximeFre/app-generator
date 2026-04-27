import { eq, isNull, or, sql } from "drizzle-orm";
import { db } from "./client";
import { items } from "./schema";
import { getSupabase } from "@/lib/supabase/client";
import { featureFlags } from "@/lib/env";
import { useEntitlements } from "@/lib/revenuecat/entitlements";
import { reportError } from "@/lib/sentry/client";

/**
 * Push local dirty rows + pull server-newer rows. Premium-only.
 * Free tier never reaches this — all data stays in expo-sqlite.
 */
export async function syncItems(userId: string): Promise<{ pushed: number; pulled: number }> {
  if (!featureFlags.cloudSyncEnabled) return { pushed: 0, pulled: 0 };
  const isPremium = useEntitlements.getState().isPremium;
  if (!isPremium) return { pushed: 0, pulled: 0 };

  const supabase = getSupabase();
  let pushed = 0;
  let pulled = 0;

  try {
    const dirty = await db.select().from(items).where(eq(items.dirty, true));
    if (dirty.length > 0) {
      const payload = dirty.map((item) => ({
        id: item.serverId ?? item.id,
        local_id: item.id,
        user_id: userId,
        title: item.title,
        notes: item.notes,
        is_done: item.isDone,
        updated_at: new Date(item.updatedAt).toISOString(),
        deleted_at: item.deletedAt ? new Date(item.deletedAt).toISOString() : null,
      }));
      const { data, error } = await supabase.from("items").upsert(payload).select("id, local_id");
      if (error) throw error;
      for (const row of data ?? []) {
        await db
          .update(items)
          .set({ serverId: row.id as string, dirty: false })
          .where(eq(items.id, row.local_id as string));
      }
      pushed = data?.length ?? 0;
    }

    const lastSyncRow = await db
      .select({ max: sql<number>`max(${items.updatedAt})` })
      .from(items)
      .where(or(isNull(items.dirty), eq(items.dirty, false)));
    const since = new Date(lastSyncRow[0]?.max ?? 0).toISOString();

    const { data: remote, error: pullErr } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", since);
    if (pullErr) throw pullErr;

    for (const row of remote ?? []) {
      const updatedAt = new Date(row.updated_at).getTime();
      await db
        .insert(items)
        .values({
          id: row.local_id ?? row.id,
          serverId: row.id,
          title: row.title,
          notes: row.notes,
          isDone: row.is_done,
          updatedAt,
          dirty: false,
          deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
        })
        .onConflictDoUpdate({
          target: items.id,
          set: { title: row.title, notes: row.notes, isDone: row.is_done, updatedAt, dirty: false },
        });
    }
    pulled = remote?.length ?? 0;
  } catch (err) {
    reportError(err, { tag: "sync_items" });
  }

  return { pushed, pulled };
}
