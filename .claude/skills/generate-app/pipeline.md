# Pipeline — exact prompts per step

How to invoke each sub-agent. Copy-paste these prompts when calling the Agent tool.

---

## Step 1 — app-strategist

**Tool**: `Agent(subagent_type="app-strategist", prompt=<below>)`

```
The user-provided brief is between the markers below. Read CLAUDE.md, .claude/rules/cost-control.md, and the relevant `.claude/domains/{vertical}.md` (after you classify the vertical) first. Then write .planning/product-brief.md following your output spec exactly.

Required new fields: `domain` (from {fitness | finance | journal | social | productivity | dating | creative | health | utility | travel}), `cadence` (from {daily | weekly | session-based | one-shot}), `confidence` (0-100).

If `confidence < 70`, list 1-3 follow-up questions in a "Questions for the user" block at the end. The orchestrator will surface them BEFORE proceeding to step 2. Otherwise no questions.

--- BRIEF ---
{user_brief}
--- END BRIEF ---
```

Validation: file `.planning/product-brief.md` exists, has `domain` + `cadence` + `confidence` fields, no placeholder `...` left.

If `confidence < 70`: surface follow-up questions to the user, wait for answers, then re-invoke the agent with the additional context.

---

## Step 2 — branding-strategist

```
Read .planning/product-brief.md. Apply the rules in your agent definition. Write .planning/branding.md.

Constraints reminder: name 1–2 syllables ideal, tagline ≤ 8 words, no em-dash, FR+EN pronounceable.
```

🛑 Checkpoint 1 message to user:

```
**Branding** — '{tagline}' · {Name}
Tone: {3 adjectives}.

GO / REFAIRE / AJUSTER ?
```

---

## Step 3a — design-researcher (NEW)

```
Read .planning/product-brief.md (note `domain`) and .planning/branding.md. Read .claude/skills/design-research/categories/_default.md AND .claude/skills/design-research/categories/{domain}.md (fall back to _default if missing).

Run WebSearch + WebFetch on the reference apps for the vertical. Synthesize patterns into .planning/design-research.md with: 5-8 reference apps, visual language patterns (typography hierarchy, color usage, density), IA patterns, core action flow storyboard, stats/charts patterns, customization knobs, vertical-specific anti-patterns.

Cost: 10-20 WebSearch queries, 5-10 WebFetch fetches max. Aim for 1500-2500 words, dense, scannable.
```

Validation: `.planning/design-research.md` exists, has 5+ reference app sections, references at least 5 high-signal URLs.

## Step 3b — design-system-architect

```
Read .planning/product-brief.md, .planning/branding.md, .planning/design-research.md (visual language patterns). Read the current global.css and tailwind.config.js.

Pick a palette aligned with the brand tone AND the visual patterns observed in the research. Write BOTH:
1. Updated global.css with new :root and .dark blocks (keep variable names exactly). The orchestrator WILL grep `global.css` for the agreed primary hex — fail loudly if absent.
2. .planning/design-system.md with palette, typography, radius, visual signature, anti-patterns. Reference specific moves from design-research.md.

Verify mentally: WCAG AA contrast on foreground/background, primary differs from secondary in hue family.
```

After return: orchestrator MUST `Read global.css` and verify the primary token RGB matches what was specified in `.planning/design-system.md`. If not, hand back to the agent for the actual write.

## Step 3c — icon-and-splash-designer

Run AFTER design-system-architect.

```
Read .planning/branding.md, .planning/design-system.md, .planning/design-research.md. Write .planning/visual-assets.md with 3 icon concepts (pick one explicitly).

Generate the actual PNGs (mandatory):
1. Try `Skill("seo-image-gen", ...)` for `assets/images/icon.png` (1024×1024) first.
2. Fallback: write SVG to `assets/images/icon.svg` and convert via `rsvg-convert` / `sharp-cli` / `svgexport`.
3. Last resort: a minimal placeholder PNG at the primary background color.

Repeat for splash.png. Verify the icon.png file exists before returning.
```

After return: orchestrator MUST `Bash("ls -la assets/images/icon.png")`. If absent, fail and re-invoke.

🛑 Checkpoint 2 message:

```
**Design** — palette + typo + icon concept.

Primary: {hex} · Secondary: {hex} · Background: {hex} (light)
Typo: {font choice}
Icon: {1-line concept}

GO / REFAIRE / AJUSTER ?
```

