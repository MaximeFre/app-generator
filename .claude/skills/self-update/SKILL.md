---
description: Reflective pass at the end of a /generate-app run (or on demand). Identifies signals from the conversation — user corrections, repeated drift, accepted non-obvious choices — and proposes updates to the right rule / agent / skill / agent-memory file. Never applies silently. Triggers `/self-update`, "post-mortem", "what did we learn", "improve the pipeline", "update the rules".
---

# /self-update — reflective pass

## When to invoke

- After `/generate-app` finishes (orchestrator may auto-call if user said REFAIRE/AJUSTER at a checkpoint).
- After a major feature build with user feedback.
- On demand: "let's see if anything from the last session should update the rules".

## Process

### 1. Read the signals

- Read the recent conversation context (this session).
- Read `.claude/agent-memory/*.md` for prior recorded patterns.
- If the conversation references planning files, read them: `.planning/qa-report.md` is gold.

### 2. Classify each signal

For each candidate learning, classify:

| Type | Definition |
|---|---|
| **Correction** | User explicitly pushed back ("no", "stop", "don't") |
| **Validation** | User accepted a non-obvious choice without changes |
| **Drift** | The same kind of issue showed up multiple times |
| **Bug** | A sub-agent or hook failed |
| **Out-of-scope** | One-off opinion, not a pattern |

Drop OUT-OF-SCOPE entries — those are normal rejection at checkpoints.

### 3. Match to the right surface

Use the table from `.claude/rules/self-update.md`:

| Scope | Record in |
|---|---|
| Concerns one agent's output | `.claude/agent-memory/{agent}.md` |
| Concerns a rule category | `.claude/rules/{category}.md` |
| Concerns the pipeline | `.claude/skills/generate-app/{SKILL.md, pipeline.md}` |
| Concerns a third-party | The matching expert skill |
| Concerns global hard rules | `CLAUDE.md` |

### 4. Propose, don't apply silently

For each proposed update, output:

```
## Proposed update

**File**: `.claude/rules/content.md`
**Section**: § Forbidden
**Reason**: User corrected em-dash use 3 times in 2 runs despite the existing rule.
**Diff**:
- Add bullet: "❌ Em-dash even when the user's brief uses one. Reword."

Apply? (y/n)
```

Wait for explicit user "y" before editing. The user is the editor.

### 5. After approval

- Edit the target file (use Edit tool with surgical replacements — don't rewrite the whole file).
- Append a dated entry to the appropriate `.claude/agent-memory/{name}.md`.
- Confirm with a one-line summary.

## Output format

```markdown
# Self-update digest — YYYY-MM-DD

Signals processed: N
Out-of-scope: K
Proposed updates: P

## Proposed updates

### 1. {short title}
**File** · **Section** · **Reason** · **Diff** · Apply? y/n

### 2. ...
```

## Hard rules

- ❌ Never modify CLAUDE.md or any rule file without explicit user approval.
- ❌ Never auto-add to agent-memory without the user signing off (it influences future runs).
- ❌ Never propose more than 5 updates per pass — pick the most impactful.
- ✅ Always include the WHY (signal source: "user said X at step Y") so the user can judge the proposal.
- ✅ Always show the proposed diff, not just a description.

## Detecting drift across runs

If multiple `agent-memory/{agent}.md` files have an entry for the same kind of issue across different dates, that's drift — the agent's prompt itself needs strengthening, not just memory accumulation. In that case, propose updating the agent file (`.claude/agents/{name}.md`) directly.

## Cleanup pass

Once a quarter (or when memory files exceed ~50 entries each), run a consolidation:
- Drop entries older than 90 days unless they describe a still-relevant constraint.
- Merge duplicates.
- Promote frequently-cited patterns from agent-memory into the agent prompt itself.

This keeps the memory cheap to read and prevents agents from getting bogged down in stale lessons.
