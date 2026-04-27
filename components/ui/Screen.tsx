import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ReadonlyArray<Edge>;
  className?: string;
  contentClassName?: string;
};

export function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  className,
  contentClassName,
}: ScreenProps) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges} className={cn("flex-1 bg-background", className)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Container
          className={cn("flex-1", contentClassName)}
          contentContainerClassName={scroll ? "flex-grow px-5 py-4" : undefined}
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
