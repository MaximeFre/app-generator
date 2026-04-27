---
description: Expert PostHog mobile analytics with strict event allowlist. Naming conventions, GDPR/EU host, identify+reset on auth, dashboard funnels, autocapture decisions. Use when adding events, debugging missing events, setting up funnels, or auditing the allowlist. Triggers `/posthog-events-allowlist`, "posthog", "analytics", "track event", "funnel".
---

# PostHog mobile — strict allowlist

## Why a strict allowlist

PostHog free tier: 1M events/month. Sounds like a lot. With 1000 active users at 30 sessions/month and naive autocapture:
- 1000 × 30 × 50 events/session = **1.5M events**.
- You're billed at $0.000248/event past 1M = $124 for the overage.

Strict allowlist = predictable cost. The 6 events in `lib/analytics/events.ts` are the only ones the app fires.

## The 6 events (source of truth: `lib/analytics/events.ts`)

| Event | When | Properties |
|---|---|---|
| `app_opened` | App launches or returns from background | `from_background: bool` |
| `onboarding_completed` | User finishes onboarding (or sign-up acts as it) | `steps: number, duration_ms: number` |
| `paywall_viewed` | Paywall route mounted | `offering_id: string, trigger: string` |
| `trial_started` | RC `customerInfo` shows trial activation | `product_id: string` |
| `subscription_started` | First non-trial period started | `product_id: string, price_usd: number` |
| `feature_used` | Catch-all for tracked features (use sparingly) | `feature: string, context?: string` |

## Adding a new event

This is a deliberate, reviewed action.

1. Add to `ANALYTICS_EVENTS` const in `lib/analytics/events.ts`.
2. Add the property type to `EventProps`.
3. Update this skill's table.
4. Open a PR with justification: "We need this because <reason that involves a real decision>."

If you find yourself wanting `button_clicked` events, STOP — autocapture noise. Track outcomes, not interactions.

## Naming conventions

- snake_case.
- Past-tense verb. ("user signed up", not "user signs up".)
- Noun_verb (`paywall_viewed`, `trial_started`). NOT verb_noun.
- No PII in event name (no `user_email_changed_to_xxx`).

Property naming: also snake_case. ALWAYS string/number/boolean. No nested objects, no arrays of objects (PostHog flattens — gets messy).

## Identify on auth

When a user signs in:

```ts
import { identify } from "@/lib/analytics/posthog";

// in lib/store/auth.ts onAuthStateChange:
if (session?.user) {
  identify(session.user.id, { email: session.user.email });
}
```

**Don't pass PII as properties** (email is borderline). For GDPR, the user ID alone is enough — link via Supabase if you need email later.

## Reset on sign-out

```ts
import { reset } from "@/lib/analytics/posthog";

// in signOut():
await supabase.auth.signOut();
reset();  // disconnects events from previous user
```

Failing to reset = next anon user's events get attributed to the previous user.

## EU vs US host

This template defaults to `https://eu.i.posthog.com` (EU host). For GDPR compliance with EU users, this is required. Switch to US only if you have no EU users and want lower latency (rare).

## Dashboard setup

Most useful first dashboards:
1. **Funnel: app_opened → onboarding_completed → paywall_viewed → subscription_started**. Drop-off at each step.
2. **Trial → paid conversion**: `trial_started` → 7 days later → `subscription_started` (with `payment_succeeded` if you wire it via webhook).
3. **DAU/WAU/MAU**: built-in via `app_opened`.

## Autocapture: NO

PostHog RN supports autocapture (every screen view + every tap). Do NOT enable it. Two reasons:
1. Quota burn.
2. Most autocaptured events are noise — you'll never read them.

The config in `lib/analytics/posthog.ts` already disables it (`captureAppLifecycleEvents: false`).

## Session replay: NO

`enableSessionReplay: false` in config. Replays are charged separately and chew through quota. Use only when debugging a specific bug, manually toggled on a per-build basis.

## Feature flags

PostHog supports feature flags. They're free (don't count against event quota). Use them for:
- Gating new features (instead of env vars).
- A/B tests on copy.
- Kill switches for problematic features.

```ts
const showNewOnboarding = await client?.getFeatureFlag("new-onboarding") === true;
```

Cache flag values — don't `getFeatureFlag` on every render.

## Forbidden patterns

- ❌ `client.capture("foo", {...})` with a string literal not in `ANALYTICS_EVENTS`. Use the typed `track(event, props)` helper.
- ❌ Tracking `user_email` or any PII as property.
- ❌ Tracking on every render — only on user actions and lifecycle.
- ❌ `setInterval` heartbeat events.

## Audit (run before each release)

```bash
grep -rn "client\.capture\|\.capture(" lib/ app/ components/ --include="*.ts" --include="*.tsx"
```

Should return ONE result: the `track()` helper itself. Anything else is a violation.