---

## Step 4 — app-architect (two phases, ONE sub-agent invocation)

```
Read .planning/product-brief.md (note `cadence`), .planning/branding.md, .planning/design-system.md, .planning/design-research.md, AND .claude/domains/{vertical}.md.

Run BOTH phases of your richer spec:
1. VISION → .planning/app-vision.md — includes cadence, hero screens, emotional moments seed, premium boundary, chart taxonomy, T1A budget, customization knobs, smart defaults, empty states.
2. MATCH → .planning/app-architecture.md — includes intra-screen surfaces (segments, swipe actions, FAB), per-feature paywall slugs, hero markers, chart kinds per surface.

Mark 1-3 screens as `hero: true` — the screen-spec-writer will produce detailed wireframes for these in step 7.5.

Reuse existing routes when possible: app/(tabs)/_layout.tsx, app/auth/sign-in.tsx, app/paywall.tsx. Onboarding goes under app/onboarding/ — it's a baseline pattern.
```

(No checkpoint here. Continue.)

## Step 4.5 — experience-designer (NEW)

```
Read .planning/product-brief.md, .planning/branding.md, .planning/design-system.md, .planning/design-research.md, .planning/app-architecture.md, AND .claude/domains/{vertical}.md.

Write .planning/experience.md per your spec: 3-7 emotional moments (trigger + surface + microcopy hint + frequency cap), notification strategy (2-4 push types), streak/PR/milestone surfaces, first-24h experience map, comeback flow, sound + haptics moments.

Tie every moment to a code-detectable trigger condition. Use the brand voice from branding.md. Reference design-research.md for vertical-specific moment patterns.
```

## Step 4.6 — onboarding-designer (NEW)

```
Read .planning/product-brief.md, .planning/branding.md, .planning/app-architecture.md, .planning/experience.md, AND .claude/domains/{vertical}.md.

Default decision: INCLUDE 3-step micro-onboarding (welcome → profile → preferences). Skip ONLY if persona is technical AND personalization adds zero value — and justify in 1 line.

Write .planning/onboarding.md per your spec: per-step microcopy hint, capture fields, skip options, notification opt-in moment timing, vertical-specific extras.
```

---

## Step 5 — db-schema-designer

```
Read .planning/app-architecture.md § "State / data needs", .planning/onboarding.md (preferences fields). Read lib/db/schema.ts (note the baseline `user_preferences` local-only table — preserve it).

Write:
1. Updated lib/db/schema.ts with new tables. Preserve sync metadata fields on every synced table. Use plain `integer` for timestamps. Do NOT remove `user_preferences`.
2. .planning/db-schema.md with Drizzle summary + Postgres DDL + RLS for each synced table + `seed_rows: T[]` declarations for tables that ship with starter content (e.g. `exercises` for fitness, `categories` for finance).

Then orchestrator runs `npm run db:generate`.
```

After sub-agent returns:
1. If `drizzle/migrations.ts` exists as a hand-written stub, delete it (`rm drizzle/migrations.ts`). Drizzle-kit auto-generates `migrations.js` and a leftover `.ts` will be picked up by the TS resolver and shadow it — `ensureMigrations()` then no-ops, tables never get created.
2. Run `Bash(npm run db:generate)`. Verify `drizzle/<NNNN>_*.sql` AND `drizzle/migrations.js` AND `drizzle/meta/_journal.json` exist.

---

## Step 6 — paywall-designer

```
Read .planning/product-brief.md and .planning/app-architecture.md (especially the premium gates list). Read lib/revenuecat/entitlements.ts.

Write .planning/paywall.md per your spec. Default: $4.99/mo, $29.99/yr (50% off), 7d trial on yearly. Adjust if the persona profile suggests different price sensitivity.
```

🛑 Checkpoint 3 message:

```
**Paywall** — pricing + triggers.

Products:
- {monthly} · {yearly} ({trial})
Triggers: {N} (settings, in-context gate "{feature}", soft prompt day 3)

GO / REFAIRE / AJUSTER ?
```

---

## Step 7 — copywriter

