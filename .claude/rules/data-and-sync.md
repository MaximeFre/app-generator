---
description: Local-first invariants, sync rules, RLS expectations.
paths: ["lib/db/**/*.ts", "lib/supabase/**/*.ts", "app/**/*.tsx"]
---

# Data & sync

## Local-first invariants

- All user-generated data hits `expo-sqlite` via Drizzle FIRST.
- Cloud is mirror, not source. If sync fails, the app keeps working.
- Every table on Supabase that mirrors a local table MUST have:
  - `id` (text, server-side uuid)
  - `local_id` (text, the SQLite primary key)
  - `user_id` (text, references `auth.users.id`)
  - `updated_at` (timestamptz, default now())
  - `deleted_at` (timestamptz, nullable — soft delete)
  - RLS: `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE.

## Dirty flags

- Local rows have `dirty: boolean` (default true on insert/update).
- Sync sets `dirty=false` after server confirms.
- Never set `dirty=false` without a successful upsert response.

## Premium gate at write boundary

- Cloud writes (`syncItems`, any direct supabase mutation) MUST check `useEntitlements.getState().isPremium`.
- Free users can use the entire app — they just don't sync.

## Conflict resolution

- Last-write-wins on `updated_at`. Don't invent merge logic without a real bug.
- If a row exists locally with `serverId=null` and on remote with same `local_id`, server row wins after first sync.

## Migrations

- Add column → write generated migration → ALSO write SQL migration for Supabase Postgres in `supabase/migrations/` (when that folder exists).
- Never destructive migrations on Postgres (no DROP COLUMN) without a release-flag plan.

## RLS — minimum policy template

```sql
alter table public.items enable row level security;

create policy "items_owner_select" on public.items
  for select using (auth.uid() = user_id);

create policy "items_owner_insert" on public.items
  for insert with check (auth.uid() = user_id);

create policy "items_owner_update" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "items_owner_delete" on public.items
  for delete using (auth.uid() = user_id);
```

## Anti-patterns

- ❌ Bypassing Drizzle to call `sqlite.execAsync` raw SQL outside of migrations.
- ❌ Reading from Supabase before reading from local.
- ❌ Forgetting to mark a row `dirty=true` on update.
- ❌ Cascading deletes without soft-delete first.
