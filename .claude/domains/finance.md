# Finance — domain heuristics

Budget / expense tracking / investing apps.

## Default IA (3-4 tabs)
```
- Home / Dashboard — net worth + this month spend + recent transactions
- Transactions — list, filterable by category/account/date
- Budgets — per-category caps + progress bars
- (Insights — premium tab if rich stats)
```

## Default cadence
`weekly`-leaning with daily light touches. User checks daily for transactions, plans weekly.

## Hero screens
1. **Home dashboard** (mandatory) — net worth at top in `display`, this month delta, category donut, recent transactions list.
2. **Transaction entry** (sometimes) — quick amount-first entry, category picker.

## Default chart kinds
| Surface | Chart | Notes |
|---|---|---|
| Home — net worth | `trend` (line) | All-time area chart |
| Home — this month | `goal` (ring) | Spent vs budgeted |
| Insights — spending by category | `comparison` (bar / donut) | Monthly |
| Insights — net flow | `trend` (line) | Monthly inflow vs outflow |

## Customization knobs
- Currency + symbol position (€ before / after)
- Week / month / payday start
- Default category for unmatched transactions
- Budget rollover toggle
- Account aggregation (manual vs Plaid — Plaid is post-v1)

## Free vs premium
| Feature | Free | Premium |
|---|---|---|
| Manual transaction entry | ✅ | ✅ |
| Categories + budgets | ✅ | ✅ |
| 90-day history | ✅ | ✅ |
| Beyond 90 days | ❌ | ✅ |
| Multiple accounts | ❌ (1) | ✅ (unlimited) |
| Bank account aggregation (Plaid) | ❌ | ✅ |
| Forecasts / advanced insights | ❌ | ✅ |
| CSV / PDF export | ❌ | ✅ |
| Multi-device sync | ❌ | ✅ |

## Empty state vibe
Restrained. Icon `wallet`, title "No transactions.", body "Add your first to get started.", CTA "Add transaction" leftIcon=plus.

## North-star metric
"Transactions logged per week". Engagement = active financial awareness.

## Anti-patterns
- ❌ Forcing bank connection upfront — let manual mode work.
- ❌ Pop-up upsell on every screen.
- ❌ Cluttered dashboard with 8 widgets — pick the 3 that matter.
- ❌ Cute illustrations on a serious-money app.
- ❌ Negative numbers without red color (cultural convention).
- ❌ Non-tabular numerics — finance MUST use `tabular-nums`.

## Onboarding fields
- name
- locale
- currency (default from locale)
- units_distance not relevant (skip)
- (optional) primary financial goal: "save more" / "track spending" / "pay off debt" / "invest"
- reminder_time (optional — for weekly review)

## First-day surface
Home: "Hey {name}." + net worth at top (placeholder if no accounts) + "Add your first transaction" CTA. If user added an account during onboarding, show its balance.
