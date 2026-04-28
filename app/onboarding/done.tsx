import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Check, ArrowRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { usePreferences } from "@/lib/store/preferences";
import { track } from "@/lib/analytics/posthog";
import { t } from "@/lib/i18n";
import * as haptics from "@/lib/haptics";

/**
 * Final onboarding screen. Sets `hasOnboarded = true` and replaces the
 * stack with the tabs — no back navigation.
 *
 * Fires the `onboarding_completed` PostHog event (allowlisted).
 */
export default function OnboardingDone() {
  const router = useRouter();
  const setPreferences = usePreferences((s) => s.setPreferences);

  const finish = () => {
    haptics.success();
    setPreferences({ hasOnboarded: true });
    track("onboarding_completed", { steps: 4, duration_ms: 0 });
    router.replace("/(tabs)" as never);
  };

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-5 py-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <View className="text-primary">
            <Check size={40} />
          </View>
        </View>
        <Text className="mb-2 text-h1 font-bold text-foreground">
          {t("onboarding.done.title")}
        </Text>
        <Text className="mb-10 text-center text-body text-muted-foreground">
          {t("onboarding.done.body")}
        </Text>
        <View className="w-full">
          <Button
            label={t("onboarding.done.cta")}
            rightIcon={ArrowRight}
            size="lg"
            onPress={finish}
          />
        </View>
      </View>
    </Screen>
  );
}
