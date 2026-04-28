# Fitness — domain heuristics

Workout / strength / cardio / training apps.

## Default IA (3 tabs)

```
- Programs (or "Plans") — list of workout templates, FAB to create new
- Workout (or "Train") — active workout flow, full-screen focus mode (HERO screen)
- History — calendar/list of past sessions, drill into details

Settings accessed via header icon on Programs tab — not a tab itself.
```

## Default cadence

`session-based`. The user opens the app to do a session, then closes it. NOT daily background usage. NOT weekly recap-driven. Streaks are weekly counts (workouts/week), not daily.

## Hero screens

1. **Workout active screen** (mandatory hero) — full-screen, exercise name in `display-sm`, current set in `caption uppercase`, big rest timer as draining horizontal bar at the top, weight/reps inputs prominent, large primary "Log set" CTA with `leftIcon=check`.
2. **Programs list** (sometimes hero) — card-stacked, tap-to-start CTA, recent activity sparkline.

## Default chart kinds

| Surface | Chart kind | Notes |
|---|---|---|
| Home — week status | `goal` (ring) | "3/4 workouts this week" |
| Home — volume trend | `sparkline` | Last 4 weeks |
| Exercise detail | `trend` (line) | All-time top set per session |
| Exercise detail | `pr` (badge) | New PR detection |
| History | `heatmap` | 90-day calendar |
| Stats premium | `comparison` (bar) | Volume by muscle group |

## Default customization knobs (at point of use)

When user creates an exercise / set:
- sets (default 3, EDITABLE inline — never locked)
- reps (default 8, range allowed e.g. 6-10)
- target_weight (default = last value, or empty)
- rest_time_seconds (default 90, per-exercise override)
- notes (optional, expand-on-tap)

When user creates a program:
- exercises (drag-to-reorder)
- default_rest (override per exercise)
- warm-up sets toggle

## Default free vs premium split

| Feature | Free | Premium |
|---|---|---|
| Create programs | ✅ | ✅ |
| Log workouts | ✅ | ✅ |
| 60-day history | ✅ | ✅ |
| > 60-day history | ❌ | ✅ (`history_long`) |
| Exercise PRs | ✅ | ✅ |
| Volume / muscle balance / advanced stats | ❌ | ✅ (`advanced_stats`) |
| Smart weight suggestions | ❌ | ✅ (`smart_suggestions`) |
| CSV export | ❌ | ✅ (`export_csv`) |
| Cloud sync, multi-device | ❌ | ✅ (`cloud_sync`) |

Don't gate basic logging behind premium — that's the value, not the upsell.

## Default empty state vibe

For Programs: clean, no fluff. Icon `dumbbell`, title "No programs yet.", body "Create your first program to start training.", CTA "New program" (variant primary, leftIcon=plus).

For History: icon `calendar-check`, title "No workouts yet.", body "Your sessions will show up here.", no CTA (the action lives elsewhere).

## North-star metric language

"Sets logged per week" beats "sessions per week" — sessions are easy to fake (open + close), sets require real interaction. Default: weekly active sets.

## Vertical anti-patterns

- ❌ Modal-based set logging — interrupts focus.
- ❌ Auto-advance to next exercise without user tap.
- ❌ Locking 3 sets as a hardcoded default. ALL set/rep counts editable inline.
- ❌ Forcing notes / RPE / tempo as required fields. Hide behind disclosure.
- ❌ Wellness aesthetic on a strength app. Lifters want clinical / instrument-panel.
- ❌ Bright saturated palette. Dark mode default + electric accent.
- ❌ Step counter as primary feature on a strength app — wrong audience.

## Onboarding fields

- name
- locale
- units_weight (kg/lb — default from locale)
- (optional) goal: "build muscle" / "lose weight" / "general fitness" / "sport performance"
- (optional) experience: beginner / intermediate / advanced
- (optional) reminder_time

## First-day surface
Home shows: "Hey {name}. Ready to train?" + a primary CTA "Start workout" → opens the program picker. If user has 0 programs, the CTA is "Create your first program" instead.
