import { forwardRef, useMemo } from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { icons, type LucideProps } from "lucide-react-native";
import { cn } from "@/lib/utils";

/**
 * Icon wrapper around lucide-react-native.
 *
 * Usage:
 *   <Icon name="settings" size={20} className="text-foreground" />
 *
 * Pattern: name → component is resolved via `icons[name]`. lucide ships every
 * icon as a named export; importing the entire `icons` map is the canonical
 * dynamic-resolution path lucide recommends. Tree-shaking works at the
 * component-name level when bundlers see static name strings, so prefer using
 * <Icon name="..."> with a literal name. If you need full tree-shaking, import
 * the lucide component directly and pass it via the icon-component slots
 * (Button.leftIcon, IconButton.icon, etc).
 *
 * Color is set via NativeWind `className="text-foreground"` (semantic tokens
 * only). Lucide reads `currentColor` from the parent so the className tint
 * cascades naturally on RN.
 */
export type IconName = keyof typeof icons;

export type IconProps = Omit<LucideProps, "ref"> & {
  name: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

export const Icon = forwardRef<View, IconProps>(
  ({ name, size = 20, className, style, testID, accessibilityLabel, ...rest }, ref) => {
    const LucideComponent = useMemo(() => icons[name], [name]);

    if (!LucideComponent) {
      // Fail soft: render an empty box so a typo doesn't crash the screen.
      return <View ref={ref} style={style} testID={testID} />;
    }

    return (
      <View
        ref={ref}
        style={style}
        testID={testID}
        accessibilityRole={accessibilityLabel ? "image" : undefined}
        accessibilityLabel={accessibilityLabel}
        className={cn(className)}
      >
        <LucideComponent size={size} {...rest} />
      </View>
    );
  },
);
Icon.displayName = "Icon";
