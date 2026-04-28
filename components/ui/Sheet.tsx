import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Text, View, useColorScheme } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet wrapper around @gorhom/bottom-sheet.
 *
 * Mount <SheetProvider> once at the app root (after GestureHandlerRootView).
 * Use <Sheet> per-feature with an imperative ref:
 *
 *   const ref = useRef<SheetRef>(null);
 *   ref.current?.present();
 *   ref.current?.dismiss();
 */

export type SheetRef = {
  present: () => void;
  dismiss: () => void;
};

type SheetProps = {
  /** Snap points. Defaults to ["50%", "85%"]. */
  snapPoints?: (string | number)[];
  title?: string;
  /** When true, tapping backdrop dismisses the sheet. Default true. */
  dismissOnBackdropTap?: boolean;
  /** Hide the default header (handle + title + close button). */
  hideHeader?: boolean;
  children: ReactNode;
  className?: string;
};

export const SheetProvider = ({ children }: { children: ReactNode }) => (
  <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
);

export const Sheet = forwardRef<SheetRef, SheetProps>(
  (
    {
      snapPoints,
      title,
      dismissOnBackdropTap = true,
      hideHeader,
      children,
      className,
    },
    ref,
  ) => {
    const modalRef = useRef<BottomSheetModal>(null);
    const colorScheme = useColorScheme();

    const points = useMemo(() => snapPoints ?? ["50%", "85%"], [snapPoints]);

    useImperativeHandle(
      ref,
      () => ({
        present: () => modalRef.current?.present(),
        dismiss: () => modalRef.current?.dismiss(),
      }),
      [],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={dismissOnBackdropTap ? "close" : "none"}
          opacity={colorScheme === "dark" ? 0.6 : 0.4}
        />
      ),
      [dismissOnBackdropTap, colorScheme],
    );

    // Hide the library's default handle — we render our own in the header so
    // it stays themable via NativeWind tokens.
    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={points}
        enablePanDownToClose
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "rgb(2 6 23)" : "rgb(255 255 255)",
        }}
      >
        <BottomSheetView className={cn("flex-1 px-6 pb-6", className)}>
          {!hideHeader ? (
            <View className="items-center pb-3 pt-1">
              <View className="h-1 w-10 rounded-full bg-muted" />
            </View>
          ) : null}
          {!hideHeader ? (
            <View className="mb-4 flex-row items-center">
              <View className="flex-1">
                {title ? (
                  <Text className="text-h2 font-semibold text-foreground">{title}</Text>
                ) : null}
              </View>
              <IconButton
                variant="ghost"
                icon={X}
                accessibilityLabel="Close"
                onPress={() => modalRef.current?.dismiss()}
              />
            </View>
          ) : null}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
Sheet.displayName = "Sheet";
