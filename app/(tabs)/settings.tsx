import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store/auth";
import { useEntitlements } from "@/lib/revenuecat/entitlements";
import { restorePurchases } from "@/lib/revenuecat/client";
import { syncItems } from "@/lib/db/sync";
import { useI18n, t } from "@/lib/i18n";
import { featureFlags } from "@/lib/env";

export default function Settings() {
  const router = useRouter();
  const { user, status, signOut } = useAuth();
  const isPremium = useEntitlements((s) => s.isPremium);
  const { locale, setLocale } = useI18n();
  const [syncing, setSyncing] = useState(false);

  async function onSync() {
    if (!user) return;
    setSyncing(true);
    try {
      const result = await syncItems(user.id);
      Alert.alert(t("settings.syncNow"), t("settings.syncResult", result));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Screen scroll>
      <View className="flex-1 px-5 pt-4">
        <Text className="mb-6 text-2xl font-bold text-foreground">{t("settings.title")}</Text>

        <Section title={t("settings.subscription")}>
          <Text className="mb-3 text-base text-foreground">
            {isPremium ? t("settings.premium") : t("settings.free")}
          </Text>
          {!isPremium && featureFlags.paywallEnabled ? (
            <Button label={t("settings.upgrade")} onPress={() => router.push("/paywall")} />
          ) : null}
          {featureFlags.paywallEnabled ? (
            <View className="mt-2">
              <Button
                label={t("settings.restore")}
                variant="outline"
                onPress={() => restorePurchases()}
              />
            </View>
          ) : null}
        </Section>

        <Section title={t("settings.account")}>
          {status === "authenticated" ? (
            <>
              <Text className="mb-3 text-sm text-muted-foreground">{user?.email}</Text>
              {isPremium ? (
                <View className="mb-2">
                  <Button label={t("settings.syncNow")} loading={syncing} onPress={onSync} />
                </View>
              ) : null}
              <Button label={t("auth.signOut")} variant="outline" onPress={signOut} />
            </>
          ) : featureFlags.cloudSyncEnabled ? (
            <Button label={t("auth.signIn")} onPress={() => router.push("/auth/sign-in")} />
          ) : (
            <Text className="text-sm text-muted-foreground">
              Configure Supabase to enable cloud accounts.
            </Text>
          )}
        </Section>

        <Section title={t("settings.language")}>
          <View className="flex-row gap-2">
            <Button
              label="FR"
              variant={locale === "fr" ? "primary" : "outline"}
              onPress={() => setLocale("fr")}
            />
            <Button
              label="EN"
              variant={locale === "en" ? "primary" : "outline"}
              onPress={() => setLocale("en")}
            />
          </View>
        </Section>
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6 rounded-2xl border border-border bg-muted/40 p-4">
      <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}
