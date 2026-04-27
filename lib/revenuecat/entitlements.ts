import { create } from "zustand";

export const PREMIUM_ENTITLEMENT_ID = "premium";

type EntitlementsState = {
  isPremium: boolean;
  lastChecked: number;
};

export const useEntitlements = create<EntitlementsState>(() => ({
  isPremium: false,
  lastChecked: 0,
}));
