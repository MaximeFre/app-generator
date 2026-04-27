import { useEffect } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RevenueCatUI from "react-native-purchases-ui";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/posthog";
import { featureFlags } from "@/lib/env";
import { t } from "@/lib/i18n";

export default function Paywall() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trigger?: string }>();

  useEffect(() => {
    track("paywall_viewed", {
      offering_id: "default",
      trigger: params.trigger ?? "settings",
    });
  }, [params.trigger]);

  if (!featureFlags.paywallEnabled) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="mb-2 text-2xl font-bold text-foreground">{t("paywall.title")}</Text>
          <Text className="mb-6 text-center text-muted-foreground">
            Configure RevenueCat keys to display the paywall.
          </Text>
          <Button label="Close" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <RevenueCatUI.Paywall
      onPurchaseCompleted={() => {
        track("subscription_started", { product_id: "unknown", price_usd: 0 });
        router.back();
      }}
      onRestoreCompleted={() => router.back()}
      onDismiss={() => router.back()}
    />
  );
}
