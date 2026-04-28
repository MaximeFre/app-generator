import { isValidElement, type ReactNode } from "react";
import { Text, View } from "react-native";
import { AlertCircle, type LucideIcon } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  icon?: LucideIcon | ReactNode;
  title: string;
  body?: string;
  /** Recovery handler — shown as a destructive Button. */
  retry?: () => void;
  retryLabel?: string;
  className?: string;
  testID?: string;
};

function isLucideIcon(value: unknown): value is LucideIcon {
  return typeof value === "function";
}

/**
 * Mirror of <EmptyState> for failed loads. Destructive icon tint + retry CTA.
 * Use <EmptyState> for genuinely empty (no-error) states.
 */
export function ErrorState({
  icon,
  title,
  body,
  retry,
  retryLabel = "Retry",
  className,
  testID,
}: ErrorStateProps) {
  const resolved = icon ?? AlertCircle;

  let iconNode: ReactNode = null;
  if (isLucideIcon(resolved)) {
    const IconCmp = resolved;
    iconNode = (
      <View className="mb-4 text-destructive">
        <IconCmp size={48} />
      </View>
    );
  } else if (isValidElement(resolved)) {
    iconNode = <View className="mb-4">{resolved}</View>;
  }

  return (
    <View
      testID={testID}
      className={cn("flex-1 items-center px-6 pt-16", className)}
    >
      {iconNode}
      <Text
        className="text-h2 font-semibold text-foreground text-center"
        accessibilityRole="header"
      >
        {title}
      </Text>
      {body ? (
        <Text className="mt-2 text-body text-muted-foreground text-center">{body}</Text>
      ) : null}
      {retry ? (
        <View className="mt-6">
          <Button label={retryLabel} variant="destructive" onPress={retry} />
        </View>
      ) : null}
    </View>
  );
}
