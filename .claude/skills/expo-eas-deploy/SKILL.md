---
description: Expert EAS Build + Submit + Update for Expo apps. Build profiles, env management, OTA updates with branches/channels, store submission, prebuild flow, dev client. Use when configuring EAS, shipping a build, doing OTA pushes, or debugging "build failed". Triggers `/expo-eas-deploy`, "EAS build", "submit to App Store", "OTA update", "expo-updates".
---

# EAS deploy — expert

## Three EAS services

1. **EAS Build**: cloud-builds your `.ipa` / `.apk`. Free: 30 builds/mo.
2. **EAS Submit**: uploads the build to App Store Connect / Google Play. Free.
3. **EAS Update**: OTA JS updates (no rebuild needed). Free up to 1k MAU.

## Build profiles (`eas.json`)

Already configured:

| Profile | Distribution | Use for |
|---|---|---|
| `development` | internal (ad-hoc) | dev client install on test devices |
| `preview` | internal | TestFlight / Play internal track |
| `production` | store | App Store / Play public release |

Production builds are **blocked by `billing-guardrail.sh`** unless `ALLOW_PAID=1`. Intentional — fire only when you mean it.

## First-time setup

```bash
npx eas-cli login
npx eas init --id          # creates project, writes projectId to app.json
```

For iOS, EAS will ask for an Apple ID + 2FA on first build. After that, it caches credentials.
For Android, EAS auto-generates a keystore on first build. **Don't lose it** — Play Store rejects future updates signed with a different key.

## Dev client build (recommended for this template)

The template uses `react-native-purchases` (native), so Expo Go doesn't work. Build a dev client once per major plugin change:

```bash
ALLOW_PAID=0 npx eas-cli build --profile development --platform ios     # ~15 min
ALLOW_PAID=0 npx eas-cli build --profile development --platform android # ~10 min
```

Install once on each device. After that, iterate purely in JS:

```bash
npx expo start --dev-client
```

## Env vars on EAS

Two layers:

### 1. Public (bundled into the app)

`EXPO_PUBLIC_*` vars come from your local `.env` at build time. Configure for EAS:

```bash
eas env:create --scope project --visibility public --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://...
```

Repeat per environment (`development`, `preview`, `production`) and per public key.

### 2. Secret (build-time only)

`SENTRY_AUTH_TOKEN` and similar:

```bash
eas env:create --scope project --visibility encrypted --environment production --name SENTRY_AUTH_TOKEN --value sntrys_xxx
```

These are NOT bundled into the app. They're available to the build process (e.g. for source map upload).

### Pull to local

```bash
eas env:pull --environment development > .env.local
```

Don't commit `.env.local`.

## Submitting to stores

### iOS (TestFlight)

```bash
ALLOW_PAID=1 npx eas-cli submit --profile production --platform ios
```

(Guardrail blocks `eas submit` by default — `ALLOW_PAID=1` is the explicit consent.)

This uploads the latest production build to App Store Connect. From there:
- Internal testing → TestFlight team (instant).
- External testing → TestFlight beta (Apple review, ~24h).
- App Store → submit for review (1–3 days).

### Android (Internal track)

```bash
ALLOW_PAID=1 npx eas-cli submit --profile production --platform android --track internal
```

Internal track = instant install for Play Console testers. Promote to production when ready.

## OTA updates (EAS Update)

Push JS-only changes without going through store review:

```bash
npx eas-cli update --branch production --message "Fix typo on paywall"
```

- Branches: usually one per env (`development`, `preview`, `production`).
- Channels (in `eas.json`): map a build to a branch. Already wired via `channel: "production"` in the production profile.
- Updates ship within seconds — users get the update on next app launch.

### When OTA does NOT work

OTA only ships **JS bundle changes**. If you change:
- `app.json` plugins
- Native code (any `expo-*` package upgrade with native module change)
- New Expo SDK
- New dep with native code (e.g., `react-native-purchases`)

→ you need a new EAS build. Don't try OTA — the app will crash on JS-native ABI mismatch.

## Build numbers + versions

Auto-incremented when `appVersionSource: "remote"` is set in `eas.json` (already configured). EAS tracks the next build number. Don't edit `app.json` `version` for builds — only for marketing version bumps.

## Common errors

- **iOS build fails: "Invalid bundle identifier"** → `app.json` `ios.bundleIdentifier` must be unique on Apple's side AND match what you configured in App Store Connect.
- **iOS: "Provisioning profile doesn't include device"** → `--profile development` only works on registered devices. Add via `eas-cli device:create`.
- **Android: "Keystore mismatch"** → you tried to sign with a different keystore than the original. Recover from `eas credentials:configure --platform android`.
- **OTA update not picked up** → bump runtimeVersion or reinstall app. Some versions of `expo-updates` cache aggressively.

## Production checklist before submit

1. ✅ `npx tsc --noEmit` passes.
2. ✅ `.planning/qa-report.md` shows ✅.
3. ✅ `.env.production` filled, EAS env vars configured.
4. ✅ App icon + splash + adaptive icon + favicon all present.
5. ✅ App Store Connect: store listing complete (title, subtitle, description, keywords, screenshots, privacy URL, support URL).
6. ✅ Subscription products approved by Apple (24h-ish).
7. ✅ Sandbox tested both monthly and yearly purchase.
8. ✅ Restore purchases works.
9. ✅ Privacy details (data collection) filled in App Store Connect.
10. ✅ Test on a physical device (simulators don't catch all native issues).

## Anti-patterns

- ❌ Building production from a dirty branch ("just to test").
- ❌ Submitting without testing IAP in sandbox first.
- ❌ Pushing OTA after a native plugin change.
- ❌ Using `eas update --branch production` directly without testing on `preview` branch first.
- ❌ Forgetting to bump `version` in `app.json` for store releases — Apple rejects same version.

## Cost summary

- Free: 30 EAS builds/mo, 1k MAU OTA updates/mo.
- Paid: $19/mo for unlimited builds + 200k MAU OTA. Only worth it past ~50 builds/mo.
- Apple Developer Program: $99/year. Required for production iOS.
- Google Play Developer: $25 one-time. Required for production Android.
