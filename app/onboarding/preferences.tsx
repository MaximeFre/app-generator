import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Switch } from "@/components/forms/Switch";
import { DateField } from "@/components/forms/DateField";
import { usePreferences } from "@/lib/store/preferences";
import { isNotificationsAvailable } from "@/lib/notifications";
import { t } from "@/lib/i18n";

/**
 * Units, theme, optional reminder time, and (when expo-notifications is
 * installed) a notification opt-in. Skipping is fine — every field has a
 * sensible default already in the store.
 */
export default function OnboardingPreferences() {
  const router = useRouter();

  const initial = usePreferences.getState();
  const setPreferences = usePreferences((s) => s.setPreferences);

  const [unitsWeight, setUnitsWeight] = useState<"kg" | "lb">(initial.unitsWeight);
  const [unitsDistance, setUnitsDistance] = useState<"km" | "mi">(initial.unitsDistance);
  const [themePreference, setThemePreference] = useState<"system" | "light" | "dark">(
    initial.themePreference,
  );
  const [reminderTime, setReminderTime] = useState<string | null>(initial.reminderTime);
  const [notificationConsent, setNotificationConsent] = useState<boolean>(
    initial.notificationConsent,
  );

  const notificationsAvailable = isNotificationsAvailable();

  const goNext = () => {
    setPreferences({
      unitsWeight,
      unitsDistance,
      themePreference,
      reminderTime,
      notificationConsent,
    });
    router.push("/onboarding/done" as never);
  };

  return (
    <Screen scroll>
      <View className="flex-1 justify-between px-5 py-8">
        <View className="gap-6">
          <View>
            <Text className="text-h1 font-bold text-foreground">
              {t("onboarding.preferences.title")}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-caption uppercase tracking-wide text-muted-foreground">
              {t("onboarding.preferences.units.weight")}
            </Text>
            <Segmented
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
              value={unitsWeight}
              onChange={(v) => setUnitsWeight(v as "kg" | "lb")}
            />
          </View>

          <View>
            <Text className="mb-2 text-caption uppercase tracking-wide text-muted-foreground">
              {t("onboarding.preferences.units.distance")}
            </Text>
            <Segmented
              options={[
                { value: "km", label: "km" },
                { value: "mi", label: "mi" },
              ]}
              value={unitsDistance}
              onChange={(v) => setUnitsDistance(v as "km" | "mi")}
            />
          </View>

          <View>
            <Text className="mb-2 text-caption uppercase tracking-wide text-muted-foreground">
              {t("onboarding.preferences.theme")}
            </Text>
            <Segmented
              options={[
                { value: "system", label: t("settings.preferences.theme.system") },
                { value: "light", label: t("settings.preferences.theme.light") },
                { value: "dark", label: t("settings.preferences.theme.dark") },
              ]}
              value={themePreference}
              onChange={(v) => setThemePreference(v as "system" | "light" | "dark")}
            />
          </View>

          <DateField
            label={t("onboarding.preferences.reminder.label")}
            mode="time"
            value={reminderTime}
            onChange={setReminderTime}
            placeholder={t("onboarding.preferences.reminder.cta")}
          />

          {notificationsAvailable ? (
            <Switch
              label={t("onboarding.preferences.notifications.title")}
              helper={t("onboarding.preferences.notifications.body")}
              value={notificationConsent}
              onChange={setNotificationConsent}
            />
          ) : null}
        </View>

        <View className="mt-8">
          <Button
            label={t("onboarding.preferences.cta")}
            rightIcon={ArrowRight}
            size="lg"
            onPress={goNext}
          />
        </View>
      </View>
    </Screen>
  );
}
