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
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);

    return data.publicUrl;
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
