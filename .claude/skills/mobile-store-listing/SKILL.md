---
description: Expert ASO (App Store Optimization) for App Store + Google Play. Title/subtitle/keyword strategy, conversion-rate-tested screenshot patterns, what's-new copy, in-app event registration, localization. Use when writing store listings, designing screenshots, or improving conversion. Triggers `/mobile-store-listing`, "ASO", "store listing", "screenshots", "app store optimization".
---

# Mobile store listing — expert ASO

## How discovery actually works

### App Store (iOS)
- **Search** is the dominant install source for indie apps.
- Apple ranks by: title (×3) + subtitle (×2) + keywords (×1) + downloads + ratings + freshness.
- Browse (Today/Apps tabs) is editor-curated — irrelevant for cold start.
- Apple Search Ads exists but you don't need it if your keywords match volume.

### Google Play (Android)
- **Title + short description + full description (first 250 chars)** all indexed by Google.
- Reviews and review velocity matter heavily.
- Play boosts apps with low uninstall rates → ship a working v1.

## Title strategy

≤ 30 chars BOTH stores.

Format: `{BrandName}: {Benefit}`. The benefit gets you the keyword.

Examples:
- `Streaks: Daily Habit Tracker`  (32, too long, trim → `Streaks: Habit Tracker` = 22)
- `Bear: Markdown Notes`
- `Calmly: Meditation & Sleep`

If your brand name is long, drop the colon: `MealTracker — Calorie Diary`. Avoid em-dash.

Don't keyword-stuff (`Best Habit Tracker Daily Routine App`). Apple flags it; Google penalizes via low conversion.

## Subtitle (iOS) / Short description (Android)

iOS subtitle: ≤ 30 chars. Android short desc: ≤ 80 chars.

This is your second-best ranking signal. Use a different keyword from the title.

Examples:
- iOS: `Daily journal, fully offline` (28)
- Android: `Track your habits, free local-first journal with cloud sync` (60)

Rules:
- Lead with a noun, not a verb. ("Daily journal" beats "Track your habits".)
- One concrete benefit, not abstract.
- No emoji on iOS.

## Keywords field (iOS only, ≤ 100 chars, comma-separated)

Tactical:
- DO NOT repeat words from title or subtitle (already indexed).
- DO NOT include category names (Apple auto-includes).
- DO NOT use spaces around commas (`a,b,c` not `a, b, c`).
- DO use single keywords, not phrases (Apple combines them).
- DO use plural forms users actually search.

Example for a habit tracker:
`title=Streaks: Habit Tracker, subtitle=Daily routines, fully offline`

```
keywords=streak,routine,goal,daily,checklist,reminder,journal,planner,productivity,wellness
```

## Description (both stores) — 4000 chars max

Above-the-fold = first 3 lines on iOS, first 100 chars on Android. Hook there.

Template:

```
{Hook line — concrete promise}
{Persona line — who it's for}
{Differentiator — what makes you different}

WHY {App}
• {Benefit 1, concrete}
• {Benefit 2, concrete}
• {Benefit 3, concrete}

{App} PREMIUM
{What it unlocks. Required if you have IAP.}

PRIVACY
{1 line: local-first by design.}

{Subscription disclosure — required for IAP on iOS:}
{Plan name and length, e.g. "Premium Monthly: $4.99/month, Premium Yearly: $29.99/year"}
{Trial details, e.g. "7-day free trial included with yearly subscription"}
Subscriptions auto-renew unless cancelled at least 24h before the end of the period.
Manage and cancel in your device's account settings.

Privacy policy: https://yoursite.com/privacy
Terms: https://yoursite.com/terms
```

Apple WILL reject if subscription apps don't disclose price + auto-renewal in the description.

## Screenshots — 2× conversion vs default

### iOS sizes needed

Apple requires only one size: **iPhone 6.7"** (1290 × 2796). Apple auto-resizes for smaller iPhones.

### Pattern — proven layout

Each screenshot = a marketing card, not a UI screenshot.

```
+----------------------------------+
|  [Big bold headline ~40pt]       |
|                                  |
|     {short benefit, 5–10 words}  |
|                                  |
|                                  |
|     [App screenshot, 70% size]   |
|                                  |
|                                  |
|       {your brand color bg}      |
+----------------------------------+
```

6 screenshots in this order:
1. **Hero** — main JTBD + 1-line value prop.
2. **Capture in action** — the core feature.
3. **Premium feature** — what they upgrade for.
4. **Edge benefit** — niche feature that wins one persona.
5. **Social proof** — "Join 10k users" or a testimonial (if you have one).
6. **CTA-style** — "Start your 7-day free trial".

### Localized

If your app supports FR + EN, upload screenshot pairs in BOTH languages. Apple shows the right one based on user's device locale. Conversion lift in non-English markets: 1.5–2x.

## What's new (release notes)

Per release, ≤ 4000 chars. Most users see only the first 200.

```
v1.2 — Faster sync, cleaner empty states
• Sync now happens in background when you re-open the app
• New empty state on Home shows your most-used filters
• Fixed: dark mode flicker on launch (thanks @user12)
```

Anti-pattern: `Bug fixes and performance improvements.` — wastes a marketing slot.

## In-app events (iOS only)

Apple lets you promote events in the App Store (e.g., "Premium 50% off this week"). Free, requires ASC submission. Useful for seasonal campaigns post-launch.

## Localization

Each locale = independent listing. Title/subtitle/description/keywords/screenshots all separate per locale.

Priority order (most ROI):
1. `en-US`
2. `en-GB` (different keywords)
3. `de-DE`, `fr-FR` (high-spend Western markets)
4. `ja-JP`, `ko-KR` (high-conversion Asian markets if your app lands there)
5. Spanish, Portuguese (high-volume, lower spend per user)

## Privacy nutrition label (iOS, mandatory)

In App Store Connect → App Privacy. For this template's defaults:

| Data type | Linked to user | Used for tracking |
|---|---|---|
| Identifiers (Supabase user id) | Yes (if signed in) | No |
| Analytics (PostHog product analytics) | No | No |
| Diagnostics (Sentry crash data) | No | No |

Don't claim "no data collected" — you'll fail review when they detect Sentry's auto-instrumentation.

## Anti-patterns

- ❌ Vague titles ("Daily" — too generic, no keyword).
- ❌ Em-dash, ampersand, special chars in title.
- ❌ Lying in screenshots (showing features not in v1) — Apple rejects.
- ❌ Pricing in screenshots (changes too often).
- ❌ Reviews-bombing your own app from internal accounts (Apple/Google detect and de-rank).
- ❌ Cloning a competitor's listing — similarity check rejection.

## Tools

- **App Store Connect** — official.
- **Play Console** — official.
- **Figma + a 6.7" iPhone screenshot template** — for design.
- **Mockuups Studio** or **Previewed.app** — quick screenshot mockups.
- **AppFigures / Sensor Tower / data.ai** — keyword research and competitor monitoring (paid past free trial).

## Output for /generate-app

When invoked from the pipeline, write `.planning/store-listing.md` with:
- Title (FR + EN)
- Subtitle (FR + EN)
- Short description (Android, FR + EN)
- Description (FR + EN)
- Keywords (iOS, FR + EN)
- 6 screenshot concepts (1 sentence each)
- Required URLs (privacy, terms, support)
