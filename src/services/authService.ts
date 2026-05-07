import { supabase, supabaseConfigured } from "./supabase";
import type { Profile } from "@/types";

async function hydrateProfileFromSession(): Promise<Profile | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) throw new Error(error.message);
  return data ? { ...data, email: session.user.email ?? "" } : null;
}

export function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("email rate limit exceeded")
  );
}

export const authService = {
  async login(email: string, password: string) {
    if (!supabaseConfigured)
      throw new Error("Supabase is not configured. Add credentials to .env.local");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signup(name: string, email: string, password: string) {
    if (!supabaseConfigured)
      throw new Error("Supabase is not configured. Add credentials to .env.local");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[auth] signOut:", err instanceof Error ? err.message : err);
    }
  },

  async refreshUser(): Promise<Profile | null> {
    return hydrateProfileFromSession();
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  // ── OTP: signup verification ──────────────────────────────────────────────

  // Verifies the 6-digit OTP received after signUp().
  // Supabase confirms the email and signs the user in.
  // Requires the "Confirm signup" email template to use {{ .Token }}.
  async verifySignupOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async resendSignupOtp(email: string) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw new Error(error.message);
  },

  // ── OTP: password reset ───────────────────────────────────────────────────

  // Sends a 6-digit OTP for password reset via signInWithOtp.
  // shouldCreateUser: false — rejects unknown emails.
  async sendPasswordResetOtp(email: string) {
    if (!supabaseConfigured)
      throw new Error("Supabase is not configured. Add credentials to .env.local");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(error.message);
  },

  // Verifies the password-reset OTP. On success the user is signed in,
  // allowing an immediate call to updatePassword().
  async verifyPasswordResetOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // ── Password update ───────────────────────────────────────────────────────

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

};
