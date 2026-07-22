import { supabase } from "./supabase";
import type { Profile } from "@/types";

const PUBLIC_PROFILE_COLUMNS =
  "id, username, full_name, avatar_url, bio, role, is_verified, reward_points, lifetime_points, reward_tier, location, created_at, profile_flair";

export const profileService = {
  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, "full_name" | "username" | "bio" | "location" | "phone" | "hyperzod_customer_id">>
  ): Promise<Partial<Profile>> {
    // Column grants exclude PII, so RETURNING must stick to the public column
    // list - callers already have the values they just submitted locally.
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select(PUBLIC_PROFILE_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "halalme/avatars");
    form.append("public_id", `${userId}/avatar`);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Upload failed");
    }
    const { url, public_id } = await res.json() as { url: string; public_id: string };

    await supabase
      .from("profiles")
      .update({ avatar_url: url, avatar_public_id: public_id })
      .eq("id", userId);

    return url;
  },

  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (!data) return true;
    // Allow if it belongs to the current user (editing own profile)
    return currentUserId ? data.id === currentUserId : false;
  },

  async isPhoneAvailable(phone: string, currentUserId?: string): Promise<boolean> {
    // profiles.phone isn't in the public column grant, so this can't filter
    // directly on it from the browser - the RPC checks existence server-side
    // and only ever returns a boolean. See migration 067.
    const { data, error } = await supabase.rpc("is_phone_taken", {
      candidate_phone: phone,
      exclude_user_id: currentUserId ?? null,
    });
    if (error) throw new Error(error.message);
    return !data;
  },

  async getRewardTransactions(userId: string) {
    const { data, error } = await supabase
      .from("reward_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
};
