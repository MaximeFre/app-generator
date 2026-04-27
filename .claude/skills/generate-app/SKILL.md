---
description: Génère une nouvelle app Expo de bout en bout depuis un brief produit. Lance la pipeline 10 étapes (strategy → branding → design → architecture → DB schema → paywall → copy → code → backend setup → QA) avec 4 checkpoints utilisateur. Utilise les sous-agents .claude/agents/* et les skills custom (expo-bootstrap, supabase-schema, etc.). Triggers `/generate-app`, "génère l'app", "scaffold une nouvelle app", "lance la pipeline", "nouveau projet".
argument-hint: [brief produit multi-lignes — décris l'app, le persona, ce qui est gratuit/premium. Vide = saisie guidée.]
---

# /generate-app — pipeline orchestrator

You are orchestrating the full app generation. Read the brief, run the pipeline, pause at checkpoints, hand off to sub-agents at each step.

## 0. Brief intake

If the user passed a brief: use it as-is.
If empty: ask in ONE message:
1. Idée d'app en 1–2 phrases ?
2. Pour qui (persona, contexte) ?
3. Le truc gratuit local vs ce que tu vendras en premium (1 phrase chacun) ?
4. Bilingue FR+EN ou EN-only ?
5. Style général (épuré / coloré / éditorial) ?

Don't ask more. Take what you have and start.

## Sources of truth (read once, share with sub-agents via prompts)

- `CLAUDE.md` (project model)
- `.claude/rules/*.md` (cost-control, design-system, data-and-sync, expo-rn, content, security, architecture, self-update)
- `.claude/agent-memory/_global.md` (cross-cutting lessons from prior runs)
- `package.json`, `app.json`, `lib/db/schema.ts`, `lib/db/sync.ts`, `app/_layout.tsx`, `components/ui/*.tsx`
- `docs/*.md` (architecture, data-sync, design-system, i18n, components, user-guide)

Never duplicate these into the pipeline doc — link sub-agents to them.

## Memory loading

Before invoking each sub-agent, instruct it to read `.claude/agent-memory/{agent-name}.md` first. This file may be empty or contain dated lessons from prior runs.

## Pipeline — 10 steps with 4 checkpoints

### Step 1 — Product strategy
**Sub-agent**: `app-strategist`
**Input**: user brief
**Output**: `.planning/product-brief.md`
**Then**: brief summary to user (elevator pitch + persona name + free/premium split table). NO checkpoint pause.

### Step 2 — Branding
**Sub-agent**: `branding-strategist`
**Input**: `.planning/product-brief.md`
**Output**: `.planning/branding.md`
**🛑 Checkpoint 1**: show name + tagline + tone adjectives. Wait for GO / REFAIRE / AJUSTER.

### Step 3 — Design system
**Sub-agents**: `design-system-architect` + `icon-and-splash-designer`
**Inputs**: `.planning/product-brief.md`, `.planning/branding.md`
**Outputs**: updated `global.css`, `.planning/design-system.md`, `.planning/visual-assets.md`
**🛑 Checkpoint 2**: show palette (5 hex pairs), typography choice, icon concept. Wait for GO / REFAIRE / AJUSTER.

### Step 4 — App architecture
**Sub-agent**: `app-architect` (two-phase: VISION then MATCH)
**Input**: all prior planning
**Outputs**: `.planning/app-vision.md`, `.planning/app-architecture.md`
**Then**: short summary (N tabs, M screens, K premium gates).

### Step 5 — Database schema
**Sub-agent**: `db-schema-designer`
**Input**: `app-architecture.md`
**Outputs**: updated `lib/db/schema.ts`, `.planning/db-schema.md` (includes Postgres DDL + RLS).
**Then**: run `npm run db:generate` (Bash). Confirm migration files exist in `drizzle/`.

### Step 6 — Paywall strategy
**Sub-agent**: `paywall-designer`
**Inputs**: brief, architecture
**Output**: `.planning/paywall.md`
**🛑 Checkpoint 3**: show pricing table + paywall triggers. Wait for GO / REFAIRE / AJUSTER.

### Step 7 — Copy
**Sub-agent**: `copywriter`
**Inputs**: branding, architecture
**Outputs**: updated `messages/fr.json` + `messages/en.json`
**Then**: 3 sample lines (FR | EN side-by-side).
**🛑 Checkpoint 4**: confirm voice. Wait for GO / REFAIRE / AJUSTER.

### Step 8 — Code generation
**Sub-agent**: `code-generator`
**Inputs**: ALL planning docs
**Outputs**: new screens, components, lib modules, updated `app.json` (name/slug/bundle).
**Validation**: `npx tsc --noEmit` MUST pass. The `typecheck-touched.sh` hook will already enforce per-file but run a final full check.

### Step 9 — Backend provisioning
**Sub-agent**: `backend-provisioner`
**Inputs**: db-schema, paywall, app.json
**Output**: `.planning/backend-setup.md` + updated `.env.example`
**Then**: present checklist to user. They run dashboard steps. The `billing-guardrail.sh` hook prevents accidental paid commands.
**Skill hand-offs available**: `supabase-schema` (regenerate SQL), `revenuecat-paywall` (configure products), `sentry-rn-minimal` (verify config), `posthog-events-allowlist` (audit events).

### Step 10 — QA
**Sub-agent**: `qa-reviewer`
**Output**: `.planning/qa-report.md`
**Then**: ✅ ship-ready OR ⚠️ fix list.

If ✅: instruct user to run `npm install && npx expo start`.
If ⚠️: offer to spawn `code-generator` again with the fix list.

## Optional final step

If user wants store listing: invoke `store-listing-writer` → `.planning/store-listing.md`.
If user wants production build: invoke `expo-eas-deploy` skill (gated by guardrail).

## Orchestration rules

- ❌ Never skip a checkpoint pause. The user picks the speed.
- ❌ Never write code in step 1–7. Code is only step 8.
- ❌ Never modify `lib/db/schema.ts` outside step 5 (db-schema-designer).
- ❌ Never modify `messages/*.json` outside step 7 (copywriter).
- ✅ Always hand off to sub-agents via the Agent tool with `subagent_type` matching the agent name. Pass the user's brief and pointers to planning files; don't duplicate file contents.
- ✅ Always read `.planning/*.md` before invoking a sub-agent that depends on prior steps — don't trust your own memory across long pipelines.
- ✅ At each checkpoint, format the summary as a short (≤ 10 line) block the user can scan in 5 seconds.

## Templates

See `.claude/skills/generate-app/pipeline.md` for the exact prompts to pass to each sub-agent.

## Self-update tail (mandatory)

After step 10, BEFORE the final output message, invoke `/self-update`:
- If user said REFAIRE / AJUSTER at any checkpoint: run a digest, propose 1–3 updates, wait for y/n.
- If everything went smoothly: short "no learnings this run" line and skip.

This is what makes the pipeline get sharper over time.

## Final output

After step 10, write a single message:

```
✅ {AppName} v0.1 generated.
   {N} screens · {T} tables · {P} premium gates · {E} analytics events

Next:
  npm install
  cp .env.example .env  # fill keys per .planning/backend-setup.md
  npm run db:generate
  npx expo start

Planning docs in .planning/ (commit them — they're your design memory).
```
