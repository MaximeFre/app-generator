---
description: Expert Supabase Postgres schema + Row Level Security. DDL templates, RLS policies, auth integration, performance indexes, gotchas (auth.uid() in policies, RLS on views, soft deletes). Use when designing tables that mirror Drizzle schema, writing migrations, hardening RLS, or debugging "permission denied" errors. Triggers `/supabase-schema`, "supabase", "RLS", "row level security", "postgres migration", "auth.uid".
---

# Supabase schema — expert

## Mental model

Supabase = Postgres + auth + storage + realtime + edge functions, all behind PostgREST. The mobile app talks to Postgres with the **anon key**. RLS is the security boundary — without it, anyone can read everything.

## Default schema for synced tables (mirrors Drizzle local)

Every table that mirrors local SQLite must have these 6 fields PLUS `user_id`:

```sql
create table public.{name} (
  id uuid primary key default gen_random_uuid(),
  local_id text not null,                              -- the SQLite primary key
  user_id uuid not null references auth.users(id) on delete cascade,

  -- business columns here

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                               -- soft delete
);

create unique index {name}_user_local on public.{name}(user_id, local_id);
create index {name}_updated on public.{name}(user_id, updated_at);
```

Why `(user_id, local_id)` unique: the sync engine upserts by local_id; multiple users can have the same local_id (UUIDs are unique per user, not globally).

## RLS — minimum 4 policies per table

```sql
alter table public.{name} enable row level security;

create policy "{name}_owner_select" on public.{name}
  for select using (auth.uid() = user_id);

create policy "{name}_owner_insert" on public.{name}
  for insert with check (auth.uid() = user_id);

create policy "{name}_owner_update" on public.{name}
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "{name}_owner_delete" on public.{name}
  for delete using (auth.uid() = user_id);
```

**Why both `using` AND `with check` on update**: `using` gates which rows are visible to the operation; `with check` gates the new values. A user could otherwise UPDATE their row to set `user_id` to someone else.

## auth.uid() — gotchas

- `auth.uid()` returns NULL for anon users. RLS policies using `auth.uid() = ...` will deny anon. That's correct.
- In a policy, NEVER subquery `auth.users` — too slow, evaluated per row. Use `auth.uid()` directly.
- For service role keys (server-only), RLS is bypassed by default. Don't expose service role keys to the mobile app.

## Indexes — what you actually need

| Query pattern | Index |
|---|---|
| `where user_id = ? and updated_at > ?` (sync pull) | `(user_id, updated_at)` |
| `where user_id = ? and local_id = ?` (upsert) | unique `(user_id, local_id)` |
| `where user_id = ? and deleted_at is null order by created_at desc` | partial: `(user_id, created_at) where deleted_at is null` |
| Full-text search on a column | `to_tsvector` GIN index. Don't enable until you need it. |

Don't pre-index every column. Each index slows writes and uses storage (counts against the 500MB free limit).

## Auth integration

- Email + password: `supabase.auth.signUp({ email, password })`. Supabase sends a confirmation email by default (configurable).
- Magic link: `supabase.auth.signInWithOtp({ email })`. Email contains a deep link to your scheme.
- For mobile deep links to work: in Supabase dashboard → Authentication → URL Configuration → Site URL = `apptemplate://` (your scheme).

### Profile rows

If you need user metadata beyond what `auth.users` provides, create a `public.profiles` table:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "own_profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on user signup
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end; $$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

## Soft delete + sync

The `deleted_at` field lets sync push deletions without a separate "tombstone" log:
- Local: set `deletedAt = Date.now(), dirty = true`.
- Sync push: upserts with `deleted_at` populated.
- Sync pull: when other device fetches, sees `deleted_at`, removes locally.
- After 30 days (cron edge function), hard-delete server rows past `deleted_at + 30 days`.

## Migrations

Use the Supabase CLI for repeatable migrations:

```bash
supabase init                     # one-time, scaffolds supabase/ folder
supabase migration new add_items  # creates timestamped SQL file
supabase db push                  # applies to remote
```

Commit the migration files. Don't apply schema changes via the SQL editor in the dashboard — they won't be reproducible.

## Forbidden patterns

- ❌ Disabling RLS on a table that has user data ("just for testing"). Forget once = breach.
- ❌ Storing tokens or secrets in a `public.*` table. Use Supabase Vault or env.
- ❌ `policy ... for select using (true)` — anyone can read.
- ❌ Foreign keys across users (e.g., `user_id` references `team_id` references `auth.users` — multi-tenant needs more care).
- ❌ Realtime subscriptions on free tier without traffic estimate (separate quota).

## Verifying RLS

Test as user A, then as user B:

```sql
-- as user A (in SQL editor: set role authenticated; set local jwt.claims.sub = '<A-uuid>')
select * from public.items;  -- should return A's rows
-- now switch to user B
set local jwt.claims.sub = '<B-uuid>';
select * from public.items;  -- should return ZERO of A's rows
```

A more practical test: sign in as A in the app, snoop with `select * from items` via service role and confirm `user_id = A`. Sign in as B, confirm B can't see A's rows.

## Performance

- Free tier: 500 MB DB, shared compute, 2GB egress/month.
- `select *` on a large table is fine if you have the right index. Otherwise add `limit 50` and paginate.
- Avoid `count(*)` on big tables — use `head: true, count: 'estimated'` in the JS client.

## Auth hooks for analytics

When a user signs up or logs in, fire `identify(userId, { email })` from `lib/analytics/posthog.ts` AND `setUserContext({ id, email })` from `lib/sentry/client.ts`. The auth store's `init()` hooks `onAuthStateChange` — attach these calls there if not already.
