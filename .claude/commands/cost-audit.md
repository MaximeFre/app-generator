---
description: Audit free-tier quota across Supabase, RevenueCat, PostHog, Sentry, EAS. Outputs to .planning/cost-audit-{date}.md.
---

Run the `cost-guardrails` skill. Follow its process exactly: hit each service that has credentials configured, prompt for missing ones, write the report, recommend actions.

If any quota is at 70%+, list the specific actions to reduce usage BEFORE suggesting an upgrade.
