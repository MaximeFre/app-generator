import { forwardRef, type ReactNode } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type ListRowProps = Omit<PressableProps, "children"> & {
  title: string;
  subtitle?: string;
  leadingIcon?: LucideIcon;
  /** ReactNode to render trailing. Pass "chevron" to force the chevron, or omit to auto-show when onPress is set. */
  trailing?: ReactNode | "chevron";
  onPress?: PressableProps["onPress"];
};

export const ListRow = forwardRef<React.ComponentRef<typeof Pressable>, ListRowProps>(
  (
    {
      title,
      subtitle,
      leadingIcon: LeadingIcon,
      trailing,
      onPress,
      className,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) => {
    const showChevron =
      trailing === "chevron" || (trailing === undefined && !!onPress);
    const customTrailing = trailing && trailing !== "chevron" ? trailing : null;

    const content = (
      <>
        {LeadingIcon ? (
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
            <View className="text-foreground">
              <LeadingIcon size={18} />
            </View>
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-body font-medium text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-body-sm text-muted-foreground" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {customTrailing ? (
          <View className="ml-3">{customTrailing}</View>
        ) : null}
        {showChevron ? (
          <View className="ml-2 text-muted-foreground">
            <ChevronRight size={18} />
          </View>
        ) : null}
      </>
    );

    if (onPress) {
      return (
        <Pressable
          ref={ref}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          className={cn(
            "h-14 flex-row items-center px-4 active:bg-muted/40",
            className as string | undefined,
          )}
          {...rest}
        >
          {content}
        </Pressable>
      );
    }

    return (
      <View
        accessibilityLabel={accessibilityLabel ?? title}
        className={cn("h-14 flex-row items-center px-4", className as string | undefined)}
      >
        {content}
      </View>
    );
  },
);
ListRow.displayName = "ListRow";
