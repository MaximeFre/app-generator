# Data & sync

The local-first model. Read this before adding a table or touching the sync engine.

## The promise

The app works **identically** whether the user is offline, free, or premium.

| Scenario | Local DB | Cloud |
|---|---|---|
| Offline forever | full read/write | n/a |
| Online, free user | full read/write | not touched |
| Online, premium user | full read/write | bidirectional sync, async |

Cloud is a mirror, never a dependency.

## Stack

- **Local**: `expo-sqlite` (native SQLite), accessed through **Drizzle ORM**.
- **Remote**: **Supabase Postgres** with Row Level Security.
- **Sync engine**: `lib/db/sync.ts` — handwritten push/pull, ~50 lines.

## The synced row shape

Every table that mirrors local ↔ remote has these 6 metadata fields PLUS the user_id on Postgres:

```
id           text primary key       (local UUID, generated client-side)
serverId     text nullable          (Postgres UUID, null until first push)
createdAt    integer ms epoch       (immutable)
updatedAt    integer ms epoch       (bumped on every change)
dirty        integer 0/1            (1 = needs push)
deletedAt    integer ms epoch null  (soft delete; null = alive)
```

Plus the business columns (`title`, `notes`, `isDone`, …).

On Postgres:

```
id          uuid primary key default gen_random_uuid()
local_id    text not null
user_id     uuid not null references auth.users(id) on delete cascade
created_at  timestamptz default now()
updated_at  timestamptz default now()
deleted_at  timestamptz null
-- + business columns matching the local schema
```

Plus a unique index `(user_id, local_id)` and a regular index `(user_id, updated_at)`.

## RLS — the security boundary

The mobile app uses the Supabase **anon key**. Without RLS, any user could read everyone's data. Every synced table needs all 4 policies:

```sql
alter table public.{table} enable row level security;

create policy "{table}_owner_select" on public.{table}
  for select using (auth.uid() = user_id);
create policy "{table}_owner_insert" on public.{table}
  for insert with check (auth.uid() = user_id);
create policy "{table}_owner_update" on public.{table}
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "{table}_owner_delete" on public.{table}
  for delete using (auth.uid() = user_id);
```

Enforced by the agent `db-schema-designer` and the rule `data-and-sync.md`.

## Sync algorithm

```
1. Guard:
   - if !cloudSyncEnabled → return
   - if !isPremium → return
   - (optional, recommended) if offline → return

2. PUSH:
   - select * where dirty = 1
   - upsert each to Supabase
   - on success: update local with serverId, dirty = 0

3. PULL:
   - localMax = max(updatedAt) where dirty = 0
   - select from Supabase where user_id = ? and updated_at > localMax
   - upsert into local with dirty = 0
```

Conflict resolution: **last-write-wins on `updated_at`**. Good enough for indie apps; not safe for collaborative editing. See `.claude/skills/local-first-sync/SKILL.md` § "When LWW is not enough" for upgrade paths.

## Dirty flag invariants

The sync engine relies on `dirty` being honest:

- Insert → `dirty = 1` (default in schema).
- Update → caller MUST set `dirty: true, updatedAt: Date.now()`.
- Delete → caller MUST set `deletedAt, dirty: true` (soft delete; never hard delete a synced row).
- After successful push → engine sets `dirty = 0, serverId = <returned>`.

**Never set `dirty = 0` outside the sync engine.** Easy to forget on a fresh table — code-review for this.

## Soft delete only

Hard-deleting a row breaks sync (other devices have no signal that the row was deleted, they just see their old version and re-push it).

```ts
// ❌ wrong:
await db.delete(items).where(eq(items.id, id));

// ✅ right:
await db.update(items)
  .set({ deletedAt: Date.now(), dirty: true, updatedAt: Date.now() })
  .where(eq(items.id, id));
```

In all your read queries, filter:

```ts
.where(isNull(items.deletedAt))
```

After 30 days, a Supabase cron Edge Function can hard-delete rows past `deleted_at + 30d` to free space.

## Triggering sync

Today: manual via the **Sync now** button on Settings.

