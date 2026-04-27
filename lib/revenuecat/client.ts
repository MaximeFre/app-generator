import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { env, featureFlags } from "@/lib/env";
import { useEntitlements, PREMIUM_ENTITLEMENT_ID } from "./entitlements";

let initialized = false;

export async function initRevenueCat(userId?: string): Promise<void> {
  if (initialized || !featureFlags.paywallEnabled) return;
  const apiKey = Platform.OS === "ios" ? env.rcIosKey : env.rcAndroidKey;
  if (!apiKey) return;
  Purchases.setLogLevel(env.appEnv === "production" ? LOG_LEVEL.WARN : LOG_LEVEL.INFO);
  Purchases.configure({ apiKey, appUserID: userId });
  initialized = true;
  Purchases.addCustomerInfoUpdateListener((info) => {
    const isPremium = Boolean(info.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
    useEntitlements.setState({ isPremium, lastChecked: Date.now() });
  });
  await refreshEntitlements();
}

export async function loginRevenueCat(userId: string): Promise<void> {
  if (!initialized) return;
  await Purchases.logIn(userId);
  await refreshEntitlements();
}

export async function logoutRevenueCat(): Promise<void> {
  if (!initialized) return;
  await Purchases.logOut();
  useEntitlements.setState({ isPremium: false, lastChecked: Date.now() });
}

export async function refreshEntitlements(): Promise<void> {
  if (!initialized) return;
  const info = await Purchases.getCustomerInfo();
  const isPremium = Boolean(info.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  useEntitlements.setState({ isPremium, lastChecked: Date.now() });
}

export async function restorePurchases(): Promise<{ restored: boolean }> {
  if (!initialized) return { restored: false };
  const info = await Purchases.restorePurchases();
  const isPremium = Boolean(info.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
  useEntitlements.setState({ isPremium, lastChecked: Date.now() });
  return { restored: isPremium };
}
