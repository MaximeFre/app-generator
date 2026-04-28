import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { usePreferences } from "@/lib/store/preferences";
import { useI18n, t } from "@/lib/i18n";

/**
 * Asks for the user's name and lets them confirm/override the auto-detected
 * locale. Both fields are skippable — defaults from device locale already
 * cover the common case.
 */
export default function OnboardingProfile() {
  const router = useRouter();
  const setPreferences = usePreferences((s) => s.setPreferences);
  const initialName = usePreferences((s) => s.name);
  const initialLocale = usePreferences((s) => s.locale);
  const setI18nLocale = useI18n((s) => s.setLocale);

  const [name, setName] = useState(initialName ?? "");
  const [locale, setLocale] = useState<"fr" | "en">(initialLocale);

  const goNext = () => {
    setPreferences({ name: name.trim() || null, locale });
    setI18nLocale(locale);
    router.push("/onboarding/preferences" as never);
  };

  return (
    <Screen scroll>
      <View className="flex-1 justify-between px-5 py-8">
        <View>
          <Text className="mb-2 text-h1 font-bold text-foreground">
            {t("onboarding.profile.title")}
          </Text>
          <Text className="mb-6 text-body text-muted-foreground">
            {t("onboarding.profile.body")}
          </Text>

          <View className="mb-6">
            <Input
              label={t("onboarding.profile.nameLabel")}
              value={name}
              onChangeText={setName}
              placeholder={t("onboarding.profile.namePlaceholder")}
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              maxLength={48}
            />
          </View>

          <View className="mb-2">
            <Text className="mb-1 text-caption uppercase tracking-wide text-muted-foreground">
              {t("settings.language")}
            </Text>
            <Segmented
              options={[
                { value: "fr", label: "FR" },
                { value: "en", label: "EN" },
              ]}
              value={locale}
              onChange={(v) => setLocale(v as "fr" | "en")}
            />
          </View>
        </View>

        <View>
          <Button
            label={t("onboarding.profile.cta")}
            rightIcon={ArrowRight}
            size="lg"
            onPress={goNext}
          />
          <Pressable
            accessibilityRole="button"
            onPress={goNext}
            className="mt-3 self-center px-3 py-2"
          >
            <Text className="text-body-sm text-muted-foreground">
              {t("onboarding.profile.skip")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
