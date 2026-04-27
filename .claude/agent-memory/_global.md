# Global memory — cross-cutting lessons

Patterns that apply across multiple agents. Filled in over time via `/self-update`.

<!-- Format:
## YYYY-MM-DD — {short title}
**Signal**: what happened.
**Applies to**: list of agents.
**Why it matters**: cost if it repeats.
**Update**: what to do differently.
-->

## 2026-04-28 — Expo SDK 51 is the working pin, not 54
**Signal**: First `npm install` failed with `ERESOLVE: react@18.3.1` vs `react-native@0.74.5` (RN 0.74 demands React 18.2.0). Initial `package.json` declared `expo: ~54.0.0` with mismatched React/RN.
**Applies to**: `code-generator`, `expo-bootstrap` skill, `app-architect`.
**Why it matters**: Wrong version pins block the entire pipeline at first install. User can't even open the project. ~10 min to debug.
**Update**: Pin `expo: ~51.0.39`, `react: 18.2.0`, `react-native: 0.74.5`, `@types/react: ~18.2.79`, `@sentry/react-native: ~5.24.3`, `newArchEnabled: false` in `app.json`. Version matrix added to `expo-bootstrap` SKILL.md.

## 2026-04-28 — Drizzle integer columns: never use `mode: "timestamp_ms"`
**Signal**: Code-generator wrote `Date.now()` to columns declared `mode: "timestamp_ms"`. TS error: `'number' is not assignable to type 'Date | SQLWrapper'`. Hit on `app/(tabs)/index.tsx` and `lib/db/sync.ts`.
**Applies to**: `db-schema-designer`, `code-generator`, `drizzle-local-first` skill, `data-and-sync` rule.
**Why it matters**: Forces a choice between rewriting every callsite to `new Date()` or fighting Drizzle types. Adds 5+ TS errors.
**Update**: Use plain `integer("created_at").default(sql\`(unixepoch() * 1000)\`)` for ms-epoch fields. Hard rule in `db-schema-designer` agent + `data-and-sync.md`.

## 2026-04-28 — Drizzle SQL imports need babel-plugin-inline-import + Metro sourceExts
**Signal**: Bundle crashed with `SyntaxError: Missing semicolon (1:6)` on `drizzle/0000_*.sql` because Babel parsed it as JS. Removing it from `sourceExts` flipped to `Unable to resolve module`.
**Applies to**: `code-generator`, `expo-bootstrap`, `drizzle-local-first`.
**Why it matters**: Bundle is unbuildable — fatal at boot.
**Update**: Always install `babel-plugin-inline-import` AND keep `config.resolver.sourceExts.push("sql")` in `metro.config.js`. The babel plugin must be in plugins array (not presets), reanimated plugin last.

## 2026-04-28 — NativeWind v4: drop `nativewind/babel`
**Signal**: babel.config.js with `presets: ["nativewind/babel"]` triggered `Cannot find module 'nativewind/babel'`. The preset existed in v2, removed in v4.
**Applies to**: `code-generator`, `nativewind-design` skill.
**Why it matters**: Build fails immediately.
**Update**: NativeWind v4 wires only via `metro.config.js` `withNativeWind(...)`. Babel preset is just `["babel-preset-expo", { jsxImportSource: "nativewind" }]`.

## 2026-04-28 — PostHog RN: option name is `captureNativeAppLifecycleEvents`
**Signal**: `captureAppLifecycleEvents: false` → TS error `does not exist in type 'PostHogOptions'. Did you mean to write 'captureNativeAppLifecycleEvents'?`.
**Applies to**: `code-generator`, `posthog-events-allowlist` skill.
**Why it matters**: TS error blocks the typecheck gate.
**Update**: Always use `captureNativeAppLifecycleEvents`. Skill + agents updated.

## 2026-04-28 — Sentry RN: no `profilesSampleRate`
**Signal**: `@sentry/react-native@5.24` ReactNativeOptions has no `profilesSampleRate`. That option lives in `@sentry/profiling-node` (Node-only).
**Applies to**: `code-generator`, `sentry-rn-minimal` skill.
**Why it matters**: TS error in `lib/sentry/client.ts`.
**Update**: Drop the field. RN profiling is configured via `Sentry.ReactNativeTracing` integration if needed.

## 2026-04-28 — `expo-sqlite` plugin entry breaks `expo config`
**Signal**: `["expo-sqlite", { enableFTS: false, useSQLCipher: false }]` in `app.json` plugins → `Cannot find module .../SQLiteDatabase` at config-load time on SDK 51.
**Applies to**: `code-generator`, `expo-bootstrap`, `backend-provisioner`.
**Why it matters**: Blocks `expo config`, `expo-doctor`, EAS build.
**Update**: Don't add `expo-sqlite` as a plugin on SDK 51 — auto-linked via the package install. Skill updated.

## 2026-04-28 — `expo-sqlite` crashes static-render web
**Signal**: `web.output: "static"` triggered `NativeDatabase is not a constructor` during SSR pre-render — expo-sqlite is iOS/Android only.
**Applies to**: `code-generator`, `expo-bootstrap`, `app-architect` (when picking web target).
**Why it matters**: Web target unbuildable.
**Update**: Default to `web.output: "single"` for any app using SQLite. Only revisit `static` if SEO needed AND DB init is gated by `Platform.OS !== "web"`.

## 2026-04-28 — `drizzle/migrations.ts` stub shadows the auto-generated `migrations.js`
**Signal**: A hand-written `drizzle/migrations.ts` stub (added "to keep imports happy before db:generate") was resolved by TS instead of the real auto-generated `migrations.js` → `ensureMigrations()` no-op'd → `no such table` at runtime.
**Applies to**: `db-schema-designer`, `code-generator`, pipeline step 5.
**Why it matters**: Silent failure. App boots but every query crashes.
**Update**: Never ship a hand-written `migrations.ts`. Pipeline step 5 deletes it before `db:generate`. Agent rule added.

## 2026-04-28 — `app.json` icon/splash refs without files crash boot
**Signal**: `app.json` referenced `./assets/images/icon.png` etc. but the `assets/images/` directory was empty → Expo crashed at first launch.
**Applies to**: `code-generator`, pipeline step 8.
**Why it matters**: First-boot UX is broken.
**Update**: Either commit placeholder PNGs OR omit the icon/splash keys from `app.json` until real assets exist (Expo uses defaults). Pipeline step 8 documents this.

## 2026-04-28 — TS17004 on cold open = `expo/tsconfig.base` not yet resolved
**Signal**: Before `npm install`, the IDE flooded with `TS17004: Cannot use JSX unless the --jsx flag is provided` because `tsconfig.json` extended `expo/tsconfig.base` which didn't exist yet.
**Applies to**: User experience cloning the template, `code-generator`.
**Why it matters**: Bad first impression on every clone.
**Update**: Make `tsconfig.json` self-contained with explicit `jsx: "react-jsx"`, `module`, `moduleResolution`, `target`, `lib`. The `extends` overrides what it needs once installed; without it, the file still works.

## 2026-04-28 — Always run a 3-gate smoke test after code generation
**Signal**: 8 of the 10 lessons above would have been caught by a single `npx expo export --platform web` run. Pipeline didn't have it; user discovered them one by one running the dev server.
**Applies to**: `code-generator`, `qa-reviewer`, pipeline step 8.
**Why it matters**: Trust in the pipeline output. Each silent breakage is ~5 min of user friction.
**Update**: Step 8 must run `npx tsc --noEmit && npx expo config --type public && npx expo export --platform web --output-dir /tmp/_smoke` before returning. Failures hand back to `code-generator` for repair, never proceed.
