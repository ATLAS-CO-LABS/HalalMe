import { supabase } from "./supabase";
import type {
  TravelSearch,
  PriceAlert,
  CityGuide,
  FlightSearchParams,
  HotelSearchParams,
  CarSearchParams,
  SearchType,
} from "@/types";

export const travelService = {
  // ---------------------------------------------------------------------------
  // City Guides
  // ---------------------------------------------------------------------------
  async getCityGuides(): Promise<CityGuide[]> {
    const { data, error } = await supabase
      .from("city_guides")
      .select("*")
      .eq("is_published", true)
      .order("halal_score", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getCityGuideBySlug(slug: string): Promise<CityGuide> {
    const { data, error } = await supabase
      .from("city_guides")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // ---------------------------------------------------------------------------
  // Searches (recent + saved)
  // ---------------------------------------------------------------------------
  async saveSearch(
    userId: string,
    searchType: SearchType,
    params: FlightSearchParams | HotelSearchParams | CarSearchParams,
    label?: string,
    isSaved = false
  ): Promise<TravelSearch> {
    const { data, error } = await supabase
      .from("travel_searches")
      .insert({
        user_id: userId,
        search_type: searchType,
        params,
        label: label ?? null,
        is_saved: isSaved,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getRecentSearches(userId: string, limit = 10): Promise<TravelSearch[]> {
    const { data, error } = await supabase
      .from("travel_searches")
      .select("*")
      .eq("user_id", userId)
      .eq("is_saved", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getSavedSearches(userId: string): Promise<TravelSearch[]> {
    const { data, error } = await supabase
      .from("travel_searches")
      .select("*")
      .eq("user_id", userId)
      .eq("is_saved", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async deleteSavedSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from("travel_searches")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // ---------------------------------------------------------------------------
  // Price Alerts
  // ---------------------------------------------------------------------------
  async createPriceAlert(
    userId: string,
    searchType: SearchType,
    params: FlightSearchParams | HotelSearchParams | CarSearchParams,
    targetPrice: number
  ): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        user_id: userId,
        search_type: searchType,
        params,
        target_price: targetPrice,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async deletePriceAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from("price_alerts")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },
};
