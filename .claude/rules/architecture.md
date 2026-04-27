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

## Server-only constants

- `EXPO_PUBLIC_*` vars are bundled into the app — never put secrets there.
- Service-role keys, Sentry auth tokens stay in `.env` without the prefix and are read in EAS env or CI only.

## Native split

- iOS-specific code: `*.ios.tsx`. Android: `*.android.tsx`. Avoid `Platform.OS` branches in screens — push them to `lib/`.
