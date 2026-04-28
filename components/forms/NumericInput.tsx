import { useCallback } from "react";
import { View, Text, TextInput } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { IconButton } from "@/components/ui/IconButton";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";
import * as haptics from "@/lib/haptics";

/**
 * Number input with [-] [value] [+] steppers. Keeps the keyboard hidden in
 * the common case (tap a stepper) but stays editable for power users (tap
 * the value to type).
 *
 * Tabular nums via `font-variant: tabular-nums` (set on RN by `fontVariant`
 * style) so the digits don't shimmy when stepping.
 */

export type NumericInputProps = {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Number of decimal places to format the displayed value with. */
  precision?: number;
  className?: string;
};

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export function NumericInput({
  label,
  helper,
  error,
  disabled,
  value,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  className,
}: NumericInputProps) {
  const dec = useCallback(() => {
    if (disabled) return;
    haptics.selection();
    onChange(clamp(value - step, min, max));
  }, [disabled, value, step, min, max, onChange]);

  const inc = useCallback(() => {
    if (disabled) return;
    haptics.selection();
    onChange(clamp(value + step, min, max));
  }, [disabled, value, step, min, max, onChange]);

  const onChangeText = useCallback(
    (text: string) => {
      const cleaned = text.replace(",", ".");
      if (cleaned === "" || cleaned === "-") {
        onChange(0);
        return;
      }
      const parsed = Number(cleaned);
      if (Number.isNaN(parsed)) return;
      onChange(clamp(parsed, min, max));
    },
    [onChange, min, max],
  );

  return (
    <FormField
      label={label}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <View
        className={cn(
          "h-12 flex-row items-center rounded-xl border border-border bg-background",
          error ? "border-destructive" : null,
        )}
      >
        <IconButton
          icon={Minus}
          variant="ghost"
          accessibilityLabel="Decrease"
          onPress={dec}
          disabled={disabled || (min !== undefined && value <= min)}
          className="h-12 w-12"
        />
        <TextInput
          editable={!disabled}
          value={value.toFixed(precision)}
          onChangeText={onChangeText}
          keyboardType="numeric"
          selectTextOnFocus
          accessibilityLabel={label}
          style={{ fontVariant: ["tabular-nums"] }}
          className="flex-1 text-center text-base text-foreground"
        />
        <IconButton
          icon={Plus}
          variant="ghost"
          accessibilityLabel="Increase"
          onPress={inc}
          disabled={disabled || (max !== undefined && value >= max)}
          className="h-12 w-12"
        />
      </View>
      {/* Reserve a slot for stepper-only forms with no helper text. */}
      <Text className="sr-only">{value}</Text>
    </FormField>
  );
}
