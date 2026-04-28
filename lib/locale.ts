import { getLocales } from "expo-localization";

/**
 * Defaults derived from the device locale. Used to seed the preferences store
 * on first launch. Returns sensible Western fallbacks if expo-localization
 * gives us nothing we recognize.
 */

type Locale = "fr" | "en";
type UnitsWeight = "kg" | "lb";
type UnitsDistance = "km" | "mi";
type WeekStart = 0 | 1; // 0 = Sunday, 1 = Monday

export type LocaleDefaults = {
  locale: Locale;
  unitsWeight: UnitsWeight;
  unitsDistance: UnitsDistance;
  currency: string;
  weekStartsOn: WeekStart;
};

// Imperial-units countries for body weight / distance.
const IMPERIAL_COUNTRIES = new Set(["US", "UK", "GB", "MM", "LR"]);

// Sunday-start countries (small set; everywhere else defaults to Monday).
const SUNDAY_START_COUNTRIES = new Set(["US", "CA", "JP", "MX", "PH", "BR"]);

// Country -> currency. Best-effort, falls back to USD.
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  UK: "GBP",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  CN: "CNY",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  MX: "MXN",
  BR: "BRL",
  IN: "INR",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  AE: "AED",
};

const EURO_COUNTRIES = new Set([
  "FR",
  "DE",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "IE",
  "AT",
  "FI",
  "GR",
  "LU",
  "SK",
  "SI",
  "EE",
  "LV",
  "LT",
  "MT",
  "CY",
  "HR",
]);

function pickCurrency(country: string | null, currencyFromLocale: string | null | undefined): string {
  if (currencyFromLocale && currencyFromLocale.length === 3) return currencyFromLocale.toUpperCase();
  if (country) {
    if (COUNTRY_CURRENCY[country]) return COUNTRY_CURRENCY[country];
    if (EURO_COUNTRIES.has(country)) return "EUR";
  }
  return "USD";
}

export function getLocaleDefaults(): LocaleDefaults {
  const first = getLocales()[0];
  const langCode = first?.languageCode?.toLowerCase() ?? "en";
  const region = (first?.regionCode ?? "").toUpperCase();
  const currencyCode = first?.currencyCode ?? null;

  const locale: Locale = langCode === "fr" ? "fr" : "en";

  const isImperial = IMPERIAL_COUNTRIES.has(region);
  const unitsWeight: UnitsWeight = isImperial ? "lb" : "kg";
  const unitsDistance: UnitsDistance = isImperial ? "mi" : "km";

  const weekStartsOn: WeekStart = SUNDAY_START_COUNTRIES.has(region) ? 0 : 1;

  const currency = pickCurrency(region || null, currencyCode);

  return { locale, unitsWeight, unitsDistance, currency, weekStartsOn };
}
