// =============================================================================
// Application-level types — kept separate from the Supabase-generated index.ts
// so they survive a `supabase gen types` regeneration.
// Re-exported via src/types/index.ts — all existing `from "@/types"` imports work.
// =============================================================================

import type { Tables } from "@/types";

// ---------------------------------------------------------------------------
// Auth & Profiles
// ---------------------------------------------------------------------------
export type UserRole = "user" | "admin";
export type RewardTier = "bronze" | "silver" | "gold" | "platinum";

// Extends the DB row with `email` which lives in auth.users, not profiles table
export type Profile = Tables<"profiles"> & { email: string };

// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------
export type Difficulty = "easy" | "medium" | "hard";

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  step: number;
  text: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  instructions: RecipeStep[];
  ingredients: RecipeIngredient[];
  cuisine: string | null;
  difficulty: Difficulty | null;
  prep_time_mins: number | null;
  cook_time_mins: number | null;
  servings: number | null;
  image_url: string | null;
  is_ai_generated: boolean;
  is_published: boolean;
  is_halal_verified: boolean;
  tags: string[];
  nutrition: RecipeNutrition | null;
  view_count: number;
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Pick<Profile, "username" | "avatar_url" | "is_verified">;
}

export interface RecipeReview {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
}

export interface RecipeFavorite {
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string | Record<string, unknown>;
  timestamp: string;
}

export interface AIChatSession {
  id: string;
  user_id: string;
  messages: AIMessage[];
  ingredients: string[] | null;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
}

export type AIResponseType = "chat" | "recipe";

/**
 * Unified response from the generate-recipe edge function.
 * type="chat"   — conversational reply, no recipe data
 * type="recipe" — full recipe generated; recipe + save info present
 */
export interface AIAssistantResponse {
  type: AIResponseType;
  /** Human-readable text for both modes. For recipes this is a brief intro line. */
  message: string;
  recipe?: Omit<Recipe, "id" | "user_id" | "is_published" | "is_halal_verified" | "view_count" | "avg_rating" | "review_count" | "created_at" | "updated_at">;
  recipe_id?: string | null;
  is_saved?: boolean;
  session_id?: string | null;
  requests_remaining: number;
}

// ---------------------------------------------------------------------------
// Hub
// ---------------------------------------------------------------------------
export type PostType = "general" | "recipe" | "question" | "review";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  post_type: PostType;
  recipe_id: string | null;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "full_name" | "avatar_url" | "is_verified">;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export type NotificationType = "like_post" | "comment" | "reply" | "follow" | "like_comment";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Pick<Profile, "username" | "full_name" | "avatar_url">;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------
export type DonationStatus = "pending" | "completed" | "failed" | "refunded";
export type RewardAction =
  | "donation"
  | "recipe_upload"
  | "review"
  | "daily_login"
  | "referral"
  | "spent";

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category: string;
  image_url: string | null;
  goal_amount: number;
  raised_amount: number;
  donor_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  currency: string;
  payment_ref: string | null;
  status: DonationStatus;
  points_earned: number;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  charities?: Pick<Charity, "name" | "slug" | "image_url">;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  points: number;
  action: RewardAction;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Fresh
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export interface Meal {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  prep_time: string | null;
  servings: number | null;
  ingredients: string[];
  allergens: string[];
  is_popular: boolean;
  is_new: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
}

export interface OrderItem {
  meal_id: string;
  meal_name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postcode: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  delivery_address: DeliveryAddress;
  status: OrderStatus;
  payment_ref: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Travel
// ---------------------------------------------------------------------------
export type SearchType = "flight" | "hotel" | "car";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  depart_date: string;
  return_date?: string;
  passengers: number;
  cabin_class: "economy" | "premium_economy" | "business" | "first";
  trip_type: "roundtrip" | "oneway";
}

export interface HotelSearchParams {
  destination: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
}

export interface CarSearchParams {
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time?: string;
  dropoff_time?: string;
}

export interface TravelSearch {
  id: string;
  user_id: string;
  search_type: SearchType;
  params: FlightSearchParams | HotelSearchParams | CarSearchParams;
  label: string | null;
  is_saved: boolean;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  search_type: SearchType;
  params: FlightSearchParams | HotelSearchParams | CarSearchParams;
  target_price: number;
  current_price: number | null;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface HalalInfo {
  mosques_count: number;
  halal_restaurants_count: string;
  prayer_facilities_available: boolean;
  muslim_population_percent: number;
  tips: string[];
}

export interface CityGuide {
  id: string;
  slug: string;
  name: string;
  country: string;
  hero_image_url: string | null;
  description: string | null;
  halal_score: number | null;
  overview: string | null;
  best_time_to_visit: string | null;
  language: string | null;
  currency: string | null;
  timezone: string | null;
  halal_info: HalalInfo | null;
  attractions: Record<string, unknown>[] | null;
  mosques: Record<string, unknown>[] | null;
  halal_restaurants: Record<string, unknown>[] | null;
  travel_tips: string[];
  flight_price_from: number | null;
  hotel_price_from: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  image_url: string | null;
  author_id: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  read_time: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "full_name" | "avatar_url">;
}

// ---------------------------------------------------------------------------
// Hub — search
// ---------------------------------------------------------------------------
export interface UserSearchResult {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  bio: string | null;
}

// ---------------------------------------------------------------------------
// Shared / Utility
// ---------------------------------------------------------------------------
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ServiceError {
  message: string;
  code?: string;
}
