---
description: Vertical scaffolds for the design-researcher agent. Not invoked directly by the user — consumed by the design-researcher sub-agent during /generate-app. One scaffold per app vertical (fitness, finance, journal, social, productivity, dating, creative, health, utility) plus a _default fallback.
---

# /design-research — vertical scaffolds (data, not a runnable skill)

This directory contains research scaffolds the `design-researcher` agent uses to know **what to look for** in each app vertical. The agent picks the best-matching vertical for the brief, reads the corresponding scaffold, then runs WebSearch to fill in the details.

## Files

```
categories/
├── _default.md       # Universal grid — read first, always
├── fitness.md        # Workout / training / movement
├── finance.md        # Budget / expense / investing
├── journal.md        # Mood / gratitude / habits / diary
├── social.md         # Chat / feed / messaging (rare for indie)
├── productivity.md   # Tasks / notes / time tracking
├── dating.md         # Match / message / profile
├── creative.md       # Drawing / music / writing tools
├── health.md         # Sleep / meditation / hydration / cycle
├── utility.md        # Single-purpose: convert / calc / weather / scan
```

## How the design-researcher uses these

1. Reads `_default.md` (universal questions every app must answer).
2. Reads the matching `{vertical}.md` (vertical-specific reference apps + extra questions).
3. Runs WebSearch + WebFetch on the reference apps + pattern queries.
4. Synthesizes into `.planning/design-research.md`.

## Editing rules

- Each vertical file is ~300 lines max. Dense. No fluff.
- Reference app list = 6–10 apps, freshness ≥ 2024.
- Patterns are written as **observations**, not advice. ("Hevy treats the rest timer as a horizontal draining bar at the top of the screen" not "use a good rest timer").
- Add a new vertical only when a brief truly needs one — don't over-templatize.
