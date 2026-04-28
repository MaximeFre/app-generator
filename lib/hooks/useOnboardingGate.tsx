import { Redirect } from "expo-router";
import { usePreferences } from "@/lib/store/preferences";

/**
 * Onboarding gate.
 *
 * If `hasOnboarded === false`, returns a `<Redirect>` to the welcome screen.
 * Otherwise returns `null` — caller should render its normal tree.
 *
 * Wire this in `app/_layout.tsx` (owned by Agent B) like:
 *
 *   const gate = useOnboardingGate();
 *   if (gate) return gate;
 *
 * Kept as a hook (not a component) so the parent layout stays a single
 * declarative tree.
 */
export function useOnboardingGate(): React.ReactElement | null {
  const hasOnboarded = usePreferences((s) => s.hasOnboarded);
  if (!hasOnboarded) {
    // Cast: typed-routes generation runs after the onboarding screens land.
    return <Redirect href={"/onboarding/welcome" as never} />;
  }
  return null;
}
