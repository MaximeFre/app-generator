# Pipeline — exact prompts per step

How to invoke each sub-agent. Copy-paste these prompts when calling the Agent tool.

---

## Step 1 — app-strategist

**Tool**: `Agent(subagent_type="app-strategist", prompt=<below>)`

```
The user-provided brief is between the markers below. Read CLAUDE.md and .claude/rules/cost-control.md first. Then write .planning/product-brief.md following your output spec exactly.

If the brief is too vague to fill any required section, leave a "Questions for the user" block at the end with 3–5 specific questions.

--- BRIEF ---
{user_brief}
--- END BRIEF ---
```

Validation: file `.planning/product-brief.md` exists, has all sections, no placeholder `...` left.

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

## Step 3a — design-system-architect

```
Read .planning/product-brief.md and .planning/branding.md. Read the current global.css and tailwind.config.js.

Pick a palette aligned with the brand tone. Write BOTH:
1. Updated global.css with new :root and .dark blocks (keep variable names exactly).
2. .planning/design-system.md with palette, typography, radius, visual signature, anti-patterns.

Verify mentally: WCAG AA contrast on foreground/background, primary differs from secondary in hue family.
```

## Step 3b — icon-and-splash-designer

Run AFTER design-system-architect.

```
Read .planning/branding.md and .planning/design-system.md. Write .planning/visual-assets.md with 3 icon concepts (pick one explicitly), splash spec, generation prompts. Don't generate the actual images yet — just the plan and prompts.
```

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
Read .planning/product-brief.md, .planning/branding.md, .planning/design-system.md.

Run BOTH phases of your spec:
1. VISION → .planning/app-vision.md (free-form screens, flows, premium boundary)
2. MATCH → .planning/app-architecture.md (mapped to existing routes + new files to create)

The MATCH file must list:
- Every route to create or edit (with absolute path).
- Every <PremiumGate feature="..."> insertion with slug.
- Every i18n key to add (dot-notation, no values yet).
- Every Drizzle table needed (name only — schema in step 5).

Reuse existing routes when possible: app/(tabs)/index.tsx, settings.tsx, app/auth/sign-in.tsx, app/paywall.tsx.
```

(No checkpoint here — too early to be useful. Continue.)

---

## Step 5 — db-schema-designer

```
Read .planning/app-architecture.md § "State / data needs" and § "Routes". Read lib/db/schema.ts and lib/db/sync.ts.

Write:
1. Updated lib/db/schema.ts with new tables. Preserve the 6 sync metadata fields on every synced table (id, serverId, createdAt, updatedAt, dirty, deletedAt). Use the same column types as the existing `items` table.
2. .planning/db-schema.md with Drizzle table summary + Postgres DDL + RLS for each synced table.

Then I will run `npm run db:generate` to produce migrations.
```

After sub-agent returns: run `Bash(npm run db:generate)`. Verify `drizzle/0001_*.sql` (or higher) exists.

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
Read .planning/branding.md, .planning/app-architecture.md (i18n key list), .planning/paywall.md. Read messages/fr.json and messages/en.json.

Write to BOTH messages/fr.json and messages/en.json. Same key set in both. Apply voice from branding.md and rules from .claude/rules/content.md.

Don't invent keys not listed in app-architecture.md. Don't delete existing keys.

The post-write hook will block if FR/EN parity is broken — verify before finishing.
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

## Step 8 — code-generator

```
Read ALL planning docs in .planning/. Read components/ui/*.tsx and current app/* routes.

Implement everything in .planning/app-architecture.md § "Routes to create" + § "Premium gates":
1. Update app.json: name, slug, scheme, bundle id from branding.md.
2. Create new screens reusing <Screen>, <Button>, <Input> primitives.
3. Wire <PremiumGate feature="..."> at every gate listed.
4. Use Drizzle's useLiveQuery for any list data.
5. Use t("...") for every visible string.

After all writes:
- Run `npx tsc --noEmit`. Fix any errors before returning.
- Glob app/ components/ lib/ for new files; confirm count matches plan.

Do NOT add new dependencies without asking. Do NOT bypass any rule in .claude/rules/.
```

After return: verify with `npx tsc --noEmit` once more (Bash).

---

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
Read .planning/app-architecture.md and all .planning/ docs. Read app/, components/, lib/, messages/.

Run your checklist exactly. Be specific (line numbers). Output .planning/qa-report.md.

Recommendation = ✅ if all four critical sections (Build, Data layer, i18n, Security) pass. Otherwise ⚠️ with prioritized fix list.
```

After return:
- If ✅: tell user to `npm install && npx expo start`.
- If ⚠️: offer to re-run code-generator with the fix list as input.
