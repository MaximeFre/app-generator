import { useCallback, useRef } from "react";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { Minus, Plus, Check } from "lucide-react-native";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet, type SheetRef } from "@/components/ui/Sheet";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";
import * as haptics from "@/lib/haptics";

/**
 * Number + unit. Common pattern: weight in kg/lb, distance in km/mi.
 *
 * The unit chip on the right opens a Sheet with options. Picking a unit
 * does NOT auto-convert — that's the caller's responsibility (different
 * apps want different conversion semantics: e.g. body weight rounds to .5).
 */

export type UnitOption<U extends string> = { value: U; label: string };

export type UnitInputProps<U extends string> = {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  value: number;
  unit: U;
  onChangeValue: (next: number) => void;
  onChangeUnit: (next: U) => void;
  units: UnitOption<U>[];
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  className?: string;
};

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export function UnitInput<U extends string>({
  label,
  helper,
  error,
  disabled,
  value,
  unit,
  onChangeValue,
  onChangeUnit,
  units,
  min,
  max,
  step = 1,
  precision = 0,
  className,
}: UnitInputProps<U>) {
  const sheetRef = useRef<SheetRef>(null);

  const dec = useCallback(() => {
    if (disabled) return;
    haptics.selection();
    onChangeValue(clamp(value - step, min, max));
  }, [disabled, value, step, min, max, onChangeValue]);

  const inc = useCallback(() => {
    if (disabled) return;
    haptics.selection();
    onChangeValue(clamp(value + step, min, max));
  }, [disabled, value, step, min, max, onChangeValue]);

  const onChangeText = useCallback(
    (text: string) => {
      const cleaned = text.replace(",", ".");
      if (cleaned === "" || cleaned === "-") {
        onChangeValue(0);
        return;
      }
      const parsed = Number(cleaned);
      if (Number.isNaN(parsed)) return;
      onChangeValue(clamp(parsed, min, max));
    },
    [onChangeValue, min, max],
  );

  const openUnits = useCallback(() => {
    if (disabled) return;
    haptics.tap();
    sheetRef.current?.present();
  }, [disabled]);

  const pickUnit = useCallback(
    (next: U) => {
      haptics.selection();
      onChangeUnit(next);
      sheetRef.current?.dismiss();
    },
    [onChangeUnit],
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
          "h-12 flex-row items-center rounded-xl border border-border bg-background pr-1",
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Unit: ${unit}`}
          onPress={openUnits}
          disabled={disabled}
          className="ml-1 h-9 min-w-[3rem] items-center justify-center rounded-lg bg-muted px-2.5"
        >
          <Text className="text-body-sm font-semibold uppercase text-foreground">
            {unit}
          </Text>
        </Pressable>
      </View>

      <Sheet ref={sheetRef} title={label} snapPoints={["35%", "60%"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {units.map((opt) => {
            const isActive = opt.value === unit;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => pickUnit(opt.value)}
                className={cn(
                  "mb-1 flex-row items-center gap-3 rounded-xl px-3 py-3",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <Text
                  className={cn(
                    "flex-1 text-body",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-foreground",
                  )}
                >
                  {opt.label}
                </Text>
                {isActive ? (
                  <View className="text-primary">
                    <Check size={18} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </FormField>
  );
}
