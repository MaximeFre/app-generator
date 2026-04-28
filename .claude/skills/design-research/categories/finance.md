# Finance vertical scaffold

For budget / expense tracking / investing / savings apps.

## Reference apps

1. **Copilot** — best-in-class indie finance app, beautiful charts, category mapping.
2. **Monarch** — couples-friendly, budget-heavy, account-aggregation pattern.
3. **YNAB** — zero-based budget UX, rule-of-the-house pattern (every dollar a job).
4. **Cleo** — chatbot UX, conversational finance.
5. **Revolut / N26** — neobank home pattern, card-front-and-center.
6. **Empower / Personal Capital** — net-worth dashboard, investment-focused.
7. **Spendee / Wallet** — manual entry indie tier.

## Vertical questions

### Home screen
- Account aggregator total at top vs single-account focus?
- Balance + delta-this-month?
- Recent transactions list visible or 1 tap away?
- Spend-this-month bar against budget?

### Transaction entry
- Auto-import (Plaid / TrueLayer) vs manual?
- Manual quick-entry: amount-first numeric pad, then category?
- Recurring transaction detection: auto or manual confirm?
- Splitting transactions across categories: how?

### Categories / budgets
- Pre-defined vs custom?
- Visual: icons + color per category?
- Budget per category: monthly cap + progress bar?
- Rollover unused budget?

### Charts
- Category donut for current month
- Spending line chart over months
- Net worth area chart over time
- Cash flow waterfall

### Privacy / security
- FaceID / passcode lock — table stakes
- No screenshot allowed (iOS API)
- Hide amounts toggle (peek mode)

## Customization knobs

1. Currency + symbol position (€ before/after)
2. Week start (Monday/Sunday)
3. Budget reset day (1st / 25th / payday)
4. Default category for unmatched transactions
5. Notif: budget alerts, large transaction, weekly summary

## Anti-patterns

- ❌ Forcing bank connection before user can try the app — let them add manual transactions first.
- ❌ Pop-up upsell on every screen.
- ❌ Cluttered home with 8 widgets.
- ❌ Cute illustrations on a serious-money app (Cleo gets away with it because the brand is upfront playful — most others can't).

## Visual signals

- Restrained palettes — deep green, navy, charcoal accents.
- Numeric typography is critical: tabular-numbers, often monospaced for amounts.
- Negative numbers in red (cultural convention) — do not invert.
- Charts use desaturated category colors so they don't fight the palette.
