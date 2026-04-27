import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEntitlements } from "@/lib/revenuecat/entitlements";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

type PremiumGateProps = {
  feature: string;
  children: React.ReactNode;
};

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const router = useRouter();
  const isPremium = useEntitlements((s) => s.isPremium);

  if (isPremium) return <>{children}</>;

  return (
    <View className="rounded-2xl border border-border bg-muted p-5">
      <Text className="mb-2 text-lg font-semibold text-foreground">{t("paywall.title")}</Text>
      <Text className="mb-4 text-sm text-muted-foreground">{t("paywall.subtitle")}</Text>
      <Button
        label={t("settings.upgrade")}
        onPress={() => router.push({ pathname: "/paywall", params: { trigger: feature } })}
      />
    </View>
  );
}
