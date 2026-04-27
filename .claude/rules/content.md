---
description: In-app copy, paywall messaging, error messages, onboarding tone.
paths: ["messages/**/*.json", "app/**/*.tsx", "components/**/*.tsx"]
---

# Content rules

## Tone

- Direct, friendly, low-stakes. Mobile users skim — short verbs, present tense.
- No jargon ("monetization", "engagement", "leverage"). Talk like a human telling a friend what the app does.
- No exclamation marks except on confirmation toasts.
- No em-dashes (`—`). Use parentheses or break the sentence.

## Length

- **Screen titles**: 1–3 words.
- **Section headers**: 2–5 words.
- **CTA buttons**: 1–3 words, action verb. Never "Click here", "Submit", "OK".
- **Error messages**: 1 sentence. State the problem AND the fix.
- **Paywall hero**: ≤ 8 words.
- **Paywall subtitle**: ≤ 14 words. List concrete benefits, not abstract ones.

## Paywall messaging

- ✅ "Cloud sync, multi-device, unlimited history"
- ❌ "Unlock the full power of the app"
- ✅ "Start free trial" / "Try 7 days free"
- ❌ "Continue" / "Get started"
- Always show price next to CTA on the paywall screen.
- Always show "cancel anytime" or equivalent for recurring billing (legal requirement on iOS).

## Errors

- ✅ "Invalid email or password."
- ❌ "Authentication failure 401."
- For network errors that retry automatically, don't show anything — just keep the previous state.

## i18n parity

- Every key in `messages/fr.json` MUST exist in `messages/en.json`. The hook will block writes that break parity.
- Don't translate word-for-word: adapt idioms. "Cancel anytime" in FR = "Annulable à tout moment", not "Annule à tout moment".

## App Store / Play Store copy

- Subtitle: ≤ 30 chars (iOS limit), no emoji unless brand-aligned.
- Description first paragraph: 3 lines max — that's all most users see.
- Keywords (iOS): 100 chars total, comma-separated, no spaces around commas.
