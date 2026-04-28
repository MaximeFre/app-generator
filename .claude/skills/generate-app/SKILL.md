---
description: Génère une nouvelle app Expo de bout en bout depuis un brief produit. Lance la pipeline (~14 étapes, 4 checkpoints utilisateur) avec recherche design pipeline-time, expérience designer, onboarding designer, screen specs détaillés, polish-pass, et QA visuelle. Utilise les sous-agents .claude/agents/* et les skills custom (expo-bootstrap, supabase-schema, mobile-ux-patterns, ui-ux-pro-max, etc.). Triggers `/generate-app`, "génère l'app", "scaffold une nouvelle app", "lance la pipeline", "nouveau projet".
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
- `.claude/domains/{vertical}.md` (default IA / cadence / chart kinds per vertical — read by strategist + architect)
- `.claude/skills/design-research/categories/{vertical}.md` (research grid for `design-researcher`)
- `package.json`, `app.json`, `lib/db/schema.ts`, `lib/db/sync.ts`, `app/_layout.tsx`, `components/ui/*.tsx`, `components/forms/*.tsx`
- `docs/*.md` (architecture, data-sync, design-system, i18n, components, user-guide)

Never duplicate these into the pipeline doc — link sub-agents to them.

## Memory loading

Before invoking each sub-agent, instruct it to read `.claude/agent-memory/{agent-name}.md` first. This file may be empty or contain dated lessons from prior runs.

## Pipeline — ~14 steps with 4 checkpoints

### Step 1 — Product strategy
**Sub-agent**: `app-strategist`
**Input**: user brief
**Output**: `.planning/product-brief.md` (with new fields: `domain`, `cadence`, `confidence`)
**Then**: brief summary to user (elevator pitch + persona name + free/premium split table). If `confidence < 70`, surface the agent's follow-up questions and pause for answers BEFORE step 2. Otherwise NO checkpoint pause.

### Step 2 — Branding
**Sub-agent**: `branding-strategist`
**Input**: `.planning/product-brief.md`
**Output**: `.planning/branding.md`
**🛑 Checkpoint 1**: show name + tagline + tone adjectives. Wait for GO / REFAIRE / AJUSTER.

### Step 3a — Design research (NEW)
**Sub-agent**: `design-researcher`
**Inputs**: `.planning/product-brief.md`, `.planning/branding.md`, `.claude/skills/design-research/categories/{vertical}.md`
**Output**: `.planning/design-research.md` (5-8 reference apps, visual + IA + flow + stats patterns specific to the vertical, drawn from WebSearch + WebFetch on Mobbin / Built for Mars / app store screenshots)
**Then**: short summary of vertical + reference apps + top 3 patterns to steal. NO checkpoint pause.

### Step 3b — Design system
**Sub-agent**: `design-system-architect`
**Inputs**: `.planning/product-brief.md`, `.planning/branding.md`, `.planning/design-research.md`
**Outputs**: updated `global.css` (verified — pipeline greps for the agreed primary hex, fails loudly if missing), `.planning/design-system.md`

### Step 3c — Icon + splash
**Sub-agent**: `icon-and-splash-designer`
**Inputs**: `.planning/branding.md`, `.planning/design-system.md`
**Outputs**: `.planning/visual-assets.md` AND `assets/images/icon.png` (1024×1024) AND `assets/images/splash.png` actually written. Pipeline verifies file existence — fails if missing.
**🛑 Checkpoint 2**: show palette (5 hex pairs), typography choice, icon concept. Wait for GO / REFAIRE / AJUSTER.

### Step 4 — App architecture
**Sub-agent**: `app-architect` (two-phase: VISION then MATCH)
**Input**: all prior planning
**Outputs**: `.planning/app-vision.md`, `.planning/app-architecture.md` (richer: cadence, hero screens, intra-screen surfaces, customization knobs, T1A budget, chart kinds)
**Then**: short summary (cadence, N tabs, M screens, K hero, L premium gates, charts).

### Step 4.5 — Experience design (NEW)
**Sub-agent**: `experience-designer`
**Inputs**: brief, branding, design-system, design-research, app-architecture
**Output**: `.planning/experience.md` (3-7 emotional moments + notification strategy + first-24h map + comeback flow)
**Then**: 1-line summary (N moments, M notifications). NO checkpoint pause.

### Step 4.6 — Onboarding design (NEW)
**Sub-agent**: `onboarding-designer`
**Inputs**: brief, branding, app-architecture, experience
**Output**: `.planning/onboarding.md` (2-3 step flow with capture fields, OR explicit skip with justification)
**Then**: 1-line summary (N steps, fields captured).

### Step 5 — Database schema
**Sub-agent**: `db-schema-designer`
**Input**: `app-architecture.md`, `onboarding.md` (for any preferences-related fields)
**Outputs**: updated `lib/db/schema.ts` (with `user_preferences` baseline retained), `.planning/db-schema.md` (includes Postgres DDL + RLS + `seed_rows` declarations).
**Then**: run `npm run db:generate` (Bash). Confirm migration files exist in `drizzle/`.

### Step 6 — Paywall strategy
**Sub-agent**: `paywall-designer`
**Inputs**: brief, architecture, experience
**Output**: `.planning/paywall.md` (per-feature copy slugs, triggers, products)
**🛑 Checkpoint 3**: show pricing table + paywall triggers. Wait for GO / REFAIRE / AJUSTER.

### Step 7 — Copy
**Sub-agent**: `copywriter`
**Inputs**: branding, architecture, experience, onboarding, paywall
**Outputs**: updated `messages/fr.json` + `messages/en.json` — covers tabs, screens, onboarding.*, paywall.gate.{slug}.*, experience moments microcopy, empty/error/loading states
**Then**: 3 sample lines (FR | EN side-by-side).
**🛑 Checkpoint 4**: confirm voice. Wait for GO / REFAIRE / AJUSTER.

### Step 7.5 — Screen specs (NEW)
**Sub-agent**: `screen-spec-writer`
**Inputs**: ALL prior planning + `messages/{fr,en}.json` + `components/ui/*` + `components/forms/*`
**Output**: `.planning/screen-specs.md` — wireframes for the 1-3 hero screens marked `hero: true` in app-architecture.md
**Then**: 1-line summary (N hero screens covered, missing primitives flagged).

### Step 8 — Code generation
**Sub-agent**: `code-generator` (extended with skill invocations + 10-point self-audit)
**Inputs**: ALL planning docs (especially screen-specs.md for hero screens) + design-research.md (for non-hero screens)
**Outputs**: new screens, components, lib modules, updated `app.json` (name/slug/bundle), tabs layout with icons, onboarding integration, sync engine wired.

The agent MUST:
- Read `.planning/screen-specs.md` BEFORE writing any hero screen.
- Invoke `Skill("mobile-ux-patterns", ...)` for the relevant pattern before writing each screen type.
- Invoke `Skill("ui-ux-pro-max", ...)` for color/font/component reference if uncertain.
- Use the rich primitive library: `<Card>`, `<ListRow>`, `<EmptyState>`, `<Skeleton>`, `<Stat>`, `<Tag>`, `<Header>`, `<Segmented>`, `<Toast>`, `<IconButton>`, `<Sheet>`, `<Chart>`, `<SwipeableRow>`, `<FormField>`, `<NumericInput>`, `<UnitInput>`, `<Select>`, `<Stepper>`, `<DateField>`, `<Switch>`, `<Avatar>`, `<Icon>`.

**Validation — three-gate smoke test**, ALL must pass before step 8.5:
1. `npx tsc --noEmit` — zero errors.
2. `npx expo config --type public` — proves config resolves.
3. `npx expo export --platform web --output-dir /tmp/_smoke` — proves Metro bundles cleanly.

If any gate fails, hand the stderr back to `code-generator` for repair before proceeding.

### Step 8.5 — Polish pass (NEW)
**Sub-agent**: `polish-pass`
**Inputs**: planning docs + the just-generated code
**Output**: `.planning/polish-delta.md` — surgical edits (icons in tabs, chevrons on rows, Card over View+Text, etc.)
**Validation**: `npx tsc --noEmit` after polish edits — must remain clean.

### Step 9 — Backend provisioning
**Sub-agent**: `backend-provisioner`
**Inputs**: db-schema, paywall, app.json
**Output**: `.planning/backend-setup.md` + updated `.env.example`
**Then**: present checklist to user. They run dashboard steps. The `billing-guardrail.sh` hook prevents accidental paid commands.
**Skill hand-offs available**: `supabase-schema`, `revenuecat-paywall`, `sentry-rn-minimal`, `posthog-events-allowlist`.

### Step 10 — QA
**Sub-agent**: `qa-reviewer` (extended with Visual sanity § + auto-signals for /self-update)
**Output**: `.planning/qa-report.md`
**Then**: ✅ ship-ready OR ⚠️ fix list.

If ✅: instruct user to run `npm install && npx expo start`.
If ⚠️: offer to spawn `code-generator` again with the fix list.

## Optional final step

If user wants store listing: invoke `store-listing-writer` → `.planning/store-listing.md`.
If user wants production build: invoke `expo-eas-deploy` skill (gated by guardrail).

## Orchestration rules

- ❌ Never skip a checkpoint pause. The user picks the speed.
- ❌ Never write code in step 1–7.5. Code is only step 8 / 8.5.
- ❌ Never modify `lib/db/schema.ts` outside step 5 (db-schema-designer) — except the baseline `user_preferences` table that ships in template.
- ❌ Never modify `messages/*.json` outside step 7 (copywriter).
- ❌ Never proceed past step 3c without `assets/images/icon.png` existing on disk.
- ✅ Always hand off to sub-agents via the Agent tool with `subagent_type` matching the agent name. Pass the user's brief and pointers to planning files; don't duplicate file contents.
- ✅ Always read `.planning/*.md` before invoking a sub-agent that depends on prior steps — don't trust your own memory across long pipelines.
- ✅ At each checkpoint, format the summary as a short (≤ 10 line) block the user can scan in 5 seconds.
- ✅ At step 8, the code-generator must invoke `mobile-ux-patterns` and `ui-ux-pro-max` skills as required.

## Templates

See `.claude/skills/generate-app/pipeline.md` for the exact prompts to pass to each sub-agent.

## Self-update tail (mandatory)

After step 10, BEFORE the final output message, invoke `/self-update`:
- If user said REFAIRE / AJUSTER at any checkpoint: run a digest, propose 1–3 updates, wait for y/n.
- If everything went smoothly: run a digest of the auto-signals from `qa-reviewer` (e.g., "0 charts shipped despite 3 stat features") — these surface silent quality gaps.
- If both are empty: short "no learnings this run" line and skip.

This is what makes the pipeline get sharper over time.

## Final output

After step 10, write a single message:

```
✅ {AppName} v0.1 generated.
   {N} screens · {T} tables · {P} premium gates · {E} analytics events · {C} charts · {M} moments

Next:
  npm install
  cp .env.example .env  # fill keys per .planning/backend-setup.md
  npm run db:generate
  npx expo start

Planning docs in .planning/ (commit them — they're your design memory).
```
