# app-generator

A clonable template for spinning up new mobile apps fast. Clone the repo → run `/generate-app` → answer a brief → get a working Expo app tailored to your idea, with the full free-tier-first stack already wired up.

## What's in the box

**App template (Expo SDK 54)**
- expo-router (typed routes, file-based)
- NativeWind v4 (Tailwind for React Native) with CSS-var design tokens + dark mode
- Auth flow: Supabase email + magic link, sign-in / sign-up / reset
- Local DB: Drizzle ORM + expo-sqlite (free tier = 100% local, no cloud needed)
- Lazy cloud sync: Supabase Postgres (premium-only, soft-delete, dirty flags, last-write-wins)
- Paywall: RevenueCat with one entitlement (`premium`), prebuilt UI, restore, sandbox-ready
- Crash: Sentry sampled at 0.1 in prod, ignored Network noise
- Analytics: PostHog with a strict 6-event allowlist
- i18n: custom FR/EN with parity hook
- TypeScript strict, no `any`, ESLint via expo-lint

**Claude pipeline (`/generate-app`)**
- 10 sub-agents under `.claude/agents/` (strategy → branding → design → architecture → schema → paywall → copy → code → backend → QA)
- 12 expert skills under `.claude/skills/` (expo-bootstrap, nativewind-design, supabase-schema, drizzle-local-first, revenuecat-paywall, sentry-rn-minimal, posthog-events-allowlist, expo-eas-deploy, mobile-store-listing, cost-guardrails, local-first-sync, mobile-ux-patterns)
- 7 enforcement rules under `.claude/rules/`
- Hooks: i18n parity check + typecheck on Edit/Write, billing guardrail on Bash

## Quick start

```bash
# 1. Clone and install
git clone <this-repo> my-app
cd my-app
npm install

# 2. Copy env template (fill keys later — auth/cloud are optional for first run)
cp .env.example .env

# 3. Generate migrations (the template has one schema, drizzle-kit handles it)
npm run db:generate

# 4. Run on iOS Simulator (or Android emulator)
npx expo start
# → press `i` for iOS, `a` for Android, `w` for web
```

For native modules (RevenueCat) on a real device, you need a dev client build:
```bash
npx expo prebuild --clean
npx eas-cli build --profile development --platform ios   # or android
```

## Generating a new app

Inside Claude Code in this repo:

```
/generate-app

(then describe your app idea — persona, free vs premium, bilingual or not)
```

The pipeline pauses 4 times for GO / REFAIRE / AJUSTER:
1. After branding (name + tagline + tone)
2. After design system (palette + typo + icon concept)
3. After paywall (pricing + triggers)
4. After copy (FR/EN voice samples)

At the end you get:
- `.planning/*.md` — your design memory (commit it).
- Updated `app.json`, schema, screens, components, copy.
- `.planning/backend-setup.md` — checklist to set up Supabase, RevenueCat, Sentry, PostHog (all free tier).
- `.planning/qa-report.md` — green light or fix list.

## The pricing model the template enforces

| Capability | Free | Premium |
|---|---|---|
| Use the app, all core features | ✅ | ✅ |
| Local data (unlimited rows on device) | ✅ | ✅ |
| Cloud sync, multi-device | ❌ | ✅ |
| Long history past N items / N days | ❌ | ✅ |
| Exports (CSV/PDF) | ❌ | ✅ |
| Cloud backup | ❌ | ✅ |

Free users **never trigger Supabase writes** (auth opt-in only). 6 PostHog events max. Sentry sampled.

## Cost reality

At zero usage: **0 €/mo**.

Once you have ~1k MAU on a single app:
- Supabase Free: ✅ until ~50k MAU or 500MB DB.
- RevenueCat Free: ✅ until $2.5k/mo MTR.
- PostHog Free: ✅ until 1M events/mo (with the strict allowlist, you'd need 30k+ MAU).
- Sentry Free: ✅ until 5k errors/mo (with 0.1 sampling, plenty of headroom).
- EAS Free: ✅ until 30 builds/mo (use local builds for dev iteration).

Run `/cost-audit` before each release to see real numbers.

Fixed unavoidable costs once you ship:
- Apple Developer Program: $99/year.
- Google Play Console: $25 one-time.

## Useful slash commands

| Command | What it does |
|---|---|
| `/generate-app` | Full pipeline: brief → tailored app |
| `/cost-audit` | Check current free-tier usage |
| `/expo-bootstrap` | Help with Expo SDK / EAS setup |
| `/nativewind-design` | Help with theming / NativeWind issues |
| `/supabase-schema` | Help with Postgres + RLS |
| `/drizzle-local-first` | Help with local schema / queries |
| `/revenuecat-paywall` | Help with paywall / subscription config |
| `/sentry-rn-minimal` | Help with Sentry setup / sampling |
| `/posthog-events-allowlist` | Help with analytics / events |
| `/expo-eas-deploy` | Help with EAS build / submit / OTA |
| `/mobile-store-listing` | Help writing App Store / Play listing |
| `/local-first-sync` | Help extending the sync engine |
| `/mobile-ux-patterns` | Help with UX patterns / navigation |
| `/self-update` | Reflective pass to propose rule/skill updates from session signals |

Plus the global skills (already installed in your `~/.claude`): `ui-ux-pro-max`, `humanizer`, `web-design-guidelines`, `landing-page-copywriter`, `seo`, etc.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — folder layout, import rules, boot sequence.
- [`docs/data-sync.md`](docs/data-sync.md) — local-first model, sync engine, conflicts.
- [`docs/design-system.md`](docs/design-system.md) — tokens, theming, dark mode.
- [`docs/i18n.md`](docs/i18n.md) — adding keys, parity hook.
- [`docs/components/README.md`](docs/components/README.md) — primitives + domain components catalog.
- [`docs/user-guide.md`](docs/user-guide.md) — workflows for the dev cloning the template.

## Project layout

```
app/
  _layout.tsx           ← root: providers, splash, init
  index.tsx             ← redirect to (tabs)
  (tabs)/
    _layout.tsx         ← bottom tabs
    index.tsx           ← Home (sample local-first list)
    settings.tsx        ← Settings + paywall trigger
  auth/
    _layout.tsx
    sign-in.tsx
    sign-up.tsx
  paywall.tsx           ← modal route, RC prebuilt UI

components/
  ui/                   ← Button, Input, Screen primitives
  paywall/PremiumGate.tsx

lib/
  env.ts                ← env reading + featureFlags
  utils.ts              ← cn() helper
  db/{client,schema,sync}.ts
  supabase/client.ts
  store/auth.ts
  sentry/client.ts
  analytics/{events,posthog}.ts
  revenuecat/{client,entitlements}.ts
  i18n/index.ts

messages/{fr,en}.json   ← in-app copy (parity-checked)
drizzle/                ← migrations (committed)

.claude/
  CLAUDE.md → ../CLAUDE.md  (project rules)
  settings.json
  settings.local.json
  rules/                ← architecture, design, content, costs, expo-rn, security, data-and-sync
  agents/               ← 10 sub-agents
  skills/               ← /generate-app + 12 expert skills
  scripts/              ← hooks (i18n parity, typecheck, billing guardrail)
```

## License

MIT — fork and ship.
