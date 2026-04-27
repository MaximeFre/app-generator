import Constants from "expo-constants";

function read(key: string): string | undefined {
  const value = process.env[key];
  if (value && value.length > 0) return value;
  const fromExtra = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.[key];
  return typeof fromExtra === "string" ? fromExtra : undefined;
}

function readRequired(key: string): string {
  const value = read(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}. Did you copy .env.example to .env?`);
  }
  return value;
}

export const env = {
  appEnv: (read("APP_ENV") ?? "development") as "development" | "preview" | "production",
  supabaseUrl: read("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  rcIosKey: read("EXPO_PUBLIC_RC_IOS_API_KEY"),
  rcAndroidKey: read("EXPO_PUBLIC_RC_ANDROID_API_KEY"),
  posthogKey: read("EXPO_PUBLIC_POSTHOG_API_KEY"),
  posthogHost: read("EXPO_PUBLIC_POSTHOG_HOST") ?? "https://eu.i.posthog.com",
  sentryDsn: read("EXPO_PUBLIC_SENTRY_DSN"),
  requireSupabase(): { url: string; anonKey: string } {
    return { url: readRequired("EXPO_PUBLIC_SUPABASE_URL"), anonKey: readRequired("EXPO_PUBLIC_SUPABASE_ANON_KEY") };
  },
};

export const featureFlags = {
  cloudSyncEnabled: Boolean(read("EXPO_PUBLIC_SUPABASE_URL")),
  paywallEnabled: Boolean(read("EXPO_PUBLIC_RC_IOS_API_KEY") || read("EXPO_PUBLIC_RC_ANDROID_API_KEY")),
  analyticsEnabled: Boolean(read("EXPO_PUBLIC_POSTHOG_API_KEY")),
  crashReportingEnabled: Boolean(read("EXPO_PUBLIC_SENTRY_DSN")),
};
