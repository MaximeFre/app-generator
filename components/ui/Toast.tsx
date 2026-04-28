import { Pressable, Text, View } from "react-native";
import Toast, {
  BaseToastProps,
  ToastConfig,
  ToastShowParams,
} from "react-native-toast-message";
import { CheckCircle2, AlertCircle, Undo2 } from "lucide-react-native";

/**
 * Wrapper around react-native-toast-message wired to our design tokens.
 *
 * Mount once at the app root via <ToastHost /> in app/_layout.tsx (after the
 * navigation Stack so toasts paint above modals).
 *
 * Show toasts from anywhere via the imperative `toast.success` / `toast.error`
 * / `toast.undo` helpers exported below.
 */

type UndoOptions = {
  message: string;
  onUndo: () => void;
  undoLabel?: string;
  durationMs?: number;
};

type ShowOptions = Omit<ToastShowParams, "type" | "text1" | "text2">;

const SuccessToast = ({ text1, text2 }: BaseToastProps) => (
  <View
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
    className="mx-4 mt-2 flex-row items-center gap-3 rounded-2xl bg-primary px-4 py-3"
  >
    <View className="text-primary-foreground">
      <CheckCircle2 size={20} />
    </View>
    <View className="flex-1">
      {text1 ? (
        <Text className="text-body font-medium text-primary-foreground">{text1}</Text>
      ) : null}
      {text2 ? (
        <Text className="text-body-sm text-primary-foreground/80">{text2}</Text>
      ) : null}
    </View>
  </View>
);

const ErrorToast = ({ text1, text2 }: BaseToastProps) => (
  <View
    accessibilityRole="alert"
    accessibilityLiveRegion="assertive"
    className="mx-4 mt-2 flex-row items-center gap-3 rounded-2xl bg-destructive px-4 py-3"
  >
    <View className="text-primary-foreground">
      <AlertCircle size={20} />
    </View>
    <View className="flex-1">
      {text1 ? (
        <Text className="text-body font-medium text-primary-foreground">{text1}</Text>
      ) : null}
      {text2 ? (
        <Text className="text-body-sm text-primary-foreground/80">{text2}</Text>
      ) : null}
    </View>
  </View>
);

type UndoProps = BaseToastProps & {
  props?: { onUndo?: () => void; undoLabel?: string };
};

const UndoToast = ({ text1, props }: UndoProps) => {
  const onUndo = props?.onUndo;
  const undoLabel = props?.undoLabel ?? "Undo";
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="mx-4 mt-2 flex-row items-center gap-3 rounded-2xl bg-foreground px-4 py-3"
    >
      <View className="flex-1">
        {text1 ? (
          <Text className="text-body font-medium text-background">{text1}</Text>
        ) : null}
      </View>
      {onUndo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={undoLabel}
          onPress={() => {
            onUndo();
            Toast.hide();
          }}
          className="flex-row items-center gap-1 rounded-md bg-background/10 px-3 py-1.5 active:opacity-80"
        >
          <View className="text-background">
            <Undo2 size={14} />
          </View>
          <Text className="text-body-sm font-semibold text-background">{undoLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (p: BaseToastProps) => <SuccessToast {...p} />,
  error: (p: BaseToastProps) => <ErrorToast {...p} />,
  undo: (p: BaseToastProps) => <UndoToast {...(p as UndoProps)} />,
};

export function ToastHost() {
  return <Toast config={toastConfig} />;
}

export const toast = {
  success(message: string, opts: ShowOptions = {}) {
    Toast.show({ type: "success", text1: message, ...opts });
  },
  error(message: string, opts: ShowOptions = {}) {
    Toast.show({ type: "error", text1: message, ...opts });
  },
  undo({ message, onUndo, undoLabel = "Undo", durationMs = 5000 }: UndoOptions) {
    Toast.show({
      type: "undo",
      text1: message,
      visibilityTime: durationMs,
      props: { onUndo, undoLabel },
    });
  },
  hide() {
    Toast.hide();
  },
};