```
Read .planning/branding.md, .planning/app-architecture.md (i18n key list), .planning/experience.md (moment microcopy hints), .planning/onboarding.md (per-step copy), .planning/paywall.md. Read messages/fr.json and messages/en.json.

Write to BOTH messages/fr.json and messages/en.json. Same key set in both. Apply voice from branding.md and rules from .claude/rules/content.md.

Cover ALL of:
- Tab labels, screen titles, section headers
- Onboarding step copy (welcome / profile / preferences / done)
- Per-feature paywall copy: paywall.gate.{slug}.{title,subtitle,cta} for every gate slug in app-architecture.md (NOT a single generic paywall.title — per-feature)
- Experience moment microcopy (first completion, streak milestone, comeback, etc.)
- Empty states / error states / loading states
- Settings rows + preferences UI

Don't invent keys not listed in any planning doc. Don't delete existing keys. Parity hook blocks on FR↔EN drift.
```

🛑 Checkpoint 4 message:

```
**Copy** — voice samples.

App tagline (FR): "{...}"
App tagline (EN): "{...}"
Paywall hero (FR): "{...}"
Paywall hero (EN): "{...}"
Primary CTA (FR/EN): "{...}" / "{...}"

GO / REFAIRE / AJUSTER ?
```

---

## Step 7.5 — screen-spec-writer (NEW)

```
Read ALL planning docs in .planning/. Read messages/fr.json + messages/en.json (you must reference real keys, not invent). Read components/ui/*.tsx and components/forms/*.tsx (the primitives library — reference by exact name).

For every screen marked `hero: true` in app-architecture.md (max 1-3), write a wireframe spec in .planning/screen-specs.md per your output template: layout zones top-to-bottom, typography hierarchy with concrete tokens, density, intra-screen interactions, state variants (empty/loading/error/premium-locked/success), data sources, charts, smart defaults, accessibility, microinteractions, and a citation to the design-research pattern.

Flag any missing primitive at the TOP of the file in a "Primitives needed" section.
```

## Step 8 — code-generator

```
Read ALL planning docs in .planning/ — especially .planning/screen-specs.md for hero screens (follow the wireframe exactly) and .planning/design-research.md (for non-hero screens that should still draw from vertical patterns).

Read components/ui/*.tsx, components/forms/*.tsx and current app/* routes. Read your own agent file (.claude/agents/code-generator.md) — note the Cross-cut contracts table and the Skill invocations table.

Implement everything in .planning/app-architecture.md:
1. Update app.json: name, slug, scheme, bundle id from branding.md.
2. Create new screens. USE THE RICH PRIMITIVE LIBRARY: <Card>, <ListRow>, <EmptyState>, <Skeleton>, <Stat>, <Tag>, <Header>, <Segmented>, <Toast>, <IconButton>, <Sheet>, <Chart>, <SwipeableRow>, <FormField>, <NumericInput>, <UnitInput>, <Select>, <Stepper>, <DateField>, <Switch>, <Avatar>, <Icon>. NEVER raw <View> + <Text> for layouts that have a primitive.
3. Wire <PremiumGate feature="..."> at every gate listed.
4. Use Drizzle's useLiveQuery for any list data. Add <Skeleton> on initial load.
5. Use t("...") for every visible string.
6. For every table marked "synced" in db-schema.md, call `registerSyncTable<T>(meta)` from `lib/db/sync.ts` somewhere at boot (typically in `app/_layout.tsx`). The driver is generic — register, don't reinvent.
7. For every new entry in ANALYTICS_EVENTS, ensure a firing site exists.
8. Wire onboarding gate via `useOnboardingGate()` in `app/_layout.tsx` (after `ensureMigrations()`).
9. If db-schema.md declares `seed_rows`, call `ensureSeed([{table, rows, version}])` from `lib/db/seed.ts` at boot.
10. Implement experience.md moments via the surfaces specified there (Sheet / Toast / Banner / Modal). No improvising.
11. Tab bar: every <Tabs.Screen> has `tabBarIcon: ({ color, size }) => <Icon name="...">` with a sensible lucide name.
12. Pushed (non-tab) screens: use <Header onBack={() => router.back()} title={...}> — root Stack has headerShown: false.

Mandatory Skill invocations BEFORE writing each screen type:
- Lists / detail / forms → Skill("mobile-ux-patterns", "...")
- Hero screens → Skill("ui-ux-pro-max", "...") for color/font/component reference
- Onboarding screens → Skill("mobile-ux-patterns", "onboarding")
- Stats / charts → Skill("ui-ux-pro-max", "chart {kind} for {vertical}")

Run the 10-point self-audit (see code-generator.md) before declaring done.

After all writes:
- Run `npx tsc --noEmit`. Fix any errors before returning.

Do NOT add new dependencies without asking. Do NOT bypass any rule in .claude/rules/.
```

