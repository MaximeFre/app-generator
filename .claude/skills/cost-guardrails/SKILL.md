---
description: One-shot audit of free-tier quota usage across Supabase, RevenueCat, PostHog, Sentry, EAS. Reads dashboard APIs (when keys configured) and flags risk of upgrade billing. Use before production push or when costs feel "off". Triggers `/cost-audit`, `/cost-guardrails`, "billing", "quota", "free tier", "am I going to get charged".
---

# Cost guardrails — one-shot audit

## What this does

Reports current quota usage on each free-tier service the template depends on. Flags anything > 70% so you can act BEFORE billing kicks in.

This is a **manual audit** — not a cron, not a hook (those would themselves cost API calls). Run it before each production release and once a month.

## What it audits

### 1. Supabase (free: 500 MB DB, 50k MAU, 2 GB egress, 2 free projects)

```bash
# Dashboard → Settings → Usage shows quota. No public API for this without service role.
# Manual check:
echo "Open https://app.supabase.com/project/<ref>/settings/usage"
echo "Check: Database size, Monthly Active Users, Egress."
```

If you have the Supabase Management API token (paid feature), the script can fetch automatically. Otherwise prompt the user with the link.

Risk thresholds:
- DB > 400 MB (80%) → plan an archival strategy or upgrade.
- MAU > 40k (80%) → 2 weeks until you might cross.
- Egress > 1.6 GB (80%) → check for noisy realtime channels or large image fetches.

### 2. RevenueCat (free: $2.5k/mo MTR)

Dashboard → Charts → MTR. No public API on free tier.

```bash
echo "Open https://app.revenuecat.com/projects/<id>/charts"
echo "MTR (this month): $___"
```

Risk threshold: $2k (80%). Past $2.5k, RC takes 1% — not catastrophic but factor it in.

### 3. PostHog (free: 1M events/mo)

Public API:

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  https://eu.posthog.com/api/projects/<project_id>/usage \
  | jq '.events_count_last_30_days'
```

Replace `<project_id>` and `$POSTHOG_PERSONAL_KEY` (different from project key — generate at https://eu.posthog.com/me).

Risk thresholds:
- > 700k events (70%) → audit allowlist with `/posthog-events-allowlist` skill.
- > 900k → consider upgrading or aggressive sampling.

### 4. Sentry (free: 5k errors/mo, 10k perf events/mo)

Public API:

```bash
curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/organizations/<org>/stats_v2/?statsPeriod=30d&category=error" \
  | jq '.groups[0].totals'
```

Risk thresholds:
- > 3500 errors (70%) → review top issues, add to `IGNORED_ERROR_PATTERNS`.
- > 4500 → spike protection will auto-pause; either fix or upgrade.

### 5. EAS Build (free: 30 builds/mo)

```bash
npx eas-cli build:list --status finished --limit 50 --json \
  | jq --arg since "$(date -v-30d -Iseconds)" '[.[] | select(.createdAt > $since)] | length'
```

Risk threshold: > 24 builds (80%) → batch dev iteration via local builds (`npx expo run:ios`) instead.

### 6. Apple Developer + Google Play

Fixed costs:
- Apple: $99/year, auto-renewed. Set a calendar reminder ~30d before.
- Google Play: $25 once, no renewal.

## Output format

Write `.planning/cost-audit-{YYYY-MM-DD}.md`:

```markdown
# Cost audit — 2026-04-27

## Status
| Service | Used | Limit | % | Status |
|---|---|---|---|---|
| Supabase DB | 320 MB | 500 MB | 64% | 🟢 OK |
| Supabase MAU | 12k | 50k | 24% | 🟢 OK |
| Supabase egress | 800 MB | 2 GB | 40% | 🟢 OK |
| RevenueCat MTR | $1,800 | $2,500 | 72% | 🟡 watch |
| PostHog events | 720k | 1M | 72% | 🟡 watch |
| Sentry errors | 1.2k | 5k | 24% | 🟢 OK |
| EAS builds | 8 | 30 | 27% | 🟢 OK |

## Action items
- 🟡 RevenueCat: 72% MTR — at this rate you cross $2.5k mid-cycle. RC takes 1% above. Budget impact: ~$30/mo extra. Action: none required, just plan for it.
- 🟡 PostHog: 72% events — likely a recent feature added an event. Run `grep -rn "track(" lib/ app/` and audit.

## Fixed costs
- Apple Developer renews 2026-09-15: $99.
- Domain {x} renews 2026-XX: $X.

## Recommendation
- Status overall: 🟢 ship-ready.
- Next audit: 2026-05-27.
```

## How to use this skill

1. Invoke `/cost-audit` (or call this skill).
2. The skill prompts for service URLs/tokens that aren't in env (e.g., `POSTHOG_PERSONAL_KEY`).
3. Runs each curl above (those that have credentials) or prints a manual-check link.
4. Aggregates into the markdown report.
5. If any service is 🟡 or 🔴, recommends a specific action.

## Forbidden in audit

- ❌ Suggesting a paid plan upgrade as the first action. Always start with "audit and reduce" recommendations.
- ❌ Running CLI commands that themselves count against quota (e.g., test PostHog events).
- ❌ Hitting any service's API more than once per audit run.

## Why no automation?

A cron audit would itself eat quota (each run = ~10 API calls). At weekly cadence × 12 services × 4 weeks = 480 calls/month. That's not free on every service.

Run this manually before each production release. That's enough.
