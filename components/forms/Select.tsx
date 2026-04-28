import { useRef, useCallback, useMemo } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { Sheet, type SheetRef } from "@/components/ui/Sheet";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";
import * as haptics from "@/lib/haptics";

/**
 * Tap-to-open select. Tapping the field surfaces a bottom Sheet with the
 * full options list. Picked value updates immediately and dismisses the
 * sheet — keeps the interaction at one tap for short lists.
 *
 * For long lists, the inner ScrollView lets users scan; a future variant
 * could swap in a search box.
 */

export type SelectOption<V extends string | number> = {
  value: V;
  label: string;
  description?: string;
};

export type SelectProps<V extends string | number> = {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  value: V | null | undefined;
  onChange: (next: V) => void;
  options: SelectOption<V>[];
  /** Title shown at the top of the bottom sheet. Defaults to `label`. */
  sheetTitle?: string;
  className?: string;
};

export function Select<V extends string | number>({
  label,
  helper,
  error,
  disabled,
  placeholder,
  value,
  onChange,
  options,
  sheetTitle,
  className,
}: SelectProps<V>) {
  const sheetRef = useRef<SheetRef>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const open = useCallback(() => {
    if (disabled) return;
    haptics.tap();
    sheetRef.current?.present();
  }, [disabled]);

  const pick = useCallback(
    (next: V) => {
      haptics.selection();
      onChange(next);
      sheetRef.current?.dismiss();
    },
    [onChange],
  );

  return (
    <FormField
      label={label}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        onPress={open}
        className={cn(
          "h-12 flex-row items-center rounded-xl border border-border bg-background px-4",
          error ? "border-destructive" : null,
        )}
      >
        <Text
          numberOfLines={1}
          className={cn(
            "flex-1 text-base",
            selected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {selected?.label ?? placeholder ?? ""}
        </Text>
        <View className="text-muted-foreground">
          <ChevronDown size={18} />
        </View>
      </Pressable>

      <Sheet ref={sheetRef} title={sheetTitle ?? label} snapPoints={["50%", "85%"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <Pressable
                key={String(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => pick(opt.value)}
                className={cn(
                  "mb-1 flex-row items-center gap-3 rounded-xl px-3 py-3",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-body",
                      isActive
                        ? "font-semibold text-primary"
                        : "text-foreground",
                    )}
                  >
                    {opt.label}
                  </Text>
                  {opt.description ? (
                    <Text className="mt-0.5 text-caption text-muted-foreground">
                      {opt.description}
                    </Text>
                  ) : null}
                </View>
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
