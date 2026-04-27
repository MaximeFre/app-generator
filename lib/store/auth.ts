import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { featureFlags } from "@/lib/env";

type AuthState = {
  session: Session | null;
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  init: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  sendMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: "idle",
  async init() {
    if (!featureFlags.cloudSyncEnabled) {
      set({ status: "anonymous" });
      return;
    }
    set({ status: "loading" });
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, status: data.session ? "authenticated" : "anonymous" });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, status: session ? "authenticated" : "anonymous" });
    });
  },
  async signInWithEmail(email, password) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  },
  async signUpWithEmail(email, password) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message };
  },
  async sendMagicLink(email) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error?.message };
  },
  async signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  },
}));
