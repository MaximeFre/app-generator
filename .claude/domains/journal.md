# Journal — domain heuristics

Mood / gratitude / habit / diary apps.

## Default IA (3 tabs)
```
- Today — quick entry + mood input + reflection prompts
- Calendar — month grid colored by mood, tap day for entry
- Insights (premium-leaning) — patterns, correlations, word cloud
```

## Default cadence
`daily`. Streak-driven. Home shows current streak prominently.

## Hero screens
1. **Quick entry** (mandatory) — full-screen, mood input dominant, optional 1-line text, no friction.
2. **Calendar** (sometimes) — month grid with mood colors.

## Default chart kinds
| Surface | Chart | Notes |
|---|---|---|
| Insights — mood trend | `trend` (line) | 30/90 days |
| Calendar | `heatmap` | Monthly grid colored by mood |
| Insights — tag frequency | `comparison` (bar) | Top contexts |
| Home — streak | sparkline + count | "12-day streak" |

## Customization knobs
- Mood scale (5-point / 7-point / wheel)
- Reminder time (morning / evening / both)
- Custom tags / categories
- Privacy lock (FaceID toggle)
- Weekly summary on/off

## Free vs premium
| Feature | Free | Premium |
|---|---|---|
| Daily entry, mood, text | ✅ | ✅ |
| 60-day history | ✅ | ✅ |
| > 60 days | ❌ | ✅ |
| Patterns / correlations / word cloud | ❌ | ✅ |
| Photos in entries | ❌ (basic 1/entry) | ✅ (multiple) |
| Cloud backup, multi-device | ❌ | ✅ |
| Export (PDF, JSON) | ❌ | ✅ |

## Empty state vibe
Soft, encouraging. Icon `notebook-pen`, title "Start where you are.", body "Drop a line about today.", CTA "Quick entry".

## North-star metric
"Entries per week" — daily ideal but weekly count handles real life.

## Anti-patterns
- ❌ Forcing long entries — most users want 30 seconds.
- ❌ Notification spam ("you haven't journaled in 2 days" multiple times).
- ❌ Public/social as primary — privacy is the contract.
- ❌ Childish gamification on a serious-mood app.
- ❌ Bright saturated palette — calm wins.

## Onboarding fields
- name
- locale
- intent (gratitude / mood / habits / general) — informs prompt style
- reminder_time (morning / evening — required, non-skippable since daily cadence)
- mood_scale preference

## First-day surface
Home: "Hey {name}. How are you today?" + mood chips at the top + a `<Card>` with "Today's prompt" (vertical-specific) + a "Write" CTA.
