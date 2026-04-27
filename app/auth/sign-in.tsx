import { useState } from "react";
import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/store/auth";
import { t } from "@/lib/i18n";

export default function SignIn() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signInWithEmail);
  const sendMagic = useAuth((s) => s.sendMagicLink);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(undefined);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(err);
    else router.replace("/(tabs)");
  }

  async function onMagic() {
    if (!email) return;
    setLoading(true);
    setError(undefined);
    const { error: err } = await sendMagic(email);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen scroll>
      <View className="flex-1 justify-center px-5">
        <Text className="mb-8 text-3xl font-bold text-foreground">{t("auth.signIn")}</Text>
        <View className="mb-3">
          <Input
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>
        <View className="mb-2">
          <Input
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>
        {error ? <Text className="mb-2 text-sm text-destructive">{error}</Text> : null}
        <Button label={t("auth.signIn")} loading={loading} onPress={onSubmit} />
        <View className="mt-3">
          <Button label={t("auth.magicLink")} variant="outline" loading={loading} onPress={onMagic} />
        </View>
        <Link href="/auth/sign-up" className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")} {t("auth.signUp")}
        </Link>
      </View>
    </Screen>
  );
}
