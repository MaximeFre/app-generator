import { useRef, type ReactNode } from "react";
import { Animated, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type SwipeableRowProps = {
  children: ReactNode;
  /** Called when the user taps the destructive action. */
  onDelete: () => void;
  /** Optional: called when the user taps Undo in the toast. If omitted, no toast is fired. */
  onUndo?: () => void;
  deleteLabel?: string;
  undoMessage?: string;
  className?: string;
  testID?: string;
};

/**
 * Right-swipe to delete with optional undo toast.
 *
 * After the user taps the destructive action, calls `onDelete`. If `onUndo`
 * is provided, fires `toast.undo` so the parent can restore the row.
 */
export function SwipeableRow({
  children,
  onDelete,
  onUndo,
  deleteLabel = "Delete",
  undoMessage = "Item deleted",
  className,
  testID,
}: SwipeableRowProps) {
  const swipeRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeRef.current?.close();
    onDelete();
    if (onUndo) {
      toast.undo({ message: undoMessage, onUndo });
    }
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.6],
      extrapolate: "clamp",
    });
    return (
      <View className="h-full w-24 items-center justify-center bg-destructive">
        <Animated.View
          style={{ transform: [{ scale }] }}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          className="items-center gap-1"
        >
          <View className="text-primary-foreground">
            <Trash2 size={20} />
          </View>
          <Text className="text-caption font-semibold text-primary-foreground">
            {deleteLabel}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      testID={testID}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === "right") handleDelete();
      }}
      friction={2}
      rightThreshold={48}
      overshootRight={false}
      containerStyle={{ overflow: "hidden" }}
    >
      <View className={cn("bg-background", className)}>{children}</View>
    </Swipeable>
  );
}
