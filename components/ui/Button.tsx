import { forwardRef } from "react";
import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";
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

const sizeContainer: Record<Size, string> = {
  sm: "h-10 px-4",
  md: "h-12 px-5",
  lg: "h-14 px-6",
};

const sizeLabel: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  haptic?: boolean;
};

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    { label, variant = "primary", size = "md", loading, haptic = true, disabled, className, onPress, ...rest },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        onPress={(e) => {
          if (haptic) Haptics.selectionAsync();
          onPress?.(e);
        }}
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
          <Text className={cn("font-semibold", labelStyles[variant], sizeLabel[size])}>{label}</Text>
        )}
      </Pressable>
    );
  },
);
Button.displayName = "Button";
