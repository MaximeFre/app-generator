import { Stack } from "expo-router";

/**
 * Onboarding stack. No back gesture — users complete the flow or hit "skip"
 * on a step (skip writes a sane default and advances). The "done" screen
 * sets `hasOnboarded = true` and replaces the stack with /(tabs).
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "slide_from_right",
      }}
    />
  );
}
