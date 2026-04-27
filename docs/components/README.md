# Components catalog

Every primitive in `components/ui/` and every domain component in `components/{domain}/`. Read before adding a new component — there's likely something you can reuse or extend.

## Primitives (`components/ui/`)

These are universal. Used everywhere. Edit only when the change is universal.

| Component | Purpose | File |
|---|---|---|
| `Button` | All tappable actions | [Button.tsx](../../components/ui/Button.tsx) |
| `Input` | All text inputs | [Input.tsx](../../components/ui/Input.tsx) |
| `Screen` | Screen wrapper (SafeArea + KeyboardAvoiding) | [Screen.tsx](../../components/ui/Screen.tsx) |

### Button

```tsx
import { Button } from "@/components/ui/Button";

<Button label="Save" onPress={onSave} />
<Button label="Cancel" variant="outline" onPress={onCancel} />
<Button label="Delete" variant="destructive" loading={loading} onPress={onDelete} />
<Button label="Subscribe" size="lg" onPress={onSub} />
```

Props:
- `label: string` — required.
- `variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"` — default `primary`.
- `size?: "sm" | "md" | "lg"` — default `md` (`h-12`).
- `loading?: boolean` — shows spinner, disables.
- `disabled?: boolean` — also disables.
- `haptic?: boolean` — default `true`. Fires `Haptics.selectionAsync()` on press.
- All `Pressable` props (`onPress`, `accessibilityLabel`, etc.).

When NOT to use:
- Icon-only "buttons" with no label → wrap a `<Pressable>` with `accessibilityLabel` instead. (Or extend Button to accept `icon`.)

### Input

```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
  error={emailError}
/>
```

Props:
- `label?: string` — appears above the input.
- `error?: string` — appears below in destructive color.
- All `TextInput` props.

### Screen

```tsx
import { Screen } from "@/components/ui/Screen";

<Screen>
  <View className="flex-1 px-5 pt-4">{...}</View>
</Screen>

<Screen scroll>
  <View className="px-5 py-4">{...}</View>
</Screen>

<Screen edges={["top"]}>{...}</Screen>
```

Props:
- `children: ReactNode`.
- `scroll?: boolean` — wraps in ScrollView. Default `false` (uses View).
- `edges?: Array<"top" | "bottom" | "left" | "right">` — SafeArea edges. Default `["top", "bottom"]`.
- `className?: string` — extra classes on the SafeAreaView.
- `contentClassName?: string` — extra classes on the inner container.

Includes `KeyboardAvoidingView` automatically. Don't double-wrap.

## Domain components (`components/{domain}/`)

Feature-specific components that reuse primitives.

| Component | Domain | File |
|---|---|---|
| `PremiumGate` | paywall | [PremiumGate.tsx](../../components/paywall/PremiumGate.tsx) |

### PremiumGate

Renders children when the user is premium, otherwise renders an upgrade card with a CTA to the paywall.

```tsx
import { PremiumGate } from "@/components/paywall/PremiumGate";

<PremiumGate feature="export_csv">
  <ExportButton onExport={onExport} />
</PremiumGate>
```

Props:
- `feature: string` — slug for analytics. Passed to the paywall as `?trigger=<feature>`. Examples: `export_csv`, `cloud_sync`, `history_30d`.
- `children: ReactNode` — what to show when premium.

This is the **standard premium boundary** for UI. For data-write boundaries (sync, cloud upload), check `useEntitlements.getState().isPremium` directly in the action.

## When to add a new component

### To `components/ui/` (primitive)

YES if:
- It's reused on 3+ different screens.
- Has zero domain logic.
- Provides a missing low-level UI capability (e.g., `Avatar`, `Badge`, `Skeleton`, `Toast`).

NO if:
- It only makes sense in one feature.
- It composes existing primitives without adding a new capability — just compose inline or in `components/{domain}/`.

### To `components/{domain}/`

YES if:
- It's tied to a specific feature (paywall, capture, settings).
- It composes primitives + domain logic (state, analytics tracking, navigation).
- The same UI block appears 2+ times in that domain.

NO if:
- It's used once. Inline in the screen.
- It's UI-only with no domain logic. Use a primitive or compose inline.

### Where it goes (file path)

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Screen.tsx
│   └── {NewPrimitive}.tsx          ← named export, not default
└── {domain}/
    ├── PremiumGate.tsx
    └── {NewFeatureComponent}.tsx
```

## Component file template

```tsx
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

type FooProps = {
  title: string;
  variant?: "default" | "subtle";
  className?: string;
};

export function Foo({ title, variant = "default", className }: FooProps) {
  return (
    <View
      className={cn(
        "rounded-xl p-4",
        variant === "default" ? "bg-primary" : "bg-muted",
        className,
      )}
    >
      <Text className="text-base text-foreground">{title}</Text>
    </View>
  );
}
```

Conventions:
- **Named export**, not default. Default exports only for route files (`app/*`).
- One component per file unless they're tightly coupled and small.
- Props type defined inline as `type {Name}Props = {...}`.
- Default values destructured in signature: `variant = "default"`.
- Optional `className?: string` prop merged with `cn()` so callers can extend.

## Forwarding refs

If the component might be used as a form field (focused programmatically), forward the ref:

```tsx
import { forwardRef } from "react";
import { TextInput } from "react-native";

export const Foo = forwardRef<TextInput, FooProps>((props, ref) => {
  return <TextInput ref={ref} {...props} />;
});
Foo.displayName = "Foo";
```

The existing `Input` and `Button` primitives do this.

## Memoization

By default, don't. React is fast enough for indie apps. Memoize only after a measured re-render problem:

```tsx
import { memo } from "react";

export const Foo = memo(function Foo(props: FooProps) { ... });
```

Especially relevant for FlatList rows: `renderItem` recreates on every parent render. Memoize the row component AND ensure props are stable references.

## Accessibility

For every component you add:
- Touch target ≥ 48×48 (`h-12`).
- `accessibilityLabel` for icon-only Pressables.
- `accessibilityRole` set when it's not obvious (`button`, `link`, `header`).
- Test with VoiceOver / TalkBack at least once before shipping.

## Anti-patterns

- ❌ Default-exporting a component (only routes do that).
- ❌ Re-implementing what `Button` / `Input` / `Screen` already do.
- ❌ Hardcoded colors or font sizes — use semantic tokens.
- ❌ Putting fetch logic in a UI component. Use a hook in `lib/` and pass data in.
- ❌ Naming components after their styling (`BlueCard`, `BigButton`). Name after their role.

## Quick lookups

```bash
# every component used in the app
grep -rn "import.*from.*\"@/components/" app components --include="*.tsx" | sort -u

# unused primitives
for c in components/ui/*.tsx; do
  name=$(basename "$c" .tsx)
  count=$(grep -rln "from.*\"@/components/ui/$name\"" app components | wc -l)
  echo "$name: used $count places"
done
```
