import { isValidElement, type ReactNode } from "react";
import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  icon?: LucideIcon | ReactNode;
  title: string;
  body?: string;
  cta?: { label: string; onPress: () => void };
  className?: string;
  testID?: string;
  /** Internal: ErrorState reuses this with destructive tinting. */
  variant?: "default" | "error";
};

function isLucideIcon(value: unknown): value is LucideIcon {
  return typeof value === "function";
}

export function EmptyState({
  icon,
  title,
  body,
  cta,
  className,
  testID,
  variant = "default",
}: EmptyStateProps) {
  const tintClass = variant === "error" ? "text-destructive" : "text-muted-foreground";

  let iconNode: ReactNode = null;
  if (icon) {
    if (isLucideIcon(icon)) {
      const IconCmp = icon;
      iconNode = (
        <View className={cn("mb-4", tintClass)}>
          <IconCmp size={48} />
        </View>
      );
    } else if (isValidElement(icon)) {
      iconNode = <View className="mb-4">{icon}</View>;
    }
  }

  return (
    <View
      testID={testID}
      className={cn(
        "flex-1 items-center px-6 pt-16",
        className,
      )}
    >
      {iconNode}
      <Text className="text-h2 font-semibold text-foreground text-center" accessibilityRole="header">
        {title}
      </Text>
      {body ? (
        <Text className="mt-2 text-body text-muted-foreground text-center">{body}</Text>
      ) : null}
      {cta ? (
        <View className="mt-6">
          <Button label={cta.label} onPress={cta.onPress} />
        </View>
      ) : null}
    </View>
  );
}
