import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import migrations from "@/drizzle/migrations";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import * as schema from "./schema";

const sqlite = SQLite.openDatabaseSync("app.db", { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

let migrationsRun = false;

export async function ensureMigrations(): Promise<void> {
  if (migrationsRun) return;
  await migrate(db, migrations);
  migrationsRun = true;
}

export { schema };
