---
description: Expert mobile UX patterns for indie apps — bottom tabs, gestures, haptics, safe areas, modals, empty states, onboarding, paywall placement. iOS HIG + Material 3 hybrid. Use when designing screens, debating navigation, picking between modal/sheet/screen, or adding interactions. Triggers `/mobile-ux-patterns`, "mobile UX", "haptics", "bottom sheet", "navigation", "empty state".
---

# Mobile UX patterns — expert

## Navigation hierarchy

```
1 product = up to 4 tabs
   ↓
1 tab = a Stack
   ↓
1 stack = pushes to detail / sub-views
   ↓
modals = orthogonal to nav (presentation: "modal")
   ↓
sheets = bottom-sheet, semi-modal, can be dismissed by drag
```

Don't violate. Drawer navigation is a 2014 pattern, dead on phones.

## Tabs — choosing labels

Each tab label should be:
- ≤ 6 chars (8 max). Long labels wrap and look broken.
- A noun, not a verb. ("Library", not "Browse".)
- Persona-aligned: a meditation app's tab is "Practice", not "Sessions".

Default tab order (from left): most-used → settings/profile last.

## Haptics

Use `expo-haptics` for tactile confirmation. NOT for every tap.

| Event | Haptic |
|---|---|
| Button press | `selectionAsync()` (already in `<Button>` primitive) |
| Toggle on/off | `impactAsync(ImpactFeedbackStyle.Light)` |
| Swipe-to-delete reveal | `impactAsync(Light)` once |
| Long-press menu open | `impactAsync(Medium)` |
| Successful save | `notificationAsync(Success)` |
| Error / destructive confirmation | `notificationAsync(Warning)` |
| Tab switch | none (overuse) |
| Scroll | NEVER |

iOS only by default; Android haptics work but are weaker. Don't rely on them for accessibility.

## Bottom sheets vs modals vs screens

| Use case | Pick |
|---|---|
| Quick decision (1–3 options) | **Action sheet** (`@gorhom/bottom-sheet` or `Alert.alert`) |
| Multi-step input (form) | **Modal screen** (`presentation: "modal"`) |
| Detail view of a tappable item | **Push** in current stack |
| Confirmation of destructive action | **Alert** with cancel + destructive |
| Filters / settings refinement | **Bottom sheet** with content + Apply CTA |
| Paywall | **Modal screen** (already in `app/paywall.tsx`) |
| Help / info | **Push** to `/help/[topic]` |

Anti-pattern: full-screen modal for a single Yes/No question. That's an alert.

## Safe areas

Always use `react-native-safe-area-context` (already wrapped in `<Screen>` primitive). Never hard-code padding for the notch/home indicator.

For floating CTAs above the home indicator on iOS:

```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();
<View style={{ paddingBottom: insets.bottom + 16 }}>
  <Button label="Save" />
</View>
```

## Empty states

Every list-style screen needs one. The empty state is a teaching moment.

Template:
```tsx
<View className="flex-1 items-center justify-center px-8">
  <Text className="text-6xl mb-4">{emoji}</Text>
  <Text className="text-lg font-semibold text-foreground text-center mb-2">
    {t("home.emptyTitle")}
  </Text>
  <Text className="text-sm text-muted-foreground text-center">
    {t("home.emptyHint")}
  </Text>
</View>
```

- One emoji or icon (60×60).
- One sentence telling the user what's expected.
- Optionally one CTA. NOT mandatory — the user just landed here.

## Onboarding — when to skip

Skip onboarding if:
- Core feature is discoverable in < 5 seconds.
- Persona is technical (devs, designers).
- Premium gate is the only "configuration" needed.

DO onboarding if:
- The app needs permissions (notifications, location, health).
- The first screen is empty without a setup step.
- Persona is non-technical AND the value isn't immediate.

Max 3 screens. Each = one decision. Allow skip on every screen.

## Pull to refresh

Free with `<FlatList refreshControl={...} />`. Use it for:
- Lists that fetch from network (premium sync).
- Logs / feeds where freshness matters.

Don't add to:
- Lists backed only by local DB (data is already live via `useLiveQuery`).
- Settings.

## Loading states

Three flavors:

1. **Initial load** (first render of a screen): a centered `<ActivityIndicator />` is fine.
2. **Refresh of existing data**: NO spinner overlay. Update content silently.
3. **Action in progress** (e.g., button → API call): button shows `<ActivityIndicator />` inside, OR use the `loading` prop of `<Button>`.

NEVER use full-screen blocking spinners for non-critical operations. Optimistic UI > spinners.

## Forms

- One field per row on mobile. Multi-column = bad on 375px screens.
- `autoCapitalize="none"` on email, password, username fields.
- `autoComplete="email"`, `autoComplete="password"`, `autoComplete="name"` for native fill.
- `keyboardType="email-address"` on email inputs (shows @ on keyboard).
- `secureTextEntry` for password.
- Submit button INSIDE the keyboard's accessory region OR below the form. Don't make user dismiss the keyboard.

## Errors and confirmations

- Inline error below the field (not a banner at the top).
- Toast for transient confirmation ("Saved!"), not for errors.
- Modal alert for destructive confirmation ("Delete forever?").

For toasts, use `react-native-toast-message` only if you actually need them (don't add the dep for one feature).

## Animation budget

For indie apps, animations are accents, not features.

- Tab switch: built-in, leave alone.
- Modal open/close: built-in, leave alone.
- Toggle/checkbox: 150ms `Animated` or no animation.
- List item insert/delete: 200ms slide-out via Reanimated `Layout` API.
- Hero animations: ONE per screen max.

Avoid Lottie for v1 — heavy bundle, often gratuitous.

## Accessibility (a baseline)

- Touch targets ≥ 48×48 (Tailwind `h-12 w-12`).
- Label every icon-only button: `accessibilityLabel="Add item"`.
- Set `accessibilityRole="button"` on `<Pressable>` that act as buttons.
- Don't use color alone to convey state — pair with icon or text.
- Test with VoiceOver (iOS) at least once before shipping.

## Dark mode polish

After enabling dark mode:
- Test EVERY screen in both modes.
- Cards lose their definition in dark — use `bg-muted/40` + `border-border` instead of `bg-muted`.
- Shadows nearly invisible in dark — replace with `border` or `bg-muted`.
- Charts / graphs: re-tint primary color for the dark background (slightly desaturated).

## Keyboard handling

`<Screen>` already wraps in `KeyboardAvoidingView`. For complex forms, use `react-native-keyboard-controller` instead — better behavior on iOS especially with TextInputs near the bottom.

## Anti-patterns to flag in review

- ❌ Multiple modals stacked deep (modals over modals → user gets lost).
- ❌ "Are you sure?" confirmations on every delete (user fatigue). Confirm only for irreversible.
- ❌ Tabs that change based on auth state (e.g., extra tab when premium). Use a section inside Settings instead.
- ❌ Hidden gestures with no affordance (swipe left to do X, but nothing tells the user).
- ❌ Animation on a list re-render every time data changes (perf hell).
- ❌ Showing toast notifications for permanent state ("You're now premium!" — that should be reflected in UI, not a toast).
