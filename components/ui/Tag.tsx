import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "secondary" | "outline" | "destructive";

const containerStyles: Record<Variant, string> = {
  default: "bg-muted",
  primary: "bg-primary",
  secondary: "bg-secondary",
  outline: "border border-border bg-transparent",
  destructive: "bg-destructive",
};

const labelStyles: Record<Variant, string> = {
  default: "text-foreground",
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  destructive: "text-primary-foreground",
};

type TagProps = {
  label: string;
  variant?: Variant;
  icon?: LucideIcon;
  className?: string;
  testID?: string;
};

export function Tag({
  label,
  variant = "default",
  icon: IconCmp,
  className,
  testID,
}: TagProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={label}
      className={cn(
        "h-7 flex-row items-center gap-1.5 self-start rounded-full px-3",
        containerStyles[variant],
        className,
      )}
    >
      {IconCmp ? (
        <View className={labelStyles[variant]}>
          <IconCmp size={12} />
        </View>
      ) : null}
      <Text className={cn("text-caption font-medium", labelStyles[variant])}>{label}</Text>
    </View>
  );
}
