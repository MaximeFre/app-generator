import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocaleDefaults } from "@/lib/locale";

/**
 * Working surface for user preferences. Persisted via AsyncStorage so it
 * survives reloads. The same shape is mirrored in the SQLite
 * `user_preferences` table (see lib/db/schema.ts) for cases that need a
 * DB-level join — the Zustand store is the source of truth at runtime.
 *
 * Free tier: nothing here ever syncs. Strictly local.
 */

export type Preferences = {
  hasOnboarded: boolean;
  name: string | null;
  locale: "fr" | "en";
  unitsWeight: "kg" | "lb";
  unitsDistance: "km" | "mi";
  themePreference: "system" | "light" | "dark";
  reminderTime: string | null; // "HH:mm" or null
  notificationConsent: boolean;
};

type PreferencesState = Preferences & {
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setPreferences: (patch: Partial<Preferences>) => void;
  resetOnboarding: () => void;
  reset: () => void;
};

function getInitialPreferences(): Preferences {
  const defaults = getLocaleDefaults();
  return {
    hasOnboarded: false,
    name: null,
    locale: defaults.locale,
    unitsWeight: defaults.unitsWeight,
    unitsDistance: defaults.unitsDistance,
    themePreference: "system",
    reminderTime: null,
    notificationConsent: false,
  };
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...getInitialPreferences(),
      setPreference: (key, value) => set({ [key]: value } as Pick<Preferences, typeof key>),
      setPreferences: (patch) => set(patch),
      resetOnboarding: () => set({ hasOnboarded: false }),
      reset: () => set(getInitialPreferences()),
    }),
    {
      name: "preferences/v1",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data fields, never the actions.
      partialize: (state): Preferences => ({
        hasOnboarded: state.hasOnboarded,
        name: state.name,
        locale: state.locale,
        unitsWeight: state.unitsWeight,
        unitsDistance: state.unitsDistance,
        themePreference: state.themePreference,
        reminderTime: state.reminderTime,
        notificationConsent: state.notificationConsent,
      }),
      version: 1,
    },
  ),
);
