# Default research scaffold — universal grid

Read this FIRST, regardless of vertical. Then layer the vertical-specific scaffold on top.

## Universal questions to answer for any mobile app

### 1. Onboarding (first 30 seconds)
- Does the leader-class app ask for an account upfront, or let the user start without one?
- What does it ask BEFORE the user can do their first action? (name, goal, preference, permission)
- How many screens until first value delivered?
- Skip-able or hard-gated?
- Push notifs / location / contacts: when (or never)?

### 2. Home / launch screen
- What's the top-most element? (greeting, primary CTA, last-used item, calendar, dashboard?)
- Does it personalize? (name, time-of-day greeting, streak, "next [X]")
- Empty-state design when user has no data — first-run impression.
- Density: how many elements above the fold?

### 3. Core action flow (the JTBD)
The single thing the user opens the app to do. Critical to get right.
- How many taps to start it?
- Full-screen mode or modal?
- Is the flow interruptible (background, multi-tasking)?
- What's the visual hierarchy DURING the action? (typo size, focus element)
- What happens at the end? (summary, share, next action, back to home)

### 4. Lists / collections (programs, sessions, entries, items)
- Card or row?
- Swipe-to-delete? Long-press menu? Tap to edit?
- Drag-to-reorder?
- Search/filter affordance?
- Empty state — illustration, single CTA, helper text?

### 5. Detail / edit views
- Full-screen modal or pushed screen?
- Save: explicit "Done" button or auto-save?
- Cancel: discards changes (with confirm) or autosaves?
- Inline edit vs separate edit screen?

### 6. Settings depth
- Single screen or sectioned navigation?
- Subscription state visible at top?
- Account / profile / preferences split?
- Per-locale: units (metric/imperial), date format, currency?

### 7. Notifications
- Push: when does the leader app ask permission? (Always-on day 1? Or lazy after first value?)
- What kinds of pushes (reminders, milestones, social)?
- In-app: toasts, banners, badges?

### 8. Empty / loading / error states
- Skeleton vs spinner vs nothing?
- Error: full-screen retry vs inline?
- Empty: illustration vs typography only?

### 9. Iconography
- Which icon family does the leader use? (SF Symbols on iOS / lucide / phosphor / custom)
- Where do icons appear? (tab bar, action buttons, inline labels, never?)
- Stroke or filled?

### 10. Premium / paywall
- Where does the trigger appear? (action gate, settings, soft prompt N days in?)
- Visual: full-screen, sheet, modal?
- Copy approach: feature-list vs benefit-driven vs FOMO?
- Trial offered? On which plan?

### 11. Stats / progress (when applicable)
- What's the time horizon presented? (today / week / month / all-time)
- Chart types: line / bar / ring / heatmap / streak grid / sparkline?
- Personal records / milestones surfaced?
- Comparison: vs last period, vs personal best, vs goal?

### 12. Customization knobs
- What are the 5–10 settings users actually change in this category?
- Which appear at the point of use vs in Settings?

### 13. Personalization runtime
- Does the app learn from usage? (suggested next, smart defaults, autocomplete from history)
- Does it surface patterns to the user? ("you usually do this on Thursday")

### 14. Social / sharing
- Share-out: image of stats, link, text?
- Collaboration: solo-by-design, opt-in social, social-by-default?

### 15. Sound & haptics moments
- Where do leaders trigger haptics? (set complete, milestone, error)
- Do they use sound? (rare on mobile productivity, common on workout apps)

### 16. Animation / transitions
- Hero transitions on push?
- Spring animations on confirm?
- Micro-interactions on CTA press?

### 17. Time-to-first-action (T1A)
- From cold launch to first real action: how many taps, how many seconds?
- Is the JTBD reachable from the home screen with 1 tap?

## Universal anti-patterns to flag

- Multiple modals stacked
- Settings buried 4 levels deep
- "Tap to continue" walls of text
- Saturated palettes that feel like a 2014 startup
- Decorative illustrations that don't communicate state
- "Pro" or "Plus" tabs (premium should be a gate, not a section)
- Bottom tab bars with only text, no icons
- Inputs that don't show what units they expect

## Reference sources to search (always)

- **Mobbin** (mobbin.com) — best-in-class flow screenshots
- **UXArchive** (uxarchive.com)
- **Page Flows** (pageflows.com) — onboarding videos
- **Built for Mars** (builtformars.com) — UX teardowns
- **Lapa.ninja** — landing page reference (when the app has a marketing site)
- **r/{vertical}apps** subreddits — what users actually praise/complain
- **App Store editorial features** — what Apple promotes signals current taste

## Output format reminder

The vertical scaffold below this file adds the specifics. Together they let you write `.planning/design-research.md` with concrete, vertical-aware patterns.
