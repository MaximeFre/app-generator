#!/usr/bin/env bash
# PreToolUse hook for Bash: warns/blocks commands that may incur costs on third-party services.
# Free-tier-safe by default. Set ALLOW_PAID=1 in env to bypass for explicit upgrades.

set -euo pipefail

INPUT="$(cat || true)"
CMD="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin)
    print(d.get("tool_input",{}).get("command",""))
except Exception:
    print("")' 2>/dev/null || true)"

if [ -z "$CMD" ]; then exit 0; fi

declare -a HARD_BLOCK=(
  "supabase projects create.*--plan pro"
  "eas build --profile production"
  "eas submit"
  "sentry-cli organizations create"
  "vercel --prod"
)

for p in "${HARD_BLOCK[@]}"; do
  if printf '%s' "$CMD" | grep -Eiq "$p"; then
    if [ "${ALLOW_PAID:-0}" != "1" ]; then
      printf 'Billing guardrail blocked a potentially paid command:\n  %s\n\nIf this is intentional, re-run with ALLOW_PAID=1.\n' "$CMD" >&2
      exit 2
    fi
  fi
done

declare -a SOFT_WARN=(
  "posthog.*capture"
  "sentry.*captureEvent"
)
for p in "${SOFT_WARN[@]}"; do
  if printf '%s' "$CMD" | grep -Eiq "$p"; then
    printf 'cost-warning: command may produce billable events. Allowed but watch quotas.\n' >&2
  fi
done

exit 0
