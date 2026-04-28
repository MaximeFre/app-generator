import { Image } from "expo-image";
import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  initials?: string;
  icon?: LucideIcon;
  /** Pixel size for the circle. Defaults to 40 (matches h-10 w-10). */
  size?: number;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export function Avatar({
  src,
  initials,
  icon: IconCmp,
  size = 40,
  className,
  testID,
  accessibilityLabel,
}: AvatarProps) {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.5);
  // Initials sized at ~40% of avatar — matches material/iOS conventions.
  const initialsFontSize = Math.round(size * 0.4);

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? (initials ? `Avatar ${initials}` : "Avatar")}
      style={{ width: size, height: size, borderRadius: radius }}
      className={cn(
        "items-center justify-center overflow-hidden bg-muted",
        className,
      )}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={120}
        />
      ) : initials ? (
        <Text
          style={{ fontSize: initialsFontSize }}
          className="font-semibold text-muted-foreground"
        >
          {initials.slice(0, 2).toUpperCase()}
        </Text>
      ) : IconCmp ? (
        <View className="text-muted-foreground">
          <IconCmp size={iconSize} />
        </View>
      ) : null}
    </View>
  );
}
