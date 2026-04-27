import { create } from "zustand";
import { getLocales } from "expo-localization";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

type Locale = "fr" | "en";
type Messages = typeof fr;

const dictionaries: Record<Locale, Messages> = { fr, en };

const detectLocale = (): Locale => {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === "fr" ? "fr" : "en";
};

type I18nState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useI18n = create<I18nState>((set) => ({
  locale: detectLocale(),
  setLocale: (locale) => set({ locale }),
}));

export function t(key: string, params?: Record<string, string | number>): string {
  const { locale } = useI18n.getState();
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionaries[locale]);

  if (typeof value !== "string") {
    if (__DEV__) console.warn(`[i18n] missing key: ${locale}.${key}`);
    return key;
  }
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
