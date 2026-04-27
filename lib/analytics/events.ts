/**
 * Strict event allowlist. Adding a new event REQUIRES an explicit budget review.
 * Do NOT track every click — PostHog free tier (1M events/mo) goes fast otherwise.
 *
 * Naming: snake_case, past-tense verb, noun.
 */
export const ANALYTICS_EVENTS = {
  app_opened: "app_opened",
  onboarding_completed: "onboarding_completed",
  paywall_viewed: "paywall_viewed",
  trial_started: "trial_started",
  subscription_started: "subscription_started",
  feature_used: "feature_used",
} as const;

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;

export type EventProps = {
  app_opened: { from_background: boolean };
  onboarding_completed: { steps: number; duration_ms: number };
  paywall_viewed: { offering_id: string; trigger: string };
  trial_started: { product_id: string };
  subscription_started: { product_id: string; price_usd: number };
  feature_used: { feature: string; context?: string };
};