After return: run the **first-boot smoke gate** (Bash). Three commands, all must pass before continuing to step 9:

1. `npx tsc --noEmit` — zero errors.
2. `npx expo config --type public` — must succeed (proves `app.json` plugins resolve, no missing native modules referenced at config-load time, no broken plugin entries).
3. `npx expo export --platform web --output-dir /tmp/_smoke` — full Metro bundle. Catches Babel/NativeWind/Drizzle-SQL/inline-import wiring issues in ~15-30s without needing a simulator.

If any of the three fails, hand the error back to `code-generator` with the exact stderr — do not proceed to step 9. Common breakages and their cause:
- `Type 'number' is not assignable to type 'Date | SQLWrapper'` → schema used `mode: "timestamp_ms"`. Drop the mode.
- `'captureAppLifecycleEvents' does not exist in type 'PostHogOptions'` → use `captureNativeAppLifecycleEvents`.
- `'profilesSampleRate' does not exist in type 'ReactNativeOptions'` → remove from Sentry init.
- `Missing semicolon (1:6)` in a `.sql` file → `babel-plugin-inline-import` not installed or not in `babel.config.js`.
- `Unable to resolve module ./0000_*.sql` → `metro.config.js` missing `config.resolver.sourceExts.push("sql")`.
- `Cannot find module 'nativewind/babel'` → remove that preset, NativeWind v4 uses metro plugin only.
- `Cannot find module .../SQLiteDatabase` (during `expo config`) → `expo-sqlite` declared as a plugin in `app.json` with the `enableFTS`/`useSQLCipher` shape — remove the plugin entry entirely (auto-linked).
- `NativeDatabase is not a constructor` (web export only) → set `web.output: "single"` in `app.json`.
- `Cannot find module 'expo/tsconfig.base'` (IDE only) → run `npm install`, restart TS Server.
- `ERESOLVE unable to resolve dependency tree` (npm install) → React vs RN peer mismatch. See expo-bootstrap version matrix.

---

## Step 8.5 — polish-pass (NEW)

Run AFTER step 8 smoke gate is green.

```
Read all .planning/*.md and the just-generated code in app/, components/, lib/.

Walk your 16-point checklist (see polish-pass.md): tab icons, headers on pushed screens, list-row chevrons, EmptyState visual elements, primary CTA leftIcon, section header treatment, View+Text → Card replacement, Stat usage on numerics, haptics on interactions, toast on async confirms, per-feature paywall copy verification, Skeleton on initial load, tabular numerics, primary token visibility, greeting on home, microinteractions.

Apply surgical Edit calls. Run `npx tsc --noEmit` after — must remain clean. Never break the build.

Output .planning/polish-delta.md with: edit count per category, list of edits with file:line, flags for things you couldn't auto-fix.
```

## Step 9 — backend-provisioner

```
Read .planning/db-schema.md, .planning/paywall.md, app.json (slug + bundle id).

Write .planning/backend-setup.md as a checklist the user can follow. Update .env.example with any new keys (placeholder only, never values).

Do NOT run any billable CLI command. Do run:
- npx eas init --id (free, generates project id)
- supabase init (if supabase CLI is installed — scaffolds migrations folder)

Hand off to skills if the user wants to go deeper:
- /supabase-schema — regenerate SQL files
- /revenuecat-paywall — walk through dashboard config
- /sentry-rn-minimal — verify config matches free tier
- /posthog-events-allowlist — audit event allowlist
```

---

## Step 10 — qa-reviewer

```
Read .planning/app-architecture.md and all .planning/ docs (including polish-delta.md). Read app/, components/, lib/, messages/.

Run your full checklist (Build, Architecture, Data, i18n, Design, Security, Cost, Visual sanity, Auto-signals). Be specific (line numbers). Output .planning/qa-report.md.

Recommendation = ✅ if all FIVE critical sections (Build, Data, i18n, Security, Visual sanity) pass. Otherwise ⚠️ with prioritized fix list.

Auto-signals section MUST list any silent quality gaps detected (e.g., "0 charts shipped despite 3 stat features in arch") for /self-update to consume.
```

After return:
- If ✅: tell user to `npm install && npx expo start`.
- If ⚠️: offer to re-run code-generator with the fix list as input.
