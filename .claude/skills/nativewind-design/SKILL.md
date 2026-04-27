---
description: Expert NativeWind v4 + Tailwind for React Native. Token system via CSS vars, dark mode, perf, RN-only edge cases (no `space-x-*`, gradient lib, animation classes via reanimated). Use when styling screens, defining a theme, debugging className not applied, or migrating from StyleSheet. Triggers `/nativewind-design`, "nativewind", "tailwind RN", "theme tokens", "dark mode RN".
---

# NativeWind design — expert

## Why NativeWind v4

It's CSS-in-RN with the Tailwind class API, but it compiles classes to **native styles** (not web CSS). v4 added:
- CSS variables (the `--color-*` tokens this template uses).
- Compile-time class extraction (faster startup).
- Real `dark:` variants tied to `userInterfaceStyle`.

## Token architecture

```
global.css (:root + .dark)         ← single source of truth for color hex
   │
   ▼
tailwind.config.js                  ← maps `--color-*` to Tailwind names
   │
   ▼
className="bg-primary text-foreground"  ← what you write in components
```

**Edit only `global.css`** to change colors. The Tailwind config reads CSS vars and shouldn't be hand-edited unless adding a new token name.

### Adding a new token

1. In `global.css`, add to BOTH `:root` and `.dark`:
   ```css
   --color-warning: 245 158 11;          /* amber, light */
   .dark { --color-warning: 251 191 36; } /* amber, dark */
   ```
2. In `tailwind.config.js`, map it:
   ```js
   warning: "rgb(var(--color-warning) / <alpha-value>)",
   ```
3. Use: `<View className="bg-warning text-warning-foreground" />`. (You also need `--color-warning-foreground` if you put text on it.)

## RN gotchas vs web Tailwind

| Web class | RN equivalent |
|---|---|
| `space-x-2` | ❌ doesn't work. Use `gap-2` on a flex parent. |
| `divide-x` | ❌ no equivalent. Manual border on children. |
| `transition-*` | ❌ ignored. Use `react-native-reanimated`. |
| `hover:*` | ❌ no hover on touch. Use `active:*` instead. |
| `cursor-*` | ❌ ignored on native (works on web). |
| `bg-gradient-*` | ❌ requires `expo-linear-gradient` component (not class). |
| `shadow-*` | ⚠️ uses iOS shadow + Android elevation. Test both platforms. |
| `aspect-square` | ✅ works. |
| `flex-row`, `flex-col`, `gap-*`, `items-*`, `justify-*` | ✅ all good. |

## Dark mode

- `userInterfaceStyle: "automatic"` in `app.json` makes RN follow system theme.
- NativeWind picks up the `.dark` class scope based on `Appearance.getColorScheme()` automatically — no JS toggle needed.
- For per-screen overrides (rare), wrap in `<View className="dark">` (manually forces dark scope).
- Test BOTH modes: `Settings → Display → Light/Dark` on the simulator.

## Common patterns

### Card

```tsx
<View className="rounded-xl border border-border bg-muted/40 p-4">
  <Text className="text-base font-semibold text-foreground">Title</Text>
  <Text className="mt-1 text-sm text-muted-foreground">Subtitle</Text>
</View>
```

### Button states

```tsx
<Pressable className="rounded-xl bg-primary px-5 h-12 items-center justify-center active:opacity-80">
  <Text className="text-base font-semibold text-primary-foreground">Save</Text>
</Pressable>
```

Disabled: `disabled` prop + `opacity-50` class via conditional `cn()`.

### Conditional classes

Use the project's `cn()` from `lib/utils.ts`:

```tsx
className={cn("text-base", isActive && "text-primary", error && "text-destructive")}
```

Don't import `clsx` / `classnames` — extra dep for the same thing.

### Responsive

Tailwind's `sm:`, `md:` breakpoints work on web target only. On native, use `Dimensions` or a hook. Most mobile screens are 375–428 px wide — design for that range and the rest follows.

## Performance

- **Don't generate className strings dynamically per render**. Precompute or memoize.
- **Avoid 30+ classes on one element**. Refactor into a primitive component.
- **`<Text>` MUST be a `<Text>`** — strings outside a `<Text>` crash on iOS. Use `<Text className="...">` for any visible string.

## Anti-patterns

- ❌ `className={`bg-${color}`}` — Tailwind can't extract dynamic strings. Use a switch statement returning a static class.
- ❌ Inline `style={{ color: "..." }}` for colors. Use `text-{token}`.
- ❌ Mixing `StyleSheet.create` and `className` in the same file.
- ❌ Hex colors anywhere outside `global.css`.
- ❌ `bg-gray-200` / `text-slate-500` / any literal Tailwind color. Use semantic tokens.

## Debugging "className not applied"

Checklist:
1. `metro.config.js` exports `withNativeWind(config, { input: "./global.css" })`.
2. `babel.config.js` has both `["babel-preset-expo", { jsxImportSource: "nativewind" }]` AND `"nativewind/babel"`.
3. `global.css` is imported in `app/_layout.tsx` (must be the FIRST import).
4. `tailwind.config.js` `content` array includes the file path of the component you're editing.
5. Cleared Metro cache: `npx expo start -c`.

## When to escape NativeWind

For one-off animations or transforms that need shared values:

```tsx
import Animated from "react-native-reanimated";
<Animated.View style={animatedStyle} className="rounded-xl bg-primary" />
```

`Animated.View` accepts `className` in v4. Mix as needed.
