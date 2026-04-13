import { supabase } from "./supabase";
import type { Meal, Order, OrderItem, DeliveryAddress, CartItem } from "@/types";

export const freshService = {
  // ---------------------------------------------------------------------------
  // Meals
  // ---------------------------------------------------------------------------
  async getMeals(filters?: { category?: string; search?: string }): Promise<Meal[]> {
    let query = supabase
      .from("meals")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (filters?.category && filters.category !== "All") {
      query = query.eq("category", filters.category);
    }
    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getMealById(id: string): Promise<Meal> {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getPopularMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("is_available", true)
      .eq("is_popular", true)
      .limit(8);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getMealCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("meals")
      .select("category")
      .eq("is_available", true);
    if (error) throw new Error(error.message);
    const unique = [...new Set((data ?? []).map((m) => m.category))];
    return ["All", ...unique.sort()];
  },

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------
  async placeOrder(
    userId: string,
    cartItems: CartItem[],
    deliveryAddress: DeliveryAddress,
    notes?: string
  ): Promise<Order> {
    const items: OrderItem[] = cartItems.map((item) => ({
      meal_id: item.meal.id,
      meal_name: item.meal.name,
      quantity: item.quantity,
      unit_price: item.meal.price,
      image_url: item.meal.image_url,
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        notes: notes ?? null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};
