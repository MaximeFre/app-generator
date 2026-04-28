import { forwardRef, useCallback } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type PressableProps,
  type GestureResponderEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const containerStyles: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const labelStyles: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-primary-foreground",
};

// Icon tint mirrors label tint per variant. lucide icons take a `color` prop,
// but we set tint via NativeWind className so dark-mode follows tokens.
const iconColorClass: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-primary-foreground",
};

const sizeContainer: Record<Size, string> = {
  sm: "h-10 px-4 gap-2",
  md: "h-12 px-5 gap-2",
  lg: "h-14 px-6 gap-3",
};

const sizeLabel: Record<Size, string> = {
  sm: "text-body-sm",
  md: "text-body",
  lg: "text-body",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  haptic?: boolean;
  /** Lucide icon component rendered before the label. */
  leftIcon?: LucideIcon;
  /** Lucide icon component rendered after the label. */
  rightIcon?: LucideIcon;
  /** Pixel size for left/right icons. Defaults to 18. */
  iconSize?: number;
  /** Press scale animation (Reanimated withSpring 0.97). Defaults to true. */
  pressAnim?: boolean;
};

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      label,
      variant = "primary",
      size = "md",
      loading,
      haptic = true,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      iconSize = 18,
      pressAnim = true,
      disabled,
      className,
      onPress,
      onPressIn,
      onPressOut,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(
      (e: GestureResponderEvent) => {
        if (pressAnim) {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 280 });
        }
        onPressIn?.(e);
      },
      [pressAnim, scale, onPressIn],
    );

    const handlePressOut = useCallback(
      (e: GestureResponderEvent) => {
        if (pressAnim) {
          scale.value = withSpring(1, { damping: 18, stiffness: 280 });
        }
        onPressOut?.(e);
      },
      [pressAnim, scale, onPressOut],
    );

    const handlePress = useCallback(
      (e: GestureResponderEvent) => {
        if (haptic) Haptics.selectionAsync();
        onPress?.(e);
      },
      [haptic, onPress],
    );

    const tintClass = iconColorClass[variant];

    return (
      <AnimatedPressable
        ref={ref}
        disabled={disabled || loading}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
        style={pressAnim ? animatedStyle : undefined}
        className={cn(
          "flex-row items-center justify-center rounded-xl active:opacity-80",
          containerStyles[variant],
          sizeContainer[size],
          (disabled || loading) && "opacity-50",
          className as string | undefined,
        )}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {LeftIcon ? (
              <View className={tintClass}>
                <LeftIcon size={iconSize} />
              </View>
            ) : null}
            <Text className={cn("font-semibold", labelStyles[variant], sizeLabel[size])}>
              {label}
            </Text>
            {RightIcon ? (
              <View className={tintClass}>
                <RightIcon size={iconSize} />
              </View>
            ) : null}
          </>
        )}
      </AnimatedPressable>
    );
  },
);
Button.displayName = "Button";
