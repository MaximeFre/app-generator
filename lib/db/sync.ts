import { eq, isNull, or, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "./client";
import { items, type Item, type NewItem } from "./schema";
import { getSupabase } from "@/lib/supabase/client";
import { featureFlags } from "@/lib/env";
import { useEntitlements } from "@/lib/revenuecat/entitlements";
import { reportError } from "@/lib/sentry/client";

/**
 * Generic local-first sync driver.
 *
 * Each app calls `registerSyncTable` once per synced table at boot; `syncAll`
 * iterates the registry and runs the same push-dirty / pull-newer cycle for
 * every table. Each table maps its rows to/from its remote shape via
 * `toRemote` / `fromRemote`.
 *
 * Premium- and auth-gated. Free tier never reaches here.
 *
 * Conventions:
 * - Local rows have `id` (PK), `serverId`, `updatedAt`, `dirty`, `deletedAt`.
 * - Remote rows have `id`, `local_id`, `user_id`, `updated_at`, `deleted_at`.
 * - Last-write-wins on `updated_at`.
 */

export type SyncMeta<TSelect, TInsert = TSelect> = {
  /** Local Drizzle table. Must expose `id`, `serverId`, `updatedAt`, `dirty`, `deletedAt` columns. */
  table: SQLiteTable;
  /** Remote table name on Supabase. */
  remoteTable: string;
  /** Maps a local row to the JSON sent to Supabase upsert. Add `user_id` outside; the driver does that. */
  toRemote: (row: TSelect) => Record<string, unknown>;
  /** Maps a Supabase row back into the shape Drizzle inserts/updates. */
  fromRemote: (row: Record<string, unknown>) => TInsert;
};

type AnySyncMeta = SyncMeta<Record<string, unknown>, Record<string, unknown>>;

const registry: AnySyncMeta[] = [];

/**
 * Register a table for sync. Call once at app boot per synced table. Idempotent
 * on `(remoteTable)` — re-registering the same table replaces the previous meta.
 */
export function registerSyncTable<TSelect, TInsert = TSelect>(
  meta: SyncMeta<TSelect, TInsert>,
): void {
  const existing = registry.findIndex((m) => m.remoteTable === meta.remoteTable);
  const cast = meta as unknown as AnySyncMeta;
  if (existing >= 0) registry[existing] = cast;
  else registry.push(cast);
}

/** Drop a single table from the registry. Mostly for tests. */
export function unregisterSyncTable(remoteTable: string): void {
  const i = registry.findIndex((m) => m.remoteTable === remoteTable);
  if (i >= 0) registry.splice(i, 1);
}

/** Internal: clear the whole registry. Tests only. */
export function _clearSyncRegistry(): void {
  registry.length = 0;
}

/**
 * Run sync for every registered table. Returns aggregated counts.
 *
 * Per-table errors are logged to Sentry and the loop continues — one bad
 * table mustn't abort the whole sync.
 */
export async function syncAll(
  userId: string,
): Promise<{ pushed: number; pulled: number; errors: number }> {
  if (!featureFlags.cloudSyncEnabled) return { pushed: 0, pulled: 0, errors: 0 };
  const isPremium = useEntitlements.getState().isPremium;
  if (!isPremium) return { pushed: 0, pulled: 0, errors: 0 };
  if (!userId) return { pushed: 0, pulled: 0, errors: 0 };

  let pushed = 0;
  let pulled = 0;
  let errors = 0;

  for (const meta of registry) {
    try {
      const result = await syncOne(meta, userId);
      pushed += result.pushed;
      pulled += result.pulled;
    } catch (err) {
      errors += 1;
      reportError(err, { tag: "sync_table", remoteTable: meta.remoteTable });
    }
  }

  return { pushed, pulled, errors };
}

async function syncOne(meta: AnySyncMeta, userId: string): Promise<{ pushed: number; pulled: number }> {
  const supabase = getSupabase();
  const { table, remoteTable, toRemote, fromRemote } = meta;

  // Drizzle's typed `SQLiteTable` doesn't expose its columns in a single static
  // shape, so we lean on the convention that every synced table has the 5
  // metadata columns spelled exactly like in `data-and-sync.md`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols = table as any;

  let pushed = 0;
  let pulled = 0;

  // 1. Push dirty rows.
  const dirty = (await db.select().from(table).where(eq(cols.dirty, true))) as Array<
    Record<string, unknown>
  >;
  if (dirty.length > 0) {
    const payload = dirty.map((row) => {
      const remoteShape = toRemote(row);
      return {
        ...remoteShape,
        // Reuse server id when present so updates target the right row.
        id: (row.serverId as string | null) ?? (row.id as string),
        local_id: row.id,
        user_id: userId,
        updated_at: new Date(row.updatedAt as number).toISOString(),
        deleted_at: row.deletedAt ? new Date(row.deletedAt as number).toISOString() : null,
      };
    });
    const { data, error } = await supabase.from(remoteTable).upsert(payload).select("id, local_id");
    if (error) throw error;

    for (const row of data ?? []) {
      await db
        .update(table)
        .set({ serverId: row.id as string, dirty: false })
        .where(eq(cols.id, row.local_id as string));
    }
    pushed = data?.length ?? 0;
  }

  // 2. Pull rows newer than the latest non-dirty local updatedAt.
  const lastSyncRow = (await db
    .select({ max: sql<number>`max(${cols.updatedAt})` })
    .from(table)
    .where(or(isNull(cols.dirty), eq(cols.dirty, false)))) as Array<{ max: number | null }>;
  const since = new Date(lastSyncRow[0]?.max ?? 0).toISOString();

  const { data: remote, error: pullErr } = await supabase
    .from(remoteTable)
    .select("*")
    .eq("user_id", userId)
    .gt("updated_at", since);
  if (pullErr) throw pullErr;

  for (const row of remote ?? []) {
    const local = fromRemote(row as Record<string, unknown>);
    const updatedAt =
      typeof row.updated_at === "string" ? new Date(row.updated_at).getTime() : Date.now();
    const deletedAt =
      typeof row.deleted_at === "string" ? new Date(row.deleted_at).getTime() : null;

    const baseValues = {
      ...local,
      id: (row.local_id as string) ?? (row.id as string),
      serverId: row.id as string,
      updatedAt,
      dirty: false,
      deletedAt,
    };

    await db
      .insert(table)
      .values(baseValues)
      .onConflictDoUpdate({
        target: cols.id,
        set: { ...baseValues },
      });
  }
  pulled = remote?.length ?? 0;

  return { pushed, pulled };
}

/* -----------------------------------------------------------------------------
 * Built-in registrations
 * The legacy template ships an `items` table; register it here so existing
 * call sites keep working. Generated apps will register their own tables in
 * `app/_layout.tsx` (or a dedicated lib/db/registerSync.ts).
 * ---------------------------------------------------------------------------*/

registerSyncTable<Item, NewItem>({
  table: items,
  remoteTable: "items",
  toRemote: (row) => ({
    title: row.title,
    notes: row.notes,
    is_done: row.isDone,
  }),
  fromRemote: (row) => ({
    id: (row.local_id as string) ?? (row.id as string),
    title: row.title as string,
    notes: (row.notes as string | null) ?? null,
    isDone: Boolean(row.is_done),
  }),
});

/* -----------------------------------------------------------------------------
 * Back-compat shim
 * Existing screens import `syncItems` from this module. Keep the export so we
 * don't break call sites; route it through `syncAll` which now drives every
 * registered table.
 * ---------------------------------------------------------------------------*/
export async function syncItems(userId: string): Promise<{ pushed: number; pulled: number }> {
  const result = await syncAll(userId);
  return { pushed: result.pushed, pulled: result.pulled };
}
