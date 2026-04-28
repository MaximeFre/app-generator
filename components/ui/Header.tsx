import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type Align = "left" | "center";

type HeaderProps = {
  title?: string;
  /** When set, renders a leading chevron-left IconButton wired to this handler. */
  onBack?: () => void;
  /** Custom slot rendered on the right (icons, button, etc). */
  trailing?: ReactNode;
  /** Title alignment. Default "center" matches iOS, "left" matches Material. */
  align?: Align;
  className?: string;
  testID?: string;
};

/**
 * Sticky top bar for non-tab screens.
 *
 * Note: we don't pull `expo-blur` to keep the dependency surface small. The
 * solid `bg-background` + `border-b border-border` reads as a clean header on
 * both light and dark. Switch to expo-blur in the future if a true frosted
 * effect is needed (it requires a config plugin entry).
 */
export function Header({
  title,
  onBack,
  trailing,
  align = "center",
  className,
  testID,
}: HeaderProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="header"
      className={cn(
        "h-14 flex-row items-center border-b border-border bg-background px-3",
        className,
      )}
    >
      <View className="w-12 items-start">
        {onBack ? (
          <IconButton
            variant="ghost"
            icon={ChevronLeft}
            onPress={onBack}
            accessibilityLabel="Go back"
          />
        ) : null}
      </View>
      <View className={cn("flex-1", align === "center" ? "items-center" : "items-start")}>
        {title ? (
          <Text
            className="text-h2 font-semibold tracking-tight text-foreground"
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View className="w-12 items-end">{trailing}</View>
    </View>
  );
}
