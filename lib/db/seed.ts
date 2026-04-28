import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "./client";
import { reportError } from "@/lib/sentry/client";

/**
 * One-shot seed runner. Call from `app/_layout.tsx` after `ensureMigrations()`.
 *
 * A seed describes a set of rows to insert into a table on first run. Each
 * seed has a `version`; once a (table,version) pair has been applied it
 * never runs again. Add a new seed by bumping the version.
 *
 * Idempotent: safe to call on every app boot. The flag lives in AsyncStorage
 * (`seed_v1_done` keyed by table + version) — no DB roundtrip in the common
 * "already seeded" path.
 *
 * Inserts use `onConflictDoNothing` so reseeding a partially-applied seed
 * doesn't crash; pick stable PKs in your seed rows.
 */

export type Seed<T extends Record<string, unknown> = Record<string, unknown>> = {
  /** Drizzle table to insert into. */
  table: SQLiteTable;
  /** Rows to insert. Each row must include a stable primary key. */
  rows: T[];
  /** Version number; bumping it forces the seed to re-run. */
  version: number;
  /**
   * Optional name for the storage flag. Defaults to the SQLite table name.
   * Useful when two seeds touch the same table with different intents.
   */
  name?: string;
};

function flagKey(seed: Seed): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableName = seed.name ?? ((seed.table as any)?.[Symbol.for("drizzle:Name")] ?? "table");
  return `seed:${String(tableName)}:v${seed.version}`;
}

export async function ensureSeed(seeds: Seed[]): Promise<void> {
  for (const seed of seeds) {
    const key = flagKey(seed);
    try {
      const done = await AsyncStorage.getItem(key);
      if (done === "1") continue;

      if (seed.rows.length > 0) {
        // Drizzle's typed insert wants the table-specific shape; we drop into
        // unknown here because the runner is intentionally generic.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.insert(seed.table) as any).values(seed.rows).onConflictDoNothing();
      }
      await AsyncStorage.setItem(key, "1");
    } catch (err) {
      reportError(err, { tag: "seed", key });
      // Don't throw: a broken seed shouldn't brick the app.
    }
  }
}

/** Forget every seed flag. Tests / dev tools only — never call in prod. */
export async function _resetSeedFlags(seeds: Seed[]): Promise<void> {
  await Promise.all(seeds.map((s) => AsyncStorage.removeItem(flagKey(s))));
}
