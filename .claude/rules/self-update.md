---
description: When the pipeline learns something — a recurring mistake, a user correction, a pattern that worked — record it where it can prevent the same issue next run.
paths: ["**/*"]
---

# Self-update — meta rule

The point of this template is to get sharper every time it ships an app. That only works if signals make it back into the rules / agents / skills.

## What counts as a signal

- **User correction during a checkpoint**: "the palette is too saturated" / "the paywall is too pushy" / "you keep proposing em-dash variants".
- **Repeated drift**: an agent produces the same wrong thing twice across two different runs (= the rule isn't strong enough).
- **A surprising win**: the user accepts a non-obvious choice without pushback (validated judgment — worth keeping).
- **A bug in the pipeline itself**: a sub-agent crashed, an output didn't match its spec, a hook flagged something that should have been caught upstream.

## Where to record

Match the signal to the right surface — closest scope wins.

| Signal scope | Record in | Format |
|---|---|---|
| Concerns ONE agent's output | `.claude/agent-memory/{agent-name}.md` | Bullet list under date headers. |
| Concerns a category of work (design, copy, schema) | `.claude/rules/{category}.md` | Add a bullet under "Forbidden" / "Required". |
| Concerns the pipeline orchestration | `.claude/skills/generate-app/SKILL.md` or `pipeline.md` | Edit the relevant step. |
| Concerns a third-party integration | The matching expert skill (`/expo-bootstrap`, `/supabase-schema`, etc.) | Add to anti-patterns or troubleshooting. |
| Concerns CLAUDE.md hard rules | `CLAUDE.md` § Hard rules | Append, never silently rewrite. |

## When to record

- **At the end of a `/generate-app` run** if the user said "REFAIRE" or "AJUSTER" at any checkpoint — note WHY.
- **At the end of a feature build** if the user gave specific feedback ("don't do X").
- **When the QA reviewer flags the same kind of issue 2+ runs in a row** — the rule isn't strong enough.

## How to record (format)

```markdown
## YYYY-MM-DD — {short title}
**Signal**: what happened (1 sentence).
**Why it matters**: the cost if it repeats (1 sentence).
**Update**: what was changed (file + section + diff summary).
```

Don't write essays. The signal-update loop only works if it's cheap to do.

## Don't record

- ❌ One-off user opinions on a single app's branding ("this name doesn't fit me"). That's a normal checkpoint reject, not a pipeline learning.
- ❌ Code-level fixes. Those belong in commits, not in the rules.
- ❌ Anything you'd write as a `// TODO` — fix it instead.

## How to retrieve

When invoked at the START of a run:
- Sub-agents read their own `.claude/agent-memory/{name}.md` first if present.
- The orchestrator reads `.claude/agent-memory/_global.md` (cross-cutting lessons).
- The skill `/self-update` runs a digest on demand.

## Anti-pattern

Auto-rewriting rules without human review. The user is the editor — propose updates, don't apply them silently. Especially for `CLAUDE.md` and the rules, the diff should be visible and approved.
