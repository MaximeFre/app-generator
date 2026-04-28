import { useMemo } from "react";
import { desc, isNull, and, eq } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/lib/db/client";

/**
 * Returns the most-recent row from a table so a "new entry" form can
 * pre-fill from the user's last input. Helps the app feel personalized after
 * a few uses without any cloud round-trip.
 *
 * Filters out soft-deleted rows automatically (rows with `deletedAt != null`).
 *
 * Optional `groupBy` narrows the scope — e.g. for an exercise log, pass
 * `groupBy: "exerciseId"` and `groupValue: "bench-press"` to get the user's
 * last bench-press entry rather than the last entry overall.
 */

type Opts<T> = {
  table: SQLiteTable;
  /** Column on the row to filter by. */
  groupBy?: keyof T;
  /** Value to match in `groupBy`. Required if `groupBy` is set. */
  groupValue?: T[keyof T];
};

export function useSmartDefaults<T extends { updatedAt: number; deletedAt?: number | null }>(
  opts: Opts<T>,
): { lastRow: T | null; isLoading: boolean } {
  const { table, groupBy, groupValue } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols = table as any;

  const query = useMemo(() => {
    const baseConditions = [isNull(cols.deletedAt)];
    if (groupBy && groupValue !== undefined && groupValue !== null) {
      baseConditions.push(eq(cols[groupBy as string], groupValue));
    }
    return db
      .select()
      .from(table)
      .where(and(...baseConditions))
      .orderBy(desc(cols.updatedAt))
      .limit(1);
  }, [table, cols, groupBy, groupValue]);

  const { data } = useLiveQuery(query);

  return {
    lastRow: ((data?.[0] as unknown) as T | undefined) ?? null,
    isLoading: data === undefined,
  };
}
