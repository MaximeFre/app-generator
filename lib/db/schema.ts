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
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  dirty: integer("dirty", { mode: "boolean" }).notNull().default(true),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
