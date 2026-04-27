---
description: NativeWind tokens, no hardcoded colors, theming via CSS vars.
paths: ["app/**/*.tsx", "components/**/*.tsx", "global.css", "tailwind.config.js"]
---

# Design system

## Forbidden

- ❌ Hardcoded color hex/rgb in className.
- ❌ `text-black`, `text-white`, `bg-gray-*`, `text-slate-*` and similar literal Tailwind colors.
- ❌ Inline `style={{ color: "..." }}` for colors. Use NativeWind classes.
- ❌ Editing `tailwind.config.js` to add a new color directly. Add a CSS variable in `global.css` first, then map it.

## Required

- ✅ Semantic tokens only: `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-destructive`.
- ✅ Add new tokens in `global.css` as `--color-{name}` and map in `tailwind.config.js` with `rgb(var(--color-{name}) / <alpha-value>)`.
- ✅ Both light AND dark variants when adding a token.

## Spacing

- Vertical rhythm in multiples of 4: `gap-2`, `gap-3`, `gap-4`, `mb-4`, `mb-6`. Avoid `mb-5`/`gap-5` unless there's a reason.
- Screen padding: `px-5` (20px). Modal sheets: `px-6`.
- Touch targets: minimum `h-12` (48px) for any tappable element.

## Typography

- Headings: `text-2xl font-bold` (h1), `text-lg font-semibold` (h2), `text-base font-semibold` (h3).
- Body: `text-base text-foreground`. Helper: `text-sm text-muted-foreground`.
- Never `font-light` on mobile (legibility).

## Radius

- `rounded-xl` for cards/inputs, `rounded-2xl` for modals/sheets, `rounded-md` for badges/chips.

## Anti-patterns to flag in review

- More than 2 different border radii in the same screen → pick one.
- More than 3 colors with similar saturation → squint test fails.
- `opacity-50` to indicate "disabled" but still receiving touches.
