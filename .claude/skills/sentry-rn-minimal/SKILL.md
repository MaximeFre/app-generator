---
description: Expert Sentry React Native config tuned for the 5k-errors/mo free tier. Sampling, ignored errors, breadcrumb hygiene, source maps via EAS, PII scrubbing. Use when configuring Sentry, debugging quota burn, missing source maps, or uploading release builds. Triggers `/sentry-rn-minimal`, "sentry", "crash reporting", "source maps", "release tracking".
---

# Sentry RN minimal — expert

## Goal

Catch real production crashes without burning the 5k errors/month free tier. Default to NOISE-OUT, not noise-in.

## Free tier quota (Sentry Developer plan)

- 5,000 errors/mo
- 10,000 performance events/mo
- 50 replays/mo (we disable)
- 1 GB attachments

A crash loop on launch = 5k errors in 30 minutes. The defaults below prevent that.

## The wired config (in `lib/sentry/client.ts`)

```ts
Sentry.init({
  dsn: env.sentryDsn,
  environment: env.appEnv,                    // dev/preview/production
  tracesSampleRate: env.appEnv === "production" ? 0.1 : 1.0,
  profilesSampleRate: env.appEnv === "production" ? 0.05 : 1.0,
  sampleRate: 1.0,                            // error sampling (separate from traces)
  enableAutoPerformanceTracing: true,
  attachScreenshot: false,                    // PII risk
  attachViewHierarchy: false,                 // PII risk
  beforeSend(event, hint) {
    const message = hint?.originalException?.message ?? event.message;
    if (IGNORED_PATTERNS.some(re => re.test(message))) return null;
    return event;
  },
  beforeBreadcrumb(crumb) {
    if (crumb.category === "console" && crumb.level !== "error") return null;
    return crumb;
  },
});
```

## Ignored error patterns

```ts
const IGNORED_ERROR_PATTERNS = [
  /Network request failed/i,    // user lost wifi — not actionable
  /AbortError/i,                // we cancelled a fetch — expected
  /cancelled/i,                 // user dismissed something — expected
  /Possible Unhandled Promise Rejection.*Network/i,  // RN noise
];
```

Add your own as you see real noise in the Sentry dashboard. Each pattern saves quota.

## Sampling math

- `sampleRate: 1.0` keeps 100% of errors (you want all of them).
- `tracesSampleRate: 0.1` keeps 10% of performance traces (10x quota saving).
- For 100 active users with ~5 sessions each: 500 traces/day at 10% = 50/day = 1500/month. Comfortably under 10k.

If a single user has a flaky network and triggers 100 traces in a session: 0.1 sampling = 10 events. Manageable.

## Source maps

For symbolicated stack traces in production:

1. Set `SENTRY_AUTH_TOKEN` (server-only, NOT `EXPO_PUBLIC_*`).
2. EAS env: `eas env:create --scope project --visibility encrypted --name SENTRY_AUTH_TOKEN --value sntrys_xxx`.
3. The `@sentry/react-native/expo` plugin (in `app.json` plugins) auto-uploads source maps on EAS build.
4. Confirm: in Sentry → Releases → see your version with "Artifacts: ✓".

Without source maps, all stack traces look like minified `bundle.js:1:12345` — useless.

## PII scrubbing

```ts
beforeSend(event, hint) {
  // ... ignore patterns ...

  // scrub PII fields from request data
  if (event.request?.data) {
    const sensitive = ["password", "token", "email", "phone"];
    for (const key of Object.keys(event.request.data)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        event.request.data[key] = "[scrubbed]";
      }
    }
  }
  return event;
}
```

For breadcrumbs, the default `beforeBreadcrumb` already strips non-error console logs. Add scrubbing for fetch URLs that contain query-string secrets.

## What to track manually

Use `reportError(err, { tag: "..." })` for caught errors that aren't crashes:

```ts
try {
  await syncItems(userId);
} catch (e) {
  reportError(e, { tag: "sync_items", userId });
}
```

This adds context the auto-instrumentation misses.

## What NOT to track

- Login failures with wrong password (user error, not a bug).
- 404 from API endpoints you control (use logs instead).
- ImagePicker cancellations.
- Form validation errors.
- Anything fired in a tight loop.

## User identification

In `lib/store/auth.ts`, when session changes:

```ts
import { setUserContext } from "@/lib/sentry/client";

supabase.auth.onAuthStateChange((_, session) => {
  setUserContext(session?.user ? { id: session.user.id, email: session.user.email } : null);
});
```

This lets you filter Sentry issues by user when debugging.

## Quota burn alarms

Set up in Sentry dashboard:
- Settings → Spike Protection → enable.
- Alerts → Issue alert → "If a single issue fires more than 100 times in 1 hour" → email yourself.

The first alarm probably wins your day.

## Anti-patterns

- ❌ `tracesSampleRate: 1.0` in production — 10x quota burn.
- ❌ Calling `Sentry.captureException(e)` in `catch` blocks without filtering — leaks.
- ❌ Logging full Supabase responses (often contain user data).
- ❌ Ignoring `beforeSend` "drop reasons" in dashboard — they're a free debugging tool.

## When you need to upgrade

Symptoms: spike protection auto-pauses ingest, or you hit 80% by mid-month.

- First check: is it the same issue spamming? Resolve, ignore, or fix.
- Then: tune `IGNORED_ERROR_PATTERNS` for the new noise.
- Only after: consider $26/mo Team plan (50k errors).
