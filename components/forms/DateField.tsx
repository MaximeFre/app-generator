import { useCallback, useState } from "react";
import { Pressable, Text, View, TextInput, Platform } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";
import * as haptics from "@/lib/haptics";

/**
 * Date / time field.
 *
 * Tries to import `@react-native-community/datetimepicker`. If the dep is
 * present, taps open the native picker. If it's absent (template default),
 * the field falls back to a plain text input that accepts ISO `YYYY-MM-DD`
 * (or `HH:mm` for time mode).
 *
 * `mode`:
 *  - "date" → ISO date string `"2026-04-28"`
 *  - "time" → 24h string `"08:30"`
 *
 * The value is always a string. Callers parse it however they like — keeping
 * Date out of the prop interface dodges timezone drift.
 *
 * To enable native picker:
 *   npx expo install @react-native-community/datetimepicker
 */

type DateTimePickerEvent = { type: string };
type DateTimePickerProps = {
  value: Date;
  mode: "date" | "time";
  display?: string;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  is24Hour?: boolean;
};

function loadPicker():
  | { default: React.ComponentType<DateTimePickerProps> }
  | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-community/datetimepicker") as {
      default: React.ComponentType<DateTimePickerProps>;
    };
  } catch {
    return null;
  }
}

export type DateFieldProps = {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  mode?: "date" | "time";
  /** ISO `YYYY-MM-DD` (date) or `HH:mm` (time). */
  value: string | null;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateToString(d: Date, mode: "date" | "time"): string {
  if (mode === "time") {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function stringToDate(value: string | null, mode: "date" | "time"): Date {
  const now = new Date();
  if (!value) return now;
  if (mode === "time") {
    const [h, m] = value.split(":").map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    return now;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}

export function DateField({
  label,
  helper,
  error,
  disabled,
  mode = "date",
  value,
  onChange,
  placeholder,
  className,
}: DateFieldProps) {
  const Picker = loadPicker();
  const [showAndroid, setShowAndroid] = useState(false);

  const open = useCallback(() => {
    if (disabled) return;
    haptics.tap();
    if (Platform.OS === "android") setShowAndroid(true);
  }, [disabled]);

  const onPickerChange = useCallback(
    (_e: DateTimePickerEvent, picked?: Date) => {
      if (Platform.OS === "android") setShowAndroid(false);
      if (picked) onChange(dateToString(picked, mode));
    },
    [onChange, mode],
  );

  // Fallback: plain text input.
  if (!Picker) {
    return (
      <FormField
        label={label}
        helper={helper}
        error={error}
        disabled={disabled}
        className={className}
      >
        <View
          className={cn(
            "h-12 flex-row items-center rounded-xl border border-border bg-background px-4",
            error ? "border-destructive" : null,
          )}
        >
          <TextInput
            editable={!disabled}
            value={value ?? ""}
            onChangeText={onChange}
            placeholder={placeholder ?? (mode === "time" ? "HH:mm" : "YYYY-MM-DD")}
            keyboardType={mode === "time" ? "numbers-and-punctuation" : "numbers-and-punctuation"}
            accessibilityLabel={label}
            className="flex-1 text-base text-foreground"
          />
          <View className="text-muted-foreground">
            <CalendarDays size={18} />
          </View>
        </View>
      </FormField>
    );
  }

  const Component = Picker.default;
  const dateValue = stringToDate(value, mode);
  const displayText =
    value && value.length > 0
      ? value
      : placeholder ?? (mode === "time" ? "HH:mm" : "YYYY-MM-DD");

  return (
    <FormField
      label={label}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      {/* iOS renders the picker inline so it's always visible; Android opens
          a modal on tap. */}
      {Platform.OS === "ios" ? (
        <View
          className={cn(
            "min-h-[3rem] flex-row items-center rounded-xl border border-border bg-background px-2",
            error ? "border-destructive" : null,
          )}
        >
          <Component
            value={dateValue}
            mode={mode}
            display="compact"
            is24Hour
            onChange={onPickerChange}
          />
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={open}
            disabled={disabled}
            className={cn(
              "h-12 flex-row items-center rounded-xl border border-border bg-background px-4",
              error ? "border-destructive" : null,
            )}
          >
            <Text
              className={cn(
                "flex-1 text-base",
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {displayText}
            </Text>
            <View className="text-muted-foreground">
              <CalendarDays size={18} />
            </View>
          </Pressable>
          {showAndroid ? (
            <Component
              value={dateValue}
              mode={mode}
              display="default"
              is24Hour
              onChange={onPickerChange}
            />
          ) : null}
        </>
      )}
    </FormField>
  );
}
