import "@/global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import { initSentry } from "@/lib/sentry/client";
import { initAnalytics, track } from "@/lib/analytics/posthog";
import { initRevenueCat } from "@/lib/revenuecat/client";
import { ensureMigrations } from "@/lib/db/client";
import { useAuth } from "@/lib/store/auth";

initSentry();
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const init = useAuth((s) => s.init);

  useEffect(() => {
    (async () => {
      try {
        await ensureMigrations();
        await initAnalytics();
        await initRevenueCat();
        await init();
        track("app_opened", { from_background: false });
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [init]);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
