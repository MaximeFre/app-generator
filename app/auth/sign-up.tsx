import { useState } from "react";
import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/store/auth";
import { t } from "@/lib/i18n";
import { track } from "@/lib/analytics/posthog";

export default function SignUp() {
  const router = useRouter();
  const signUp = useAuth((s) => s.signUpWithEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(undefined);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    track("onboarding_completed", { steps: 1, duration_ms: 0 });
    router.replace("/(tabs)");
  }

  return (
    <Screen scroll>
      <View className="flex-1 justify-center px-5">
        <Text className="mb-8 text-3xl font-bold text-foreground">{t("auth.signUp")}</Text>
        <View className="mb-3">
          <Input
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View className="mb-2">
          <Input
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {error ? <Text className="mb-2 text-sm text-destructive">{error}</Text> : null}
        <Button label={t("auth.signUp")} loading={loading} onPress={onSubmit} />
        <Link href="/auth/sign-in" className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")} {t("auth.signIn")}
        </Link>
      </View>
    </Screen>
  );
}
