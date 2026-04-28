import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

/**
 * First onboarding screen. Sets the tone — short, confident, no jargon.
 * Centered vertically so the brand has room to breathe.
 */
export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <Screen>
      <View className="flex-1 justify-between px-5 py-8">
        <View className="flex-1 justify-center">
          <Text className="mb-3 text-display font-bold text-foreground">
            {t("onboarding.welcome.title")}
          </Text>
          <Text className="text-body text-muted-foreground">
            {t("onboarding.welcome.body")}
          </Text>
        </View>
        <Button
          label={t("onboarding.welcome.cta")}
          rightIcon={ArrowRight}
          size="lg"
          onPress={() => router.push("/onboarding/profile" as never)}
        />
      </View>
    </Screen>
  );
}
