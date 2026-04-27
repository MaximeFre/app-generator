/**
 * Generated on first `npm run db:generate`. This stub keeps imports happy.
 * After running `drizzle-kit generate`, drizzle-kit will create real migration
 * files in this directory and a `_journal.json`. Replace this stub by
 * importing the generated `migrations` from drizzle-orm.
 */
const migrations = { journal: { entries: [] }, migrations: {} };
export default migrations as unknown as Parameters<
  typeof import("drizzle-orm/expo-sqlite/migrator").migrate
>[1];
