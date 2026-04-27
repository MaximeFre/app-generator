---
description: Secrets handling, RLS, deep links, OWASP-mobile basics.
paths: ["lib/**/*.ts", "app/**/*.tsx", "app.json", ".env*"]
---

# Security

## Secrets

- ❌ Anything secret in `EXPO_PUBLIC_*` — those vars are bundled into the JS bundle and visible to any user who unzips the IPA/APK.
- ✅ Public-by-design: Supabase anon key (RLS-protected), RevenueCat public API key, PostHog public key, Sentry DSN.
- ✅ Service role keys, EAS Submit credentials, Resend API keys → only in EAS env (`eas env:create`) or CI.

## Auth tokens

- Stored via `expo-secure-store` (Keychain / Keystore). Never AsyncStorage for the Supabase session.
- On sign-out, call `supabase.auth.signOut()` AND `Purchases.logOut()` AND `posthog.reset()`.

## Deep links

- Validate every param. Never trust `params.userId` to gate access — always re-check via Supabase auth state.
- Allowlist scheme: only `apptemplate://` (or whatever you customize). Reject `http://`, `javascript:`, `data:`.

## RLS is the security boundary

- The mobile app talks to Supabase with the **anon key**. RLS policies are the only thing standing between user A and user B's data.
- Every table mirrored from local MUST enforce `auth.uid() = user_id` in RLS for all four operations.
- Test RLS by signing in as user A and trying to fetch user B's row. It must return zero rows.

## Network

- All HTTP via `fetch` MUST use HTTPS. Block plain `http://` in app.json (`NSAppTransportSecurity` defaults are correct on iOS — don't override).
- Add a 10s timeout to any third-party `fetch` (use `AbortController`).

## Crash & telemetry hygiene

- Sentry `beforeSend`: scrub PII fields (`email`, `password`, `token`, `phone`).
- PostHog: no event named `*_password_*` or `*_token_*`.
- Don't include user input in error messages sent to Sentry.

## Forbidden

- ❌ `eval`, `Function(...)` — and any `dangerouslySetInnerHTML` equivalents.
- ❌ Reading `.env` files at runtime (use `lib/env.ts`).
- ❌ Logging full Supabase responses to console in production builds.
