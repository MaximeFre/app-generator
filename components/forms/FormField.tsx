import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

/**
 * Label + helper + error wrapper. Composes around any input — useful when
 * you don't want the input itself to know about labels (keeps the input
 * primitives lean).
 *
 * Helper and error text occupy the same slot; error wins when both are set
 * and flips the color from muted to destructive.
 */

export type FormFieldProps = {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  /** Pass `true` if the field is required so the label renders an asterisk. */
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  helper,
  error,
  disabled,
  required,
  className,
  children,
}: FormFieldProps) {
  const showError = !!error;
  return (
    <View
      accessibilityState={{ disabled: !!disabled }}
      className={cn("w-full", disabled && "opacity-50", className)}
    >
      {label ? (
        <Text className="mb-1 text-caption uppercase tracking-wide text-muted-foreground">
          {label}
          {required ? <Text className="text-destructive"> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {showError ? (
        <Text className="mt-1 text-caption text-destructive" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text className="mt-1 text-caption text-muted-foreground">{helper}</Text>
      ) : null}
    </View>
  );
}
