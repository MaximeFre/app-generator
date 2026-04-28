# Productivity — domain heuristics

Tasks / notes / time-tracking / GTD / focus apps.

## Default IA (3 tabs)
```
- Today — virtual filter for due-today + overdue
- Inbox — capture + uncategorized
- Projects (or All / Browse) — by project / area / tag
```

## Default cadence
`daily`. Users check multiple times per day. T1A budget is critical: ≤ 2 taps from cold open to capture.

## Hero screens
1. **Today** (mandatory hero) — due today + overdue, drag-to-reorder, swipe-to-complete, FAB capture.
2. **Capture** (sometimes hero) — full-screen quick add with natural-language parsing.

## Default chart kinds
Productivity apps often DON'T need charts. Most users want lists, not analytics. If you add charts:
| Surface | Chart | Notes |
|---|---|---|
| Insights — completion rate | `goal` (ring) | This week |
| Insights — focus time | `comparison` (bar) | Per project, this week |
| Stats — streak | sparkline | Daily completion |

Often `Stat` cards are enough — skip charts entirely on v1.

## Customization knobs
- Default reminder time
- Week start day (Mon/Sun)
- Smart list per project (Today / This week / Next 7 days toggle)
- Default project for inbox
- Notification per project

## Free vs premium
| Feature | Free | Premium |
|---|---|---|
| Tasks, projects, inbox | ✅ | ✅ |
| Reminders | ✅ | ✅ |
| Recurring tasks | ✅ | ✅ |
| Up to 5 projects | ✅ | ✅ |
| Unlimited projects | ❌ | ✅ |
| Tags + filters | ❌ (basic) | ✅ (advanced) |
| Time tracking integration | ❌ | ✅ |
| Focus timer + session log | ❌ | ✅ |
| Multi-device sync | ❌ | ✅ |
| Templates | ❌ | ✅ |

## Empty state vibe
Empty. Like Things 3 — generous whitespace, soft text. Icon `inbox`, title "All clear.", body "What's next?", CTA "Add task" leftIcon=plus.

## North-star metric
"Tasks completed per week". Captures real engagement vs vanity captures.

## Anti-patterns
- ❌ Heavy gamification — productivity must feel professional.
- ❌ Settings buried — quick edit of reminder must be 1 tap.
- ❌ Asking for projects/areas/tags upfront in onboarding.
- ❌ Decorative illustrations on action screens.
- ❌ Too many filters / nesting — 1 level of project is plenty.
- ❌ "Pro" or "Plus" tabs — premium is a gate, not a section.

## Onboarding fields
- name
- locale
- (optional) week start
- (optional) default reminder time
- Skip everything by default — productivity users want to capture, not configure.

## First-day surface
Today screen: greeting + "Add your first task" CTA + `<EmptyState icon="inbox" title="All clear." body="What's next?" cta>`.
