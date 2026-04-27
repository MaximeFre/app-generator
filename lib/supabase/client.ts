import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, featureFlags } from "@/lib/env";

const expoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  if (!featureFlags.cloudSyncEnabled) {
    throw new Error("Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL/ANON_KEY to enable cloud sync.");
  }
  const { url, anonKey } = env.requireSupabase();
  cached = createClient(url, anonKey, {
    auth: {
      storage: expoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}
