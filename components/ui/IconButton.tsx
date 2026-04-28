import { forwardRef, useCallback } from "react";
import {
  Pressable,
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

type Variant = "default" | "ghost" | "tonal";

const containerStyles: Record<Variant, string> = {
  default: "bg-secondary",
  ghost: "bg-transparent",
  tonal: "bg-primary/10",
};

const tintClass: Record<Variant, string> = {
  default: "text-secondary-foreground",
  ghost: "text-foreground",
  tonal: "text-primary",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconButtonProps = Omit<PressableProps, "children"> & {
  /** Required for screen readers — describe the action ("Close", "Open settings"). */
  accessibilityLabel: string;
  icon: LucideIcon;
  iconSize?: number;
  variant?: Variant;
  haptic?: boolean;
  pressAnim?: boolean;
};

export const IconButton = forwardRef<React.ComponentRef<typeof Pressable>, IconButtonProps>(
  (
    {
      accessibilityLabel,
      icon: IconCmp,
      iconSize = 20,
      variant = "default",
      haptic = true,
      pressAnim = true,
      disabled,
      className,
      onPress,
      onPressIn,
      onPressOut,
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
          scale.value = withSpring(0.94, { damping: 18, stiffness: 280 });
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

    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={pressAnim ? animatedStyle : undefined}
        className={cn(
          "h-10 w-10 items-center justify-center rounded-xl active:opacity-80",
          containerStyles[variant],
          disabled && "opacity-50",
          className as string | undefined,
        )}
        {...rest}
      >
        <View className={tintClass[variant]}>
          <IconCmp size={iconSize} />
        </View>
      </AnimatedPressable>
    );
  },
);
IconButton.displayName = "IconButton";
