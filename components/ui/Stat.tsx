import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type StatProps = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
  testID?: string;
};

export function Stat({
  label,
  value,
  unit,
  delta,
  icon: IconCmp,
  className,
  testID,
}: StatProps) {
  // Auto-detect sign if `positive` not explicitly provided.
  const isPositive = delta ? (delta.positive ?? delta.value >= 0) : false;
  const deltaSign = delta && delta.value > 0 ? "+" : "";

  return (
    <View testID={testID} className={cn("gap-2", className)}>
      <View className="flex-row items-center gap-2">
        {IconCmp ? (
          <View className="text-muted-foreground">
            <IconCmp size={14} />
          </View>
        ) : null}
        <Text className="text-caption uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
      </View>
      <View className="flex-row items-baseline gap-1">
        <Text
          className="text-display-sm font-bold tracking-tight tabular-nums text-foreground"
          accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
        >
          {value}
        </Text>
        {unit ? (
          <Text className="text-body-sm text-muted-foreground">{unit}</Text>
        ) : null}
      </View>
      {delta ? (
        <View
          className={cn(
            "self-start rounded-md px-2 py-0.5",
            isPositive ? "bg-primary/10" : "bg-destructive/10",
          )}
        >
          <Text
            className={cn(
              "text-caption font-medium tabular-nums",
              isPositive ? "text-primary" : "text-destructive",
            )}
          >
            {deltaSign}
            {delta.value}
            {unit ? unit : "%"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
