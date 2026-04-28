import { useCallback } from "react";
import { eq } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "@/lib/db/client";
import { toast } from "@/components/ui/Toast";
import { reportError } from "@/lib/sentry/client";
import * as haptics from "@/lib/haptics";

/**
 * Soft-delete with one-tap undo.
 *
 * Marks the row's `deletedAt = Date.now()` (and `dirty = true` so it syncs).
 * Pops a toast — if the user taps "Undo", the row is restored. The actual
 * row is never destroyed by this hook; a separate maintenance task can prune
 * rows older than N days.
 *
 * The row must have `id`, `deletedAt`, and `dirty` columns (the standard
 * sync metadata defined in `.claude/rules/data-and-sync.md`).
 */

type SoftDeleteOpts<T extends { id: string }> = {
  table: SQLiteTable;
  row: T;
  toastMessage: string;
  undoLabel?: string;
};

export function useSoftDelete<T extends { id: string }>(opts: SoftDeleteOpts<T>) {
  const { table, row, toastMessage, undoLabel } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols = table as any;

  const remove = useCallback(async () => {
    const now = Date.now();
    try {
      await db
        .update(table)
        .set({ deletedAt: now, updatedAt: now, dirty: true })
        .where(eq(cols.id, row.id));
      haptics.warning();
      toast.undo({
        message: toastMessage,
        undoLabel,
        onUndo: async () => {
          try {
            await db
              .update(table)
              .set({ deletedAt: null, updatedAt: Date.now(), dirty: true })
              .where(eq(cols.id, row.id));
            haptics.success();
          } catch (err) {
            reportError(err, { tag: "soft_delete_undo" });
          }
        },
      });
    } catch (err) {
      reportError(err, { tag: "soft_delete" });
    }
  }, [table, cols, row.id, toastMessage, undoLabel]);

  return { delete: remove };
}
