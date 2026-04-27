# Agent memory

One file per agent (plus `_global.md` for cross-cutting lessons). Each agent reads its own file at the start of a run and applies what's there before doing the task.

## Format per file

```markdown
# {agent-name} — memory

## YYYY-MM-DD — {short title}
**Signal**: what happened.
**Why it matters**: cost if it repeats.
**Update**: what to do differently next time.
```

## Files

- `_global.md` — cross-cutting lessons relevant to all agents (e.g., user dislikes em-dash everywhere).
- `app-strategist.md`
- `branding-strategist.md`
- `design-system-architect.md`
- `app-architect.md`
- `db-schema-designer.md`
- `paywall-designer.md`
- `copywriter.md`
- `code-generator.md`
- `backend-provisioner.md`
- `qa-reviewer.md`
- `icon-and-splash-designer.md`
- `store-listing-writer.md`

These start empty. They fill in over time via `/self-update`.

## Reading order at start of an agent run

1. Read `_global.md`.
2. Read `{your-agent-name}.md`.
3. Apply the lessons before producing output.

## Pruning

When a file grows past ~50 entries, promote the recurring patterns into the agent's prompt (`.claude/agents/{name}.md`) and remove the now-redundant memory entries. Use `/self-update` to drive this.

## Don't write here

- ❌ Per-app branding feedback ("the user picked X for App Y").
- ❌ Code-level fixes (commit them).
- ❌ TODO lists (those belong elsewhere).
