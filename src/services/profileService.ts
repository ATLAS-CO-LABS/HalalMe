import { supabase } from "./supabase";
import type { Profile } from "@/types";

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getProfileByUsername(username: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, "full_name" | "username" | "bio" | "location" | "phone" | "hyperzod_customer_id">>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
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
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (!data) return true;
    return currentUserId ? data.id === currentUserId : false;
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
