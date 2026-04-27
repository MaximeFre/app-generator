---
description: Free-tier-first invariants. Stops billing surprises before they ship.
paths: ["lib/**/*.ts", "app/**/*.tsx", ".env*", "eas.json"]
---

# Cost control — anti-billing-surprise

## Hard limits the template enforces

| Service | Free quota | Trigger to upgrade |
|---|---|---|
| Supabase | 500 MB DB, 50k MAU, 1 GB egress, 2 free projects | Approaching 80% of any → consider Pro at $25/project/mo |
| RevenueCat | $2,500/mo tracked revenue | Above → 1% cut, no fixed fee |
| PostHog | 1M events/mo | Above → $0.000248/event after free tier |
| Sentry | 5k errors/mo, 10k perf events | Above → $26/mo Team plan |
| Resend (if added) | 3k emails/mo, 1 domain | Above → $20/mo |
| Expo EAS | 30 builds/mo (15 iOS + 15 Android) | Above → $19/mo Production plan |
| Cloudflare Pages | 500 builds/mo, unlimited bandwidth | rarely an issue |
| Apple Developer | $99/year | required for production iOS |
| Google Play | $25 one-time | required for production Android |

## Allowlist gates (encoded in code)

- **PostHog**: only events in `lib/analytics/events.ts`. No string-typed `client.capture('foo')`.
- **Sentry**: `tracesSampleRate: 0.1` in production. `IGNORED_ERROR_PATTERNS` filters Network noise.
- **Supabase**: Only `auth` and the `items` mirror table. No realtime channels (charged differently).
- **RevenueCat**: One entitlement (`premium`), one offering (`default`). Multiple offerings = experimentation cost.

## Forbidden in feature work

- ❌ Adding a new PostHog event without a justification line in the PR description.
- ❌ Setting `tracesSampleRate` higher than 0.1 in production.
- ❌ `supabase.realtime.channel(...)` without explicit cost review.
- ❌ Image uploads to Supabase Storage > 500 KB. Compress with `expo-image-manipulator` first.
- ❌ Background tasks polling cloud > 1×/15min on free tier.

## Required for any new third-party integration

1. Document free-tier quota.
2. Add a kill-switch `featureFlags.{name}Enabled` reading from env.
3. Show a fallback if disabled — never crash.
4. Add PreToolUse pattern to `.claude/scripts/billing-guardrail.sh` if there's a destructive/billable CLI command.

## Cost-guardrails skill

Run `/cost-audit` (skill: `cost-guardrails`) before any production push. It hits each service's status API and reports remaining quota.
