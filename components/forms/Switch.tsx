import { Switch as RNSwitch, View, Text, Pressable } from "react-native";
import { FormField } from "./FormField";
import * as haptics from "@/lib/haptics";
import { cn } from "@/lib/utils";

/**
 * Branded wrapper around RN's Switch.
 *
 * Track colors come from the theme — `bg-primary` (active) and `bg-muted`
 * (inactive). RN's Switch only takes raw color values, so we sample the
 * tokens via the same RGB CSS vars the rest of NativeWind uses. If a token
 * is renamed, update the constants below.
 */

// These match the CSS vars defined in `global.css`. NativeWind translates
// `bg-primary` to `rgb(var(--color-primary) / 1)` at runtime — but RNSwitch
// needs literal hex/rgb. Reading the var via `getComputedStyle` isn't an
// option on RN, so we hand-pick approximate values that match the default
// design-tokens; downstream apps tweak them in their own theme.
//
// Trade-off acknowledged: this is the one place where we drift from
// "tokens only" because RN's primitive doesn't accept className for track
// color. See decisions-to-revisit at the end of the report.
const TRACK_ACTIVE = "#0f172a"; // slate-900-ish, matches default --color-primary
const TRACK_INACTIVE = "#e2e8f0"; // slate-200-ish, matches default --color-muted
const THUMB = "#ffffff";

export type SwitchProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  /** Render label inline on the right of the switch instead of above it. */
  inline?: boolean;
  className?: string;
};

export function Switch({
  value,
  onChange,
  label,
  helper,
  error,
  disabled,
  inline = true,
  className,
}: SwitchProps) {
  const handleChange = (next: boolean) => {
    haptics.selection();
    onChange(next);
  };

  if (inline && label) {
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled: !!disabled }}
        accessibilityLabel={label}
        onPress={() => handleChange(!value)}
        disabled={disabled}
        className={cn(
          "flex-row items-center justify-between rounded-xl bg-muted/40 px-4 py-3",
          disabled && "opacity-50",
          className,
        )}
      >
        <View className="flex-1 pr-3">
          <Text className="text-body font-medium text-foreground">{label}</Text>
          {error ? (
            <Text className="mt-0.5 text-caption text-destructive">{error}</Text>
          ) : helper ? (
            <Text className="mt-0.5 text-caption text-muted-foreground">{helper}</Text>
          ) : null}
        </View>
        <RNSwitch
          value={value}
          onValueChange={handleChange}
          disabled={disabled}
          trackColor={{ false: TRACK_INACTIVE, true: TRACK_ACTIVE }}
          thumbColor={THUMB}
          ios_backgroundColor={TRACK_INACTIVE}
        />
      </Pressable>
    );
  }

  return (
    <FormField label={label} helper={helper} error={error} disabled={disabled} className={className}>
      <RNSwitch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{ false: TRACK_INACTIVE, true: TRACK_ACTIVE }}
        thumbColor={THUMB}
        ios_backgroundColor={TRACK_INACTIVE}
      />
    </FormField>
  );
}
