import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEntitlements } from "@/lib/revenuecat/entitlements";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

/**
 * Per-feature paywall preview. Looks up `paywall.gate.${feature}.{title|subtitle|cta}`
 * and falls back to the generic copy when a feature-specific key isn't
 * defined.
 *
 * The CTA pushes the modal paywall route with `trigger=feature` so PostHog
 * `paywall_viewed` lands the right value (already wired up in the paywall
 * screen; we just pass the param).
 *
 * Wrap features at the boundary, never inside the UI:
 *
 *   <PremiumGate feature="export_csv">
 *     <ExportButton />
 *   </PremiumGate>
 */

type PremiumGateProps = {
  feature: string;
  children: React.ReactNode;
};

/** Read a string at `paywall.gate.${feature}.${suffix}` falling back to generic. */
function gateKey(feature: string, suffix: "title" | "subtitle" | "cta"): string {
  const specific = t(`paywall.gate.${feature}.${suffix}`);
  // The i18n helper returns the key itself when missing — that's our signal
  // to fall back to the generic copy instead of leaking the key into the UI.
  if (specific !== `paywall.gate.${feature}.${suffix}`) return specific;
  return t(`paywall.gate.generic.${suffix}`);
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const router = useRouter();
  const isPremium = useEntitlements((s) => s.isPremium);

  if (isPremium) return <>{children}</>;

  const title = gateKey(feature, "title");
  const subtitle = gateKey(feature, "subtitle");
  const cta = gateKey(feature, "cta");

  return (
    <View
      accessibilityRole="summary"
      className="rounded-2xl border border-border bg-muted/40 p-5"
    >
      <Text className="mb-2 text-lg font-semibold text-foreground">{title}</Text>
      <Text className="mb-4 text-sm text-muted-foreground">{subtitle}</Text>
      <Button
        label={cta}
        onPress={() =>
          router.push({ pathname: "/paywall", params: { trigger: feature } })
        }
      />
    </View>
  );
}
