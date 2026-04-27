---
description: Expert local-first sync engine. Push/pull patterns, conflict resolution, soft deletes, dirty flags, lamport-ish updated_at, optimistic UI, offline queues, retry with backoff. Use when extending lib/db/sync.ts to a new table, debugging sync race conditions, or designing an offline-capable feature. Triggers `/local-first-sync`, "sync", "offline", "conflict", "local-first".
---

# Local-first sync — expert

## The model in this template

```
Free user                                  Premium user
   │                                            │
   ▼                                            ▼
expo-sqlite (Drizzle)               expo-sqlite (Drizzle)
                                           │
                                           ▼  on demand: settings → "Sync now"
                                       lib/db/sync.ts
                                           │
                                           ▼
                                      Supabase Postgres
                                           │
                                  pull on next sync from any device
```

Key property: **the app works exactly the same with or without sync**. Sync is an additive feature, not a dependency.

## Anatomy of a synced row

```ts
{
  id: text PK              // local-generated, stable across devices for the same user via sync
  serverId: text           // null until first push confirms — what the server calls it
  // ... business fields ...
  createdAt: timestamp_ms  // immutable, set on insert
  updatedAt: timestamp_ms  // bumped on every change (including local edits AND pull from server)
  dirty: boolean           // true = needs push to server
  deletedAt: timestamp_ms  // null = alive; set = soft-deleted
}
```

## The sync algorithm (current implementation)

```
1. PUSH:
   - select where dirty = true
   - upsert each to Supabase (using local_id as the user-scoped unique key)
   - on success: set serverId = returned id, dirty = false

2. PULL:
   - find max(updatedAt) where dirty = false
   - select from Supabase where user_id = ? and updated_at > max
   - upsert each into local with: dirty = false (server is authoritative for these)
```

This is **last-write-wins on `updated_at`**. Good enough for 95% of indie apps.

## When LWW is not enough

LWW loses concurrent edits silently. If user edits a row on Device A while offline, then on Device B online, then Device A reconnects: Device A's edit overwrites Device B's, despite being older.

Symptoms in the wild:
- User says "I added a note on my phone but it's gone after I opened it on my iPad".
- Race conditions in concurrent multi-device sessions (rare in indie apps, common in teams).

When you outgrow LWW, options:
- **Vector clocks**: store per-device counters. Heavy.
- **CRDTs** (Yjs, Automerge): last-write-wins but field-level. Best for collaborative editors.
- **Operational logs**: every change is an event. Replay to derive state. Used by WatermelonDB.

For v1, ship LWW. Document the limitation in a known-issues doc. Upgrade only when a real user complains.

## Soft delete is non-negotiable

Hard-deleting a row makes sync impossible (the other device has no signal that the row was deleted — it just sees its old row and re-pushes).

The pattern:
- Delete = `update set deletedAt = now(), dirty = true where id = ?`
- Sync push = upsert with `deleted_at` populated.
- Other device on pull = sees `deleted_at`, removes the row from local UI.
- Cleanup = a Supabase Edge Function (cron daily) hard-deletes rows past `deleted_at + 30 days`.

In your queries, always filter:
```ts
.where(isNull(items.deletedAt))
```

## Dirty flag is the source of truth for push

Every local mutation MUST set `dirty = true`. Every successful push MUST set `dirty = false`.

Easy to forget. Lint rule: search for `db.update(...)` or `db.insert(...)` without a `dirty: true` set in the same call. Adding a Drizzle pre-update hook would automate this — for v1, code review.

## Optimistic UI

The app updates local IMMEDIATELY (already does — Drizzle `useLiveQuery` re-renders). Sync is a background concern. If sync fails, the local edit stays — it's just `dirty = true` longer.

DO NOT:
- Show a spinner on "Save" buttons for a local-only operation. It feels broken.
- Wait for sync to confirm before showing the user's change.

DO:
- Show a tiny sync indicator in settings ("Last synced 2 min ago" / "Syncing..." / "Offline").
- Surface persistent errors only when they're truly stuck (e.g., auth expired).

## Sync triggers

Currently: manual via "Sync now" button on settings.

Other reasonable triggers:
- On app foreground (`AppState` listener) — but throttle to once per 30s.
- On entitlement change (user just upgraded to premium → pull initial state).
- On auth state change (user just signed in → pull their data).
- On poor connectivity → don't trigger; queue the dirty flag for next online.

Don't sync on every write. That's chatty and wastes battery.

## Connectivity awareness

```ts
import NetInfo from "@react-native-community/netinfo";

const { isConnected } = await NetInfo.fetch();
if (!isConnected) return { pushed: 0, pulled: 0 };
```

Add this to `syncItems` before any network call. Better UX than letting fetch time out.

## Retry with backoff

If a push fails (e.g., 5xx from Supabase), don't retry immediately — back off:

```ts
async function syncWithRetry(userId: string, attempt = 0): Promise<void> {
  try {
    await syncItems(userId);
  } catch (e) {
    if (attempt >= 3) {
      reportError(e, { tag: "sync_max_retries" });
      return;
    }
    const delay = Math.min(1000 * 2 ** attempt, 30_000);
    setTimeout(() => syncWithRetry(userId, attempt + 1), delay);
  }
}
```

Don't retry on 4xx — those are auth/RLS issues that won't fix themselves.

## Generalizing to new tables

The current `syncItems` is hardcoded to one table. For multiple tables, refactor to a registry:

```ts
type SyncedTable<T> = {
  drizzle: SQLiteTableWithColumns<any>;
  supabaseTable: string;
  toSupabaseRow: (local: T) => Record<string, any>;
  fromSupabaseRow: (remote: any) => T;
};

const REGISTRY: SyncedTable<any>[] = [
  itemsSync,
  notesSync,
  // ...
];

export async function syncAll(userId: string) {
  for (const table of REGISTRY) {
    await syncOne(userId, table);
  }
}
```

Don't refactor preemptively — wait until you have 2 tables to actually sync.

## Anti-patterns

- ❌ Hard-deleting rows on synced tables.
- ❌ Forgetting `dirty = true` on update.
- ❌ Setting `dirty = false` outside the sync engine.
- ❌ Pulling EVERY row on every sync (use `updated_at > since` always).
- ❌ Storing the "last synced timestamp" globally instead of derived from `max(updated_at)`. Globals get stale; derived doesn't.
- ❌ Syncing while user is mid-typing in a text field — can cause keyboard flicker if you re-render the row from server.

## Performance

- Push and pull batch in a single `upsert(payload[])` call.
- Pull more aggressive than push: pulling 500 rows is fine; pushing 500 means user has been offline a long time.
- Index `(user_id, updated_at)` on Postgres is critical for pull performance.

## Testing

The hard test: sign in as the same user on two devices/simulators. Mutate on A while B is open. Watch B reflect the change after sync interval.

Then go offline on A, mutate on A, mutate the SAME row on B, bring A back online. Watch the conflict resolution. Document who won.
