# app-generator — repo guide for Claude

## What this repo is

A **template** to clone every time you start a new mobile app. After cloning, you run `/generate-app` and a Claude pipeline produces a tailored, ready-to-code Expo app for the idea you describe.

The base template ships with everything wired up:
- Expo SDK 54 + expo-router (typed routes, file-based)
- NativeWind v4 (Tailwind for RN)
- Supabase auth (email + magic link) — premium-only feature
- Drizzle ORM + expo-sqlite (free tier = 100% local)
- Lazy sync to Supabase Postgres (premium-only)
- RevenueCat paywall (entitlement: `premium`)
- Sentry minimal (sampled 0.1 in prod, ignored Network errors)
- PostHog with a strict 6-event allowlist
- Custom i18n (FR/EN) with parity hook

## Pricing model the template enforces

- **Free** : utiliser l'app, données locales (SQLite), features de base, pas de cloud.
- **Premium** : compte, sync cloud Supabase, multi-device, exports, history long, IA si ajoutée plus tard.

Free users never trigger Supabase/cloud writes — only RevenueCat trial activations and 6 PostHog events.

## Stack — sources of truth

| Concern | File | Note |
|---|---|---|
| Env / feature flags | `lib/env.ts` | `featureFlags.cloudSyncEnabled` etc. |
| DB schema (local + remote mirror) | `lib/db/schema.ts` | Drizzle. Same shape on Supabase. |
| Sync engine | `lib/db/sync.ts` | Push dirty → upsert → pull newer. Premium-only. |
| Auth state | `lib/store/auth.ts` | Zustand + Supabase. |
| Paywall entitlement | `lib/revenuecat/entitlements.ts` | One entitlement: `premium`. |
| Analytics events | `lib/analytics/events.ts` | **Allowlist** — 6 events. Adding one needs review. |
| i18n | `lib/i18n/index.ts` + `messages/{fr,en}.json` | Dot-notation keys, parity enforced by hook. |
| Theme tokens | `global.css` + `tailwind.config.js` | Edit `global.css` only. |

## Hard rules (also encoded in `.claude/rules/`)

1. **Never bypass `featureFlags.cloudSyncEnabled`.** If Supabase isn't configured, all cloud paths must be no-ops, not crashes.
2. **Never add a PostHog event without updating `lib/analytics/events.ts` allowlist** — and adding it to a `EventProps` type. No string-typed `capture` calls.
3. **Never hardcode colors.** Use semantic Tailwind tokens (`text-foreground`, `bg-muted`). Edit tokens in `global.css` only.
4. **i18n parity is a hook**: every key in `fr.json` must exist in `en.json` and vice versa.
5. **No new screens without checking the registry pattern**: tabs go in `app/(tabs)/`, modals at `app/`, auth in `app/auth/`.
6. **Premium-gate at the feature boundary**, not in the UI: use `<PremiumGate feature="...">`.
7. **Sentry sampling stays at 0.1 in production.** No exceptions. If you need more, send it to PostHog.
8. **Free tier writes only to SQLite.** Cloud writes require an authenticated user AND `useEntitlements.getState().isPremium`.

## Pipeline `/generate-app`

The `/generate-app` skill orchestrates 10 sub-agents. See `.claude/skills/generate-app/SKILL.md` and `pipeline.md`.

```
Brief → branding → design tokens → app architecture (screens + free/premium split)
      → DB schema (Drizzle + Supabase mirror) → paywall strategy
      → copy → code generation → backend setup (cost-guarded) → validation
```

Checkpoints (4) pause for user GO/REFAIRE/AJUSTER feedback.

## Hooks

- **PostToolUse** `Edit|Write` → `check-i18n-parity.sh` + `typecheck-touched.sh`
- **PreToolUse** `Bash` → `billing-guardrail.sh` (blocks paid commands unless `ALLOW_PAID=1`)

## Self-update

The pipeline is supposed to get sharper every run. After `/generate-app` (or any meaningful work), invoke `/self-update` to propose rule / skill / agent updates from the session's signals — corrections, drift, validated non-obvious choices. Never auto-applied. See `.claude/rules/self-update.md` and `.claude/skills/self-update/SKILL.md`.

Per-agent memory lives in `.claude/agent-memory/{agent}.md` (read at the start of an agent run, written via `/self-update`).

## Docs

Project documentation lives in `docs/`:
- `architecture.md` — folder layout, import rules, boot.
- `data-sync.md` — local-first model + sync engine.
- `design-system.md` — tokens + theming.
- `i18n.md` — keys + parity hook.
- `components/README.md` — primitives + domain catalog.
- `user-guide.md` — dev workflows.

Read the relevant doc before touching its area.

## Don't touch

- `components/ui/` primitives — composed everywhere. Edit a primitive only if the change is universal.
- `app.json` plugins array without checking compatibility (Expo SDK pinned).
- `tailwind.config.js` color shape — `tailwind.config.js` reads CSS vars from `global.css`.

## Adding a feature — checklist

1. **Free or premium?** If premium, wrap with `<PremiumGate feature="x">` AND check entitlement in any data write.
2. **Need a new table?** Add to `lib/db/schema.ts`, run `npm run db:generate`, mirror on Supabase if synced.
3. **Need a new event?** Add to `ANALYTICS_EVENTS` AND `EventProps` in `lib/analytics/events.ts`.
4. **Need new copy?** Add keys to BOTH `messages/fr.json` AND `messages/en.json`.
5. **Type-check before commit:** `npm run typecheck`.
