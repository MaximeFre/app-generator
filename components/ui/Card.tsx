import { forwardRef } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { cn } from "@/lib/utils";

type Variant = "elevated" | "outline" | "flat";

const variantStyles: Record<Variant, string> = {
  // Elevation hint via subtle shadow on iOS / native elevation on Android.
  // Tailwind shadow utilities are limited on RN — use a tonal background.
  elevated: "bg-background shadow-sm",
  outline: "bg-background border border-border",
  flat: "bg-muted/40",
};

type Padding = "sm" | "md" | "lg" | number;

const paddingClass: Record<"sm" | "md" | "lg", string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

type CommonProps = {
  variant?: Variant;
  padding?: Padding;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
};

type CardProps = CommonProps &
  (
    | (Omit<PressableProps, "children" | "style" | "className"> & {
        onPress: PressableProps["onPress"];
      })
    | (Omit<ViewProps, "children" | "style" | "className"> & { onPress?: undefined })
  );

export const Card = forwardRef<View, CardProps>(
  (
    {
      variant = "flat",
      padding = "md",
      className,
      style,
      children,
      testID,
      onPress,
      ...rest
    },
    ref,
  ) => {
    const paddingStyle =
      typeof padding === "number" ? { padding } : undefined;
    const paddingClassName =
      typeof padding === "string" ? paddingClass[padding] : undefined;

    const baseClassName = cn(
      "rounded-2xl",
      variantStyles[variant],
      paddingClassName,
      className,
    );

    if (onPress) {
      return (
        <Pressable
          ref={ref as React.Ref<React.ComponentRef<typeof Pressable>>}
          onPress={onPress}
          accessibilityRole="button"
          testID={testID}
          style={[paddingStyle, style]}
          className={cn(baseClassName, "active:opacity-80")}
          {...(rest as PressableProps)}
        >
          {children}
        </Pressable>
      );
    }

    return (
      <View
        ref={ref}
        testID={testID}
        style={[paddingStyle, style]}
        className={baseClassName}
        {...(rest as ViewProps)}
      >
        {children}
      </View>
    );
  },
);
Card.displayName = "Card";
