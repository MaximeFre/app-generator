import { useCallback } from "react";
import { View, Text } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";
import * as haptics from "@/lib/haptics";

/**
 * Compact stepper for inline list rows: `[-] 8 [+]`.
 *
 * No label / helper / error — meant for dense layouts where the parent row
 * already provides context. Use `<NumericInput>` when you need a full field.
 */

export type StepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  className,
}: StepperProps) {
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

  return (
    <View className={cn("h-9 flex-row items-center gap-2", className)}>
      <IconButton
        icon={Minus}
        variant="tonal"
        accessibilityLabel="Decrease"
        onPress={dec}
        disabled={disabled || (min !== undefined && value <= min)}
        className="h-9 w-9"
        iconSize={16}
      />
      <Text
        accessibilityLiveRegion="polite"
        style={{ fontVariant: ["tabular-nums"] }}
        className="min-w-[2.5rem] text-center text-body font-semibold text-foreground"
      >
        {value}
      </Text>
      <IconButton
        icon={Plus}
        variant="tonal"
        accessibilityLabel="Increase"
        onPress={inc}
        disabled={disabled || (max !== undefined && value >= max)}
        className="h-9 w-9"
        iconSize={16}
      />
    </View>
  );
}
