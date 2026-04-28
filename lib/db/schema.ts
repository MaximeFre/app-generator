import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Local-first schema. Mirror the same shape on Supabase Postgres for premium sync.
 * Each row has `serverId` (null until synced), `updatedAt` (lamport-ish), and `dirty` flag.
 */
export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  serverId: text("server_id"),
  title: text("title").notNull(),
  notes: text("notes"),
  isDone: integer("is_done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
  dirty: integer("dirty", { mode: "boolean" }).notNull().default(true),
  deletedAt: integer("deleted_at"),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

/**
 * Local-only mirror of the Zustand preferences store.
 *
 * Singleton: the row id is always "default". This is rarely queried directly
 * — `usePreferences` (lib/store/preferences.ts) is the working surface — but
 * having it in SQLite lets future features join against it (e.g. a workout
 * row that needs to know the user's unit preference at write time).
 *
 * No `serverId` / `dirty` / sync fields: preferences never leave the device.
 */
export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey().default("default"),
  hasOnboarded: integer("has_onboarded", { mode: "boolean" }).notNull().default(false),
  name: text("name"),
  locale: text("locale").notNull().default("en"),
  unitsWeight: text("units_weight").notNull().default("kg"),
  unitsDistance: text("units_distance").notNull().default("km"),
  themePreference: text("theme_preference").notNull().default("system"),
  reminderTime: text("reminder_time"),
  notificationConsent: integer("notification_consent", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
