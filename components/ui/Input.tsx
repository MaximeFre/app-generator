import { forwardRef } from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, InputProps>(({ label, error, className, ...rest }, ref) => {
  return (
    <View className="w-full">
      {label ? <Text className="mb-2 text-sm font-medium text-foreground">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={cn(
          "h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground",
          error ? "border-destructive" : null,
          className as string | undefined,
        )}
        placeholderTextColor="rgb(var(--color-muted-foreground))"
        {...rest}
      />
      {error ? <Text className="mt-1 text-xs text-destructive">{error}</Text> : null}
    </View>
  );
});
Input.displayName = "Input";
