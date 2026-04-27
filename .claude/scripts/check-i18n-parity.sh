#!/usr/bin/env bash
# PostToolUse hook: ensures messages/fr.json and messages/en.json have identical key sets.
# Reads CLAUDE_TOOL_INPUT (JSON) from stdin (Claude Code) — runs only if a messages/*.json was touched.

set -euo pipefail

INPUT="$(cat || true)"
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    d=json.load(sys.stdin)
    print(d.get("tool_input",{}).get("file_path",""))
except Exception:
    print("")' 2>/dev/null || true)"

case "$FILE_PATH" in
  *messages/fr.json|*messages/en.json) ;;
  *) exit 0 ;;
esac

if [ ! -f "messages/fr.json" ] || [ ! -f "messages/en.json" ]; then
  exit 0
fi

DIFF="$(python3 - <<'PY'
import json, sys
def flatten(d, prefix=""):
    out=set()
    for k,v in d.items():
        key=f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out |= flatten(v, key)
        else:
            out.add(key)
    return out
fr=flatten(json.load(open("messages/fr.json")))
en=flatten(json.load(open("messages/en.json")))
missing_in_en=sorted(fr-en)
missing_in_fr=sorted(en-fr)
if missing_in_en or missing_in_fr:
    msg=[]
    if missing_in_en: msg.append("Missing in en.json: "+", ".join(missing_in_en))
    if missing_in_fr: msg.append("Missing in fr.json: "+", ".join(missing_in_fr))
    print("\n".join(msg))
PY
)"

if [ -n "$DIFF" ]; then
  printf 'i18n parity broken between messages/fr.json and messages/en.json:\n%s\n' "$DIFF" >&2
  exit 2
fi
exit 0
