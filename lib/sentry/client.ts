import * as Sentry from "@sentry/react-native";
import { env, featureFlags } from "@/lib/env";

let initialized = false;

const IGNORED_ERROR_PATTERNS = [
  /Network request failed/i,
  /AbortError/i,
  /cancelled/i,
  /Possible Unhandled Promise Rejection.*Network/i,
];

export function initSentry(): void {
  if (initialized) return;
  if (!featureFlags.crashReportingEnabled || !env.sentryDsn) return;

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    tracesSampleRate: env.appEnv === "production" ? 0.1 : 1.0,
    sampleRate: 1.0,
    enableAutoPerformanceTracing: true,
    enableNative: true,
    attachScreenshot: false,
    attachViewHierarchy: false,
    beforeSend(event, hint) {
      const message = hint?.originalException instanceof Error ? hint.originalException.message : event.message;
      if (message && IGNORED_ERROR_PATTERNS.some((re) => re.test(message))) return null;
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === "console" && breadcrumb.level !== "error") return null;
      return breadcrumb;
    },
  });
  initialized = true;
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) {
    console.error("[error]", error, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) scope.setContext("extra", context);
    Sentry.captureException(error);
  });
}

export function setUserContext(user: { id: string; email?: string } | null): void {
  if (!initialized) return;
  Sentry.setUser(user ? { id: user.id, email: user.email } : null);
}
