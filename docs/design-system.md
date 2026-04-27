# Design system

How theming works in this template. Read before changing colors, adding tokens, or styling components.

## The chain

```
global.css                        ← single source of truth (CSS vars, light + dark)
   │
   ▼
tailwind.config.js                ← maps each --color-X to a Tailwind class name
   │
   ▼
className="bg-primary text-foreground"   ← what you write in components
```

You almost always edit only **`global.css`**. The Tailwind config is a thin adapter.

## Token names

The template ships 10 semantic tokens (NOT color names — semantic roles):

| Token | Role | Light example | Dark example |
|---|---|---|---|
| `background` | screen background | `255 255 255` | `2 6 23` |
| `foreground` | primary text on background | `15 23 42` | `248 250 252` |
| `muted` | card / section bg | `241 245 249` | `30 41 59` |
| `muted-foreground` | secondary text | `100 116 139` | `148 163 184` |
| `primary` | CTA, active states | `15 23 42` | `248 250 252` |
| `primary-foreground` | text on primary | `248 250 252` | `15 23 42` |
| `secondary` | secondary buttons, chips | `226 232 240` | `30 41 59` |
| `secondary-foreground` | text on secondary | `15 23 42` | `248 250 252` |
| `border` | dividers, input borders | `226 232 240` | `30 41 59` |
| `destructive` | errors, delete | `220 38 38` | `248 113 113` |

Stored as **rgb triplets** (no `rgb()` wrapper, no commas) so they compose with `<alpha-value>` for opacity.

## Editing the palette

Open `global.css`. Edit BOTH `:root` (light) and `.dark` (dark) blocks.

```css
:root {
  --color-primary: 79 70 229;            /* indigo-600 */
  --color-primary-foreground: 255 255 255;
  /* ... */
}

.dark {
  --color-primary: 129 140 248;          /* indigo-400 (lighter for dark bg) */
  --color-primary-foreground: 15 23 42;
  /* ... */
}
```

Rules:
- Both light AND dark must be defined for every token.
- Foreground/background contrast ≥ 7:1 (WCAG AA on text).
- `primary` must differ from `secondary` in **hue family**, not just luminance. Do the squint test: are they distinguishable at 30%? If no, refactor.
- Never put a hex color elsewhere in the codebase. Hex lives only in `global.css`.

## Using tokens in components

```tsx
<View className="bg-background">
  <Text className="text-foreground text-base">Title</Text>
  <Text className="text-muted-foreground text-sm">Subtitle</Text>

  <Pressable className="bg-primary rounded-xl h-12 px-5 items-center justify-center">
    <Text className="text-primary-foreground font-semibold">Action</Text>
  </Pressable>

  <View className="border border-border rounded-xl p-4 bg-muted/40">
    Card content
  </View>
</View>
```

Opacity modifier works on any token: `bg-primary/10`, `border-border/50`, `text-foreground/60`.

## Adding a new token

When the brand needs a fifth role (e.g., `warning`, `success`, `accent`):

1. In `global.css`, add to BOTH blocks:
   ```css
   :root {
     --color-warning: 245 158 11;
     --color-warning-foreground: 23 13 0;
   }
   .dark {
     --color-warning: 251 191 36;
     --color-warning-foreground: 23 13 0;
   }
   ```
2. In `tailwind.config.js`, map under `theme.extend.colors`:
   ```js
   warning: "rgb(var(--color-warning) / <alpha-value>)",
   "warning-foreground": "rgb(var(--color-warning-foreground) / <alpha-value>)",
   ```
3. Use: `<View className="bg-warning"><Text className="text-warning-foreground">...</Text></View>`.

Always add the matching `*-foreground` partner. If you put text on the new color, you need a text color that contrasts.

## Dark mode

Automatic. `app.json` sets `userInterfaceStyle: "automatic"` — RN follows the system.

NativeWind picks the correct `:root` vs `.dark` block based on `Appearance.getColorScheme()`. No JS toggle needed.

To force a section into dark mode (rare): wrap in `<View className="dark">{...}</View>`.

To test:
- iOS Simulator: `Settings → Display → Light/Dark`.
- Android Emulator: notification shade → dark mode toggle.
- Real device: same as user.

Test EVERY screen in both modes before shipping. Common dark-mode regressions:
- Cards lose definition → use `bg-muted/40` + `border-border` instead of `bg-muted` alone.
- Shadows invisible → replace with borders.
- Charts: re-tint primary slightly desaturated.

## Typography

