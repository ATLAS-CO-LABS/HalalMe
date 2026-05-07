import { supabase } from "./supabase";
import type { Charity, Donation, RewardTransaction } from "@/types/app";

export const rewardsService = {
  // ---------------------------------------------------------------------------
  // Charities
  // ---------------------------------------------------------------------------
  async getCharities(filters?: { category?: string; featured?: boolean }): Promise<Charity[]> {
    let query = supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });

    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.featured) query = query.eq("is_featured", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getCharityById(id: string): Promise<Charity> {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getCharityBySlug(slug: string): Promise<Charity> {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("charities")
      .select("category")
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    return [...new Set((data ?? []).map((c) => c.category))].sort();
  },

  // ---------------------------------------------------------------------------
  // Donations
  // ---------------------------------------------------------------------------
  async createDonation(
    userId: string,
    charityId: string,
    amount: number,
    options?: { message?: string; is_anonymous?: boolean; currency?: string }
  ): Promise<Donation> {
    const { data, error } = await supabase
      .from("donations")
      .insert({
        user_id: userId,
        charity_id: charityId,
        amount,
        currency: options?.currency ?? "GBP",
        message: options?.message ?? null,
        is_anonymous: options?.is_anonymous ?? false,
        status: "pending",
      })
      .select("*, charities(name, slug, image_url)")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Called by payment webhook (via service role) — not directly by client
  async completeDonation(donationId: string, paymentRef: string): Promise<void> {
    const { error } = await supabase
      .from("donations")
      .update({ status: "completed", payment_ref: paymentRef })
      .eq("id", donationId);
    if (error) throw new Error(error.message);
    // The handle_donation_completed trigger fires automatically here
  },

  async getUserDonations(userId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from("donations")
      .select("*, charities(name, slug, image_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // ---------------------------------------------------------------------------
  // Reward points
  // ---------------------------------------------------------------------------
  async getRewardHistory(userId: string): Promise<RewardTransaction[]> {
    const { data, error } = await supabase
      .from("reward_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getTotalDonated(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from("donations")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "completed");
    if (error) throw new Error(error.message);
    return (data ?? []).reduce((sum, d) => sum + d.amount, 0);
  },
};