Reasonable additions later:
- App foreground (throttle to 1×/30s).
- Auth state change (just signed in → pull).
- Entitlement change (just upgraded → pull initial state).

NOT recommended: sync on every write. Battery + network waste.

## Adding a new synced table

1. Add to `lib/db/schema.ts` with the 6 sync fields:
   ```ts
   export const notes = sqliteTable("notes", {
     id: text("id").primaryKey(),
     serverId: text("server_id"),
     content: text("content").notNull(),
     createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
     updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
     dirty: integer("dirty", { mode: "boolean" }).notNull().default(true),
     deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
   });
   ```
2. Run `npm run db:generate`. Drizzle-kit produces a migration in `drizzle/`.
3. Mirror on Postgres with the DDL + RLS template above. Apply via Supabase migrations.
4. Extend `lib/db/sync.ts` with a `syncNotes(userId)` function (copy `syncItems`, swap table). Or generalize via a registry — only worth it past 3 tables.

## Adding a local-only table

For caches, prefs, search history — anything that should NEVER leave the device:

```ts
export const preferences = sqliteTable("preferences", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
```

No sync metadata, no `user_id`, never touch Supabase. This data is wiped if the user reinstalls — that's a feature.

## Querying

Reactive (in components):

```tsx
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { isNull } from "drizzle-orm";

const { data } = useLiveQuery(
  db.select().from(items).where(isNull(items.deletedAt))
);
```

`useLiveQuery` re-runs on any mutation to the queried tables (thanks to `enableChangeListener: true` on `openDatabaseSync`).

Imperative (in actions):

```ts
await db.insert(items).values({ id: newId(), title });
await db.update(items).set({ isDone: true, dirty: true, updatedAt: Date.now() }).where(eq(items.id, id));
```

For multi-write atomicity:

```ts
await db.transaction(async (tx) => {
  await tx.insert(...);
  await tx.update(...);
});
```

## ID generation

Synced tables MUST use text UUIDs (autoincrement integers collide across devices):

```ts
function newId(prefix = "local") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
```

For deterministic IDs (e.g., importing from another source), use `crypto.randomUUID()` from `expo-crypto`.

## Migrations

```bash
npm run db:generate     # diff schema.ts → produces drizzle/0000_*.sql
```

The migrations folder is committed. At runtime, `lib/db/client.ts` runs `migrate(db, migrations)` once via `ensureMigrations()` (called from `app/_layout.tsx`).

Don't manually edit the generated SQL. Edit `schema.ts`, regenerate.

For Postgres, use the Supabase CLI:

```bash
supabase migration new add_notes_table
# paste DDL + RLS into the new file
supabase db push
```

Commit those too.

## Common errors

- **"no such table"** → migrations didn't run. Confirm `await ensureMigrations()` happens BEFORE the first query in `app/_layout.tsx`.
- **`useLiveQuery` doesn't update** → `openDatabaseSync` was called without `{ enableChangeListener: true }`. Already fixed in `lib/db/client.ts`.
- **Sync silently does nothing** → check `featureFlags.cloudSyncEnabled` AND `useEntitlements.getState().isPremium`. Both required.
- **"permission denied for table"** on Supabase → RLS policy is missing or the user isn't authenticated.
- **Duplicates after sync** → check the unique index `(user_id, local_id)` on Postgres. Without it, upserts collide.

## Performance

SQLite handles tens of thousands of rows without indexes. Past 100k:
- Add Drizzle indexes on filter columns: `index("items_done").on(items.isDone)`.
- Paginate list queries: `.limit(50).offset(page * 50)`.
- Avoid `select *` on text-heavy rows; project only what's rendered.

For sync:
- Batch in single `upsert(payload[])` call — already the case.
- Pull pages of 500 max if you've been offline a while; otherwise unbounded select can OOM Metro.

## What this engine does NOT do

- ❌ Real-time collaboration (concurrent edits silently lose to LWW).
- ❌ Offline conflict UI.
- ❌ Schema migration of cloud data already in production.
- ❌ Cross-table transactions across local/cloud.

For all of these, you're outgrowing the template — consider WatermelonDB or a CRDT layer.
