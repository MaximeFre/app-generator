---
description: Expo Router + folder layout + import boundaries.
paths: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.ts"]
---

# Architecture

## Folder boundaries

- `app/` — only routes and route layouts. No business logic. Use `lib/*` for state and side effects.
- `app/(tabs)/` — bottom tabs only. Index = home.
- `app/auth/` — sign-in / sign-up / reset password.
- `app/paywall.tsx` — modal route.
- `components/ui/` — primitives (Button, Input, Screen, Text). No domain logic.
- `components/{domain}/` — feature components (e.g. `paywall/PremiumGate`).
- `lib/` — singletons + state + clients. One subfolder per integration.

## Import rules

- Always use `@/` alias, never relative chains beyond `..`.
- A `lib/` module must NOT import from `app/` or `components/`.
- A `components/ui/` primitive must NOT import from `components/{domain}/` or `app/`.
- Domain components MAY import primitives, lib state, and lib utils.

## Expo Router

- Use **typed routes** (`experiments.typedRoutes`). Never pass arbitrary strings to `router.push`.
- Modals: `presentation: "modal"` in the parent Stack screen options, not in the route file.
- Deep links: declare scheme in `app.json` (`apptemplate://`).

## Back affordance

Any screen pushed via `router.push` (not a tab, not a modal) MUST render a visible back affordance — typically the `<Header onBack={() => router.back()} title="...">` primitive from `@/components/ui/Header`. The root Stack uses `headerShown: false`, so no native chevron is rendered automatically. Modals get a swipe-down dismiss gesture by default and don't need a chevron unless `gestureEnabled: false`.

## Onboarding

Default: INCLUDE a 3-step onboarding (welcome → profile → preferences) under `app/onboarding/`. Skip ONLY when the persona is technical AND personalization adds zero value — and document the skip justification in `.planning/onboarding.md`.

Onboarding gate: `app/_layout.tsx` MUST call `useOnboardingGate()` (from `@/lib/hooks/useOnboardingGate`) after `ensureMigrations()`. The hook returns a `<Redirect>` element when `!hasOnboarded`; the layout short-circuits and renders it.

Onboarding writes to the `usePreferences` Zustand store (`@/lib/store/preferences`), which mirrors the local-only `user_preferences` Drizzle table. Never invent another preferences mechanism.

## Primitives

When a primitive exists in `@/components/ui` or `@/components/forms`, USE IT. Do not rebuild from `<View>` + `<Text>` + `<Pressable>`. The primitive library covers:

- Layout / containers: `Card`, `ListRow`, `Header`, `Sheet`, `Screen`
- Display: `Stat`, `Tag`, `Avatar`, `Skeleton`, `Chart`
- Interactive: `Button`, `IconButton`, `Segmented`, `SwipeableRow`
- Feedback: `EmptyState`, `ErrorState`, `Toast`
- Forms: `Input`, `FormField`, `NumericInput`, `UnitInput`, `Select`, `Stepper`, `DateField`, `Switch`
- Iconography: `Icon` (lucide wrapper)

Adding a new "ad-hoc" version of any of these is a code smell — first try to extend the existing primitive.

## Visual assets

`assets/images/icon.png` and `assets/images/splash.png` MUST exist at end of `step 3c — icon-and-splash-designer`. The pipeline gates on this — no proceeding to architecture without real PNGs (placeholder OK as last resort, but flagged).

## Skill invocations during code-gen

`code-generator` is required to invoke `mobile-ux-patterns` and `ui-ux-pro-max` skills before writing each screen type (see `.claude/agents/code-generator.md` § Skill invocations).

## Server-only constants

- `EXPO_PUBLIC_*` vars are bundled into the app — never put secrets there.
- Service-role keys, Sentry auth tokens stay in `.env` without the prefix and are read in EAS env or CI only.

## Native split

- iOS-specific code: `*.ios.tsx`. Android: `*.android.tsx`. Avoid `Platform.OS` branches in screens — push them to `lib/`.
