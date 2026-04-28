---
description: Expo + React Native specifics — perf, navigation, native modules.
paths: ["app/**/*.tsx", "components/**/*.tsx", "lib/**/*.ts", "app.json", "metro.config.js", "babel.config.js"]
---

# Expo + React Native rules

## Performance

- **FlatList over ScrollView** for any list > 10 items.
- **`expo-image`** instead of `react-native`'s `Image` for any remote/asset image. It caches and decodes faster.
- **`React.memo`** components rendered in FlatList rows.
- **No inline objects/arrays in `props`** of memoed children. Hoist or `useMemo`.
- **Reanimated worklets** for any 60fps animation. Don't use `Animated` (legacy).

## Navigation

- One root `Stack` in `app/_layout.tsx`. Tabs are nested under `(tabs)`.
- Use `router.replace` for auth flow transitions (no back stack).
- Use `router.push` for forward navigation.
- For modals, declare `presentation: "modal"` in the parent layout's screen options.

## Native modules

- Stick to **Expo modules** when one exists (`expo-secure-store`, `expo-image`, `expo-haptics`, `expo-localization`).
- A non-Expo native module requires a custom dev client → `npx expo prebuild --clean` then EAS dev build.
- New plugin in `app.json` → bump version + ensure EAS production build before merging.

## SafeArea & status bar

- Always wrap screens in the `<Screen>` primitive (`components/ui/Screen.tsx`) — handles SafeAreaView + KeyboardAvoidingView.
- Don't manually use `react-native`'s `KeyboardAvoidingView` in screens.

## Async storage

- **Auth tokens → `expo-secure-store`** (encrypted on iOS Keychain / Android Keystore).
- **Non-sensitive prefs → `@react-native-async-storage/async-storage`** or Zustand `persist`.
- Never put user content in AsyncStorage — use SQLite via Drizzle.

## Forbidden APIs

- ❌ `setInterval` for polling without cleanup → use `useFocusEffect` from expo-router.
- ❌ `console.log` left in production code (Sentry breadcrumb noise).
- ❌ Direct fetch to user-controlled URLs without timeout.
- ❌ `Alert.alert` for confirmations on iOS where a native sheet would feel better — use `expo-haptics` + custom modal.

## Plugins config

`app.json` plugins must include:
- `expo-router`
- `expo-secure-store`
- `expo-localization`
- `@sentry/react-native/expo`

❌ Do NOT add `expo-sqlite` as a plugin entry on SDK 51+ — it auto-links via the package install. A plugin entry crashes `npx expo config` with `Cannot find module .../SQLiteDatabase` (see `.claude/agent-memory/_global.md` 2026-04-28 entry).

Adding a plugin → also rebuild dev client (`npx expo prebuild --clean`).

## Web target

- Web is a free side-effect of Expo. Don't ship features to web that need native modules unless a `.web.tsx` fallback exists.
