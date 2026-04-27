---
description: Expert RevenueCat integration — entitlements, products, offerings, paywall UI (prebuilt or custom), trial logic, restore, store sandbox testing, sub lifecycle hooks. Use when configuring RC dashboard, designing paywall, debugging "no products available", or handling subscription state. Triggers `/revenuecat-paywall`, "revenuecat", "paywall", "subscription", "trial", "in-app purchase", "IAP".
---

# RevenueCat paywall — expert

## Mental model

- **Entitlement** = a permission slot (e.g. `premium`). The app asks "is this user's `premium` entitlement active?" — never asks "did they buy product X?".
- **Product** = an actual SKU on App Store / Play Store (`premium_monthly`, `premium_yearly`).
- **Offering** = a bundle of products presented together on a paywall (e.g., default offering: monthly + yearly).
- **Package** = a slot in an offering (`$rc_monthly`, `$rc_annual`, `$rc_lifetime` — RC's standard names).

This template uses **one entitlement (`premium`), one offering (`default`)**. Add more only when you have a tested hypothesis.

## Setup checklist (per app)

1. RevenueCat dashboard → New project, name = app slug.
2. Add iOS app: bundle id from `app.json` → `ios.bundleIdentifier`.
3. Add Android app: package from `app.json` → `android.package`.
4. App Store Connect → Subscriptions → create products with EXACT same IDs (`premium_monthly`, `premium_yearly`). Apple takes ~24h to validate.
5. Google Play Console → Monetize → Subscriptions → create products with same IDs.
6. RC → Entitlements → create `premium`. Attach all products that grant it.
7. RC → Offerings → create `default`. Add `$rc_monthly` (=`premium_monthly`) and `$rc_annual` (=`premium_yearly`).
8. RC → Project settings → API keys → copy iOS public key + Android public key into `.env`.
9. RC → Apps → upload App Store Connect API key (for receipt validation).
10. RC → Apps → upload Google Service Account JSON.

## Code integration (already wired in this template)

- `lib/revenuecat/client.ts` — `initRevenueCat()`, `loginRevenueCat(userId)`, `restorePurchases()`.
- `lib/revenuecat/entitlements.ts` — Zustand store with `isPremium`.
- `app/paywall.tsx` — uses `RevenueCatUI.Paywall` (prebuilt UI from RC dashboard).
- `components/paywall/PremiumGate.tsx` — wrap any premium feature.

## Login flow

```
User signs up via Supabase
   ↓
useAuth.onAuthStateChange fires
   ↓
loginRevenueCat(session.user.id)   // sets RC appUserID = supabase user id
   ↓
RC checks if this user has any active entitlement (across devices)
   ↓
If yes: useEntitlements.setState({ isPremium: true })
```

Anonymous users get an RC-generated appUserID. After login, RC `logIn(supabaseUserId)` migrates anonymous purchases to the real user.

## Showing the paywall

### Option A: RC's prebuilt paywall (recommended for v1)

Already wired:

```tsx
<RevenueCatUI.Paywall
  onPurchaseCompleted={() => router.back()}
  onRestoreCompleted={() => router.back()}
  onDismiss={() => router.back()}
/>
```

Configure visuals in RC dashboard → Paywalls. No code changes needed.

### Option B: Custom paywall

When the prebuilt doesn't fit your brand:

```tsx
import Purchases from "react-native-purchases";

const offering = await Purchases.getOfferings();
const annual = offering.current?.annual;
if (!annual) return null;

const onSubscribe = async () => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(annual);
    if (customerInfo.entitlements.active.premium) {
      track("subscription_started", { product_id: annual.product.identifier, price_usd: annual.product.price });
      router.back();
    }
  } catch (e: any) {
    if (!e.userCancelled) reportError(e, { tag: "purchase" });
  }
};

return (
  <View>
    <Text>{annual.product.priceString} / year</Text>
    <Button label={t("paywall.subscribe")} onPress={onSubscribe} />
  </View>
);
```

Always show `priceString` (RC localizes per region) — never hardcode "$29.99".

## Restore purchases

Required by App Store review. Already wired in `lib/revenuecat/client.ts`:

```ts
const { restored } = await restorePurchases();
```

Add a "Restore purchases" button on the paywall AND in settings.

## Trial logic

- Free trial = a "phase" of a subscription product, configured in App Store Connect / Play Console.
- RC handles the gating automatically. The first call to `purchasePackage(annual)` for a user starts the trial.
- Track `trial_started` event the moment `customerInfo.entitlements.active.premium.willRenew === true && customerInfo.entitlements.active.premium.periodType === "trial"`.

## Sandbox testing

### iOS
1. Create a Sandbox tester in App Store Connect → Users and Access.
2. On the device: Settings → App Store → Sandbox Account → sign in with the tester.
3. Purchase in dev build — won't charge. Subscriptions in sandbox auto-renew every few minutes for testing.

### Android
1. Build a closed-test track in Play Console.
2. Add tester emails to the test track.
3. Install via Play Store internal-testing link.
4. Purchases use Google's test payment methods.

## Webhook for cohort events

RC can webhook to a server when subscriptions change. For this template (no backend beyond Supabase), wire RC to Supabase Edge Functions if you need server-side logic (e.g., grant cloud quota). Otherwise the client `onCustomerInfoUpdate` listener is enough.

## Common errors

- **"There are no products available"** in dev build → product IDs don't match between RC dashboard and App Store / Play. Fix: paste the EXACT IDs in both.
- **"Apple Subscription failed: missing receipt"** → user not signed into Sandbox account. Re-sign in via Settings.
- **`isPremium` flickers off after restart** → `Purchases.configure()` not called before `getCustomerInfo()`. Ensure `initRevenueCat()` awaits in `app/_layout.tsx`.
- **Purchase succeeds but `isPremium` stays false** → entitlement not attached to product in RC dashboard.

## Pricing strategy

- $4.99/mo, $29.99/yr is a safe consumer default. 50%-off-yearly framing converts.
- Lifetime ($79.99) only if your app is utility-shaped (one-time use cases). Otherwise it cannibalizes recurring.
- Don't change prices for existing subscribers — Apple/Google handle grandfathering, but new prices apply only to new purchases. Document this in `.planning/paywall.md` so you don't surprise yourself later.

## Forbidden patterns

- ❌ Hardcoding `priceString` — use RC's localized value.
- ❌ Multiple offerings without an A/B test plan.
- ❌ Trial without yearly anchor (most trials don't convert if priced too low).
- ❌ Showing the paywall on first launch — uninstall trigger.
- ❌ Different bundles per platform without good reason.

## Cost note

RC free tier: up to **$2,500 of MTR (monthly tracked revenue)**. Above that, 1% fee. No fixed cost. As long as you make < $2.5k/mo, RC costs you $0.
