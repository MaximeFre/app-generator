# Fitness vertical scaffold

For workout / training / movement / running / fitness-tracking apps. Layer over `_default.md`.

## Reference apps to research

Tier 1 — must check, all are best-in-class for this category:

1. **Hevy** — workout tracker, gold standard for set-by-set logging UX. Look at: active workout screen, rest timer treatment, exercise picker, history graph.
2. **Strong** — predecessor to Hevy, simpler logging flow. Look at: program-as-list pattern, plate calculator.
3. **Apple Fitness+ / Fitness app** — ring-driven home, weekly streak, summary card pattern.
4. **Whoop** — recovery + strain dashboard, "today's recommendation" home pattern, sleep coach UX.
5. **Strava** — activity feed, social layer, personal records badges, segment leaderboards.

Tier 2 — for indie inspiration:

6. **Ladder / Future** — coached workouts, video instruction inline, week-as-card.
7. **Caliber / Volt** — programmed strength, AI suggestion UX.
8. **Streaks Workout / Down Dog** — minimalist, yoga/short-workout vibe, calm color systems.

Tier 3 — anti-references (popular but cautionary):

9. **MyFitnessPal** — bloated home, ad density, what NOT to do for a focused app.
10. **Nike Training Club** — over-designed marketing, under-designed logging.

## Vertical-specific questions

### A. The active workout screen (the hero)
- Is it full-screen with no chrome, or stays in the tabbed shell?
- How is the current exercise displayed? (typo size, image, video, animation, none?)
- Set rows: list of past sets above, current set as input row?
- Where does the rest timer live? (full-bleed top bar, floating chip, modal — Hevy uses **draining horizontal bar at top, click to skip/edit**)
- How is "set complete" confirmed? (large primary button, swipe gesture, double-tap?)
- After confirm: auto-advance to next set, or stay on current with timer running?
- How is weight/reps entered? (numeric keyboard, +/- steppers, scroll picker, voice?)
- Plate calculator: shown inline or buried in menu?
- "Notes" per set: optional or hidden until tapped?

### B. Program / template UX
- Programs as flat list, or grouped by muscle / day?
- Edit-in-place or separate edit screen?
- Drag-to-reorder exercises?
- Default rest time per exercise vs per set?
- Default reps and sets: editable at template creation, at workout start, or both?
- Superset / circuit support: visual treatment?

### C. Exercise picker
- Search-first or browse-first?
- Categorization: by muscle group / equipment / movement pattern?
- Custom exercises: how easy to add?
- Recently-used / favorites?
- Image / illustration per exercise?

### D. History
- List of sessions or calendar view?
- Per-session detail: full workout reproduction, or summary stats?
- Drill into a specific exercise across all sessions (longitudinal)?
- PR badges visible from list?

### E. Stats / progress
- **Volume** (sets × reps × weight): line chart over weeks
- **PR per exercise**: badge on detail, log on history list
- **Frequency**: calendar heatmap (last 30/90 days)
- **Body part split**: pie or stacked bar
- **Muscle balance**: radar (less common but loved when present)
- **Streak**: weeks consecutive — when do leaders show this?

### F. Smart suggestions (when premium)
- Suggested weight: based on last session, or last 3 averaged, or RPE-adjusted?
- Suggested rest: based on last session's rest the user actually took?
- Deload week detection: when?
- Plateau detection: surface how?

### G. Onboarding for fitness apps
- Goal selection (build muscle / lose weight / general fitness / sport-specific)?
- Experience level (beginner / intermediate / advanced)?
- Frequency target (3×/week, 4, 5)?
- Existing programs (5/3/1, PPL, Bro split)? Pre-import?
- Body metrics (height, weight, bodyweight) — when to ask, optional or required?

### H. The "Hey {name}" home screen
- What does Hevy / Strong show first? Usually: **"Next workout: {name}, last done {N days} ago"** + start button
- Apple Fitness shows: **rings + today's date + "Move" "Exercise" "Stand"**
- Whoop shows: **today's recovery score + recommended strain target**
- Pattern: home is a **decision aid**, not a feature catalog. Surface ONE next action.

## Customization knobs (must have at point of use)

When the user creates a program / exercise / set, these MUST be editable inline (not buried in settings):

1. Number of sets per exercise (default 3 but EDITABLE, not locked)
2. Target reps per set (range or fixed)
3. Target weight per set (or "from last time")
4. Rest time between sets (default 90s but per-exercise override)
5. Rest time between exercises (default 120s)
6. Warm-up sets toggle
7. Tempo / RPE notes (optional, advanced users only — hide behind disclosure)

## Stats taxonomy for fitness

| Surface | Chart | Time horizon | Example |
|---|---|---|---|
| Home | Streak dot | This week | "4/4 workouts done this week" |
| Home | Sparkline | Last 4 weeks | Volume trend |
| Exercise detail | Line chart | All-time | Top set weight per session |
| Exercise detail | PR badge | Single point | "PR: 100kg × 5 on 2026-04-15" |
| History | Calendar heatmap | Last 90 days | Density of workouts |
| Stats tab | Stacked bar | Last 4 weeks | Volume by muscle group |
| Stats tab | Pie / radar | Last 30 days | Muscle balance |

## Vertical anti-patterns

- ❌ Modal-based set logging — interrupts focus, breaks flow.
- ❌ Auto-advance to next exercise without user confirmation — user might want to add a set.
- ❌ Locking the rest timer to a global default (every exercise has different rest needs).
- ❌ Forcing notes / RPE / tempo as required fields — most users skip them, gate them behind disclosure.
- ❌ Step-tracking on a strength app (different vertical, different audience).
- ❌ Hiding history behind a paywall (history IS the value, paywall future stats / sync / multi-device).
- ❌ Round, soft, "wellness" aesthetic on a strength app — barbell users want clinical / precision.
- ❌ Asking for height + weight + body fat + activity level + 5 goals BEFORE first workout.

## Visual language signals

- Strength apps lean **dark mode default**, **monospaced or condensed numerics for weight/reps**, **sharp geometry**, **electric accent color** (lime, orange, red, neon green).
- Yoga / pilates / mindful movement apps lean **light, sage/sand palettes**, **rounded geometry**, **photography-led**.
- Running / cardio apps lean **map-driven home**, **vivid orange/red for pace alerts**, **stat-dense after-action summary**.

## High-signal URLs to fetch (start here)

- https://mobbin.com (filter "fitness")
- https://www.hevyapp.com/blog (their own UX writeups)
- https://www.builtformars.com (search "fitness")
- https://www.reddit.com/r/Fitness/ (search "best app")
- https://apps.apple.com/us/app/hevy-workout-tracker/id1512473074 (App Store screenshots)
