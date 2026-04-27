---
description: Expert Expo SDK setup. Bootstraps or repairs an Expo project — SDK pinning, expo-router config, plugins array, EAS init, prebuild flow, dev client. Use when starting a new Expo app, upgrading Expo SDK, debugging build issues, or onboarding a fresh clone of this template. Triggers `/expo-bootstrap`, "setup expo", "expo SDK", "prebuild", "EAS init", "dev client".
---

# Expo bootstrap — expert

## Mental model

Expo today is **two things**:
1. **Expo SDK** (the JS layer): a versioned set of pre-bundled native modules.
2. **EAS** (the build/deploy layer): cloud builds, OTA updates, submit, env management.

You almost always use BOTH. The "managed workflow" vs "bare workflow" distinction is dead — everything is now **continuous native generation (CNG)** via `expo prebuild`. You write JS + `app.json` + plugins; native projects are generated.

## Pinned versions in this template

- Expo SDK 54 (Fall 2025). React Native 0.74. New Architecture **enabled** (`newArchEnabled: true` in app.json).
- `expo-router` 3.5+ for file-based routing.
- All `expo-*` packages must match the SDK version pin (look up in `package.json`).

When upgrading, run `npx expo install --fix` — it aligns every `expo-*` package to the SDK.

## Bootstrapping a fresh clone

```bash
npm install
cp .env.example .env  # then fill values per .planning/backend-setup.md
npm run db:generate   # produces drizzle/<timestamp>_*.sql migrations
npx expo start        # Metro dev server
```

For native (iOS Simulator / Android Emulator):
```bash
npx expo run:ios       # builds + runs in Simulator
npx expo run:android   # builds + runs on emulator (requires Android Studio + SDK)
```

For physical devices via Expo Go (limited — no native modules outside Expo SDK):
- Just `npx expo start` and scan QR with Expo Go app.
- BUT this template uses `react-native-purchases` (native, not in Expo Go). Use a **dev client** instead.

## Dev client (required for this template)

```bash
npx expo prebuild --clean        # generates ios/ and android/ folders
npx eas-cli build --profile development --platform ios     # cloud build
# or local:
npx expo run:ios                 # local build, requires Xcode
```

Install the resulting `.app`/`.apk` once on each test device. After that, you can iterate purely in JS with `npx expo start --dev-client`.

## `app.json` — what each field means

| Key | Why |
|---|---|
| `name` | Shown on home screen. ≤ 30 chars (App Store rule). |
| `slug` | EAS project key. URL-safe. Set once, never rename. |
| `scheme` | Deep links. Used by Supabase magic links and OAuth callbacks. |
| `bundleIdentifier` (ios) | Apple ID. `com.{org}.{app}`. Set once, NEVER change post-release. |
| `package` (android) | Google ID. Same constraint. |
| `newArchEnabled` | New Architecture (Fabric + TurboModules). Default `true` in SDK 54. |
| `userInterfaceStyle` | `automatic` honors device dark mode. Don't hardcode. |
| `plugins` | Each plugin runs `withConfig` to mutate native projects. Order matters. |
| `experiments.typedRoutes` | Generates `Href` types from `app/` files — type-safe `router.push`. |
| `extra.eas.projectId` | Set by `eas init`. Required for EAS cloud builds. |

## Required plugins for this template

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-localization",
  ["expo-sqlite", { "enableFTS": false, "useSQLCipher": false }],
  ["@sentry/react-native/expo", { "url": "https://sentry.io/" }]
]
```

Add a plugin → MUST run `npx expo prebuild --clean` AND rebuild the dev client. Hot reload doesn't pick up native config changes.

## Common issues

- **"Unable to resolve module"** in Metro → restart with `npx expo start -c` (clears cache).
- **iOS Pods out of sync** → `cd ios && pod install` after prebuild.
- **NativeWind classes not applied** → check `metro.config.js` exports `withNativeWind(config, { input: "./global.css" })` and `babel.config.js` includes the preset.
- **Reanimated crashes on launch** → ensure `react-native-reanimated/plugin` is the LAST plugin in `babel.config.js`.
- **Drizzle live query empty** → first migration didn't run; check `ensureMigrations()` is awaited in `app/_layout.tsx`.

## EAS init

```bash
npx eas-cli login            # one-time per machine
npx eas init --id            # creates project on EAS, writes projectId to app.json
```

Free tier: 30 builds/mo (15 iOS + 15 Android). Production builds via `eas build --profile production` are **blocked by `billing-guardrail.sh`** unless `ALLOW_PAID=1` — that's intentional, paid builds shouldn't fire from a Claude turn.

## Splitting `app.json` for multi-env

For dev/preview/prod with different bundle ids, use a `app.config.ts` that reads `process.env.APP_ENV`:

```ts
import type { ExpoConfig } from "expo/config";

const variants = {
  development: { name: "AppTemplate (Dev)", bundleIdentifier: "com.example.apptemplate.dev" },
  preview:     { name: "AppTemplate (Preview)", bundleIdentifier: "com.example.apptemplate.preview" },
  production:  { name: "AppTemplate", bundleIdentifier: "com.example.apptemplate" },
};

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  ...variants[(process.env.APP_ENV ?? "development") as keyof typeof variants],
});
```

Don't do this in v1 — wait until you have a paying user and need preview/prod separation.

## Anti-patterns

- ❌ Editing `ios/` or `android/` directly — those folders are generated.
- ❌ Pinning Expo SDK to `^` (caret) — always exact (`~54.0.0` is OK; bumps within minor are safe).
- ❌ Mixing `expo-image` and `react-native`'s `Image` — use only the former for performance.
- ❌ Skipping `prebuild --clean` after plugin changes.
- ❌ Setting `userInterfaceStyle: "light"` to "force light mode" — accessibility regression.
