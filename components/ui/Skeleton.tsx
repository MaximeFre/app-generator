import { useEffect } from "react";
import { View, type DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  className?: string;
  /** Override the default rounded-md radius. */
  radius?: number;
  testID?: string;
};

export function Skeleton({ width, height, className, radius, testID }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[{ width, height, borderRadius: radius }, animatedStyle]}
      className={cn("bg-muted", radius === undefined && "rounded-md", className)}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  className?: string;
  /** Last line is shorter to mimic real paragraph wrap. Default true. */
  shortenLast?: boolean;
};

export function SkeletonText({ lines = 3, className, shortenLast = true }: SkeletonTextProps) {
  return (
    <View className={cn("gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const width: DimensionValue = isLast && shortenLast ? "60%" : "100%";
        return <Skeleton key={i} width={width} height={12} />;
      })}
    </View>
  );
}

type SkeletonRowProps = {
  className?: string;
};

/** Card-shaped skeleton: leading circle + 2 lines of text. */
export function SkeletonRow({ className }: SkeletonRowProps) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-2xl bg-muted/40 p-4",
        className,
      )}
    >
      <Skeleton width={40} height={40} radius={20} />
      <View className="flex-1 gap-2">
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}
