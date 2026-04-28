import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

export type SegmentedOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

type SegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (next: string) => void;
  haptic?: boolean;
  className?: string;
  testID?: string;
};

export function Segmented({
  options,
  value,
  onChange,
  haptic = true,
  className,
  testID,
}: SegmentedProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      className={cn(
        "h-10 flex-row items-center rounded-xl bg-muted/40 p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const Icon = opt.icon;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              if (haptic) Haptics.selectionAsync();
              onChange(opt.value);
            }}
            className={cn(
              "h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg",
              isActive ? "bg-primary" : "bg-transparent",
            )}
          >
            {Icon ? (
              <View className={isActive ? "text-primary-foreground" : "text-muted-foreground"}>
                <Icon size={14} />
              </View>
            ) : null}
            <Text
              className={cn(
                "text-body-sm font-medium",
                isActive ? "text-primary-foreground" : "text-muted-foreground",
              )}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
