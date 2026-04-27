#!/usr/bin/env bash
# PostToolUse hook: runs `tsc --noEmit` only if a TS/TSX file was just edited and tsconfig exists.
# Lightweight gate — fails build-breaking changes early.

set -euo pipefail

INPUT="$(cat || true)"
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin)
    print(d.get("tool_input",{}).get("file_path",""))
except Exception:
    print("")' 2>/dev/null || true)"

case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

if [ ! -f "tsconfig.json" ] || [ ! -d "node_modules" ]; then
  exit 0
fi

OUT="$(npx --no-install tsc --noEmit 2>&1 || true)"
if printf '%s' "$OUT" | grep -q "error TS"; then
  printf 'TypeScript errors after editing %s:\n%s\n' "$FILE_PATH" "$OUT" >&2
  exit 2
fi
exit 0
