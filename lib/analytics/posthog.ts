import PostHog from "posthog-react-native";
import { env, featureFlags } from "@/lib/env";
import { ANALYTICS_EVENTS, type AnalyticsEvent, type EventProps } from "./events";

let client: PostHog | null = null;

export async function initAnalytics(): Promise<void> {
  if (client || !featureFlags.analyticsEnabled || !env.posthogKey) return;
  client = new PostHog(env.posthogKey, {
    host: env.posthogHost,
    flushAt: 20,
    flushInterval: 30000,
    captureAppLifecycleEvents: false,
    enableSessionReplay: false,
  });
}

export function track<E extends AnalyticsEvent>(event: E, props: EventProps[E]): void {
  if (!client) return;
  client.capture(ANALYTICS_EVENTS[event], props as Record<string, unknown>);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!client) return;
  client.identify(userId, traits);
}

export function reset(): void {
  if (!client) return;
  client.reset();
}