System fonts by default (San Francisco on iOS, Roboto on Android). To add a custom font:

1. Drop the font file in `assets/fonts/`.
2. Load via `expo-font`:
   ```tsx
   // app/_layout.tsx
   import { useFonts } from "expo-font";
   const [loaded] = useFonts({ "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf") });
   if (!loaded) return null;
   ```
3. Add to `tailwind.config.js`:
   ```js
   fontFamily: { sans: ["Inter-Regular", "system-ui"] }
   ```

Don't add a custom font unless the brand needs it — system fonts are zero-cost, fast, and look native.

### Sizes (Tailwind)

| Use | Class |
|---|---|
| Page title (h1) | `text-2xl font-bold` |
| Section header (h2) | `text-lg font-semibold` |
| Card title (h3) | `text-base font-semibold` |
| Body | `text-base` |
| Helper / caption | `text-sm text-muted-foreground` |
| Tiny / chip | `text-xs uppercase tracking-wider` |

Avoid `font-light` on mobile (legibility).

## Spacing

Multiples of 4. Vertical rhythm with `gap-2`, `gap-3`, `gap-4`. Avoid `gap-5` / `mb-5` (off-grid).

| Context | Class |
|---|---|
| Screen horizontal padding | `px-5` (20px) |
| Modal/sheet horizontal padding | `px-6` (24px) |
| Card padding | `p-4` |
| Vertical between sections | `mb-6` or `gap-6` |
| Small inline gap | `gap-2` |

## Radius

Three sizes only:

| Use | Class |
|---|---|
| Card / input / button | `rounded-xl` (12px) |
| Modal / sheet / hero | `rounded-2xl` (16px) |
| Badge / chip / pill | `rounded-md` (6px) |

Don't mix more than 2 radii in the same screen.

## Touch targets

Every tappable element minimum **48×48** (`h-12 w-12`). The `<Button>` primitive defaults to `h-12` for size `md`.

## Common patterns

### Card

```tsx
<View className="rounded-xl border border-border bg-muted/40 p-4">
  <Text className="text-base font-semibold text-foreground">Title</Text>
  <Text className="mt-1 text-sm text-muted-foreground">Subtitle</Text>
</View>
```

### Section group

```tsx
<View className="mb-6 rounded-2xl border border-border bg-muted/40 p-4">
  <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    Section title
  </Text>
  {children}
</View>
```

(Already used in `app/(tabs)/settings.tsx`.)

### Empty state

```tsx
<View className="flex-1 items-center justify-center px-8">
  <Text className="text-6xl mb-4">{emoji}</Text>
  <Text className="text-lg font-semibold text-foreground text-center mb-2">{title}</Text>
  <Text className="text-sm text-muted-foreground text-center">{hint}</Text>
</View>
```

## Conditional classes

Use `cn()` from `lib/utils.ts`:

```tsx
className={cn(
  "rounded-xl px-4 py-2",
  isActive && "bg-primary text-primary-foreground",
  error && "border-destructive",
)}
```

Don't import `clsx` or `classnames` — adding a dep for the same thing.

## Anti-patterns

- ❌ Hardcoded hex/rgb in className: `className="bg-[#ff0000]"`.
- ❌ Literal Tailwind colors: `bg-gray-200`, `text-slate-500`, `text-black`, `bg-white`.
- ❌ Inline `style={{ color: "..." }}` for colors. Use semantic tokens.
- ❌ Editing `tailwind.config.js` to add hex without a CSS variable in `global.css`.
- ❌ Using `--color-secondary` for the main CTA. Primary is the recognizable one.
- ❌ More than 3 radii in the same screen.
- ❌ Mixing `StyleSheet.create` and `className` in the same file.
- ❌ Dynamic class strings: `className={`bg-${color}`}`. Tailwind can't extract them.

## Debugging "className not applied"

Checklist:
1. `metro.config.js` exports `withNativeWind(config, { input: "./global.css" })`.
2. `babel.config.js` has BOTH `["babel-preset-expo", { jsxImportSource: "nativewind" }]` AND `"nativewind/babel"`.
3. `global.css` is imported in `app/_layout.tsx` (must be the FIRST import).
4. `tailwind.config.js` `content` array covers your file.
5. Cleared cache: `npx expo start -c`.

## Deeper

- `.claude/rules/design-system.md` — the rules this doc derives from.
- `.claude/skills/nativewind-design/SKILL.md` — RN-specific gotchas (no `space-x-*`, no `hover:`, etc.).
