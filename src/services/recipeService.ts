import { supabase, supabasePublic, supabaseUrl, supabaseAnonKey } from "./supabase";
import type {
  Recipe,
  RecipeReview,
  AIAssistantResponse,
  PaginatedResult,
} from "@/types";

// ---------------------------------------------------------------------------
// Typed error for AI requests — lets callers branch on `code` without
// parsing error message strings.
// ---------------------------------------------------------------------------
export class AIRequestError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "auth"
      | "rate_limit"
      | "timeout"
      | "upstream"
      | "cancelled"
      | "invalid_request"
      | "parse_error",
  ) {
    super(message);
    this.name = "AIRequestError";
  }
}

interface RecipeFilters {
  cuisine?: string;
  difficulty?: string;
  search?: string;
  is_ai_generated?: boolean;
  user_id?: string;
  page?: number;
  pageSize?: number;
}

export const recipeService = {
  async getRecipes(filters: RecipeFilters = {}): Promise<PaginatedResult<Recipe>> {
    const { page = 1, pageSize = 12, ...rest } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Always use public client — queries are filtered by is_published=true (public RLS covers it)
    let query = supabasePublic
      .from("recipes")
      .select("*, profiles!user_id(username, avatar_url, is_verified)", { count: "exact" })
      .eq("is_published", true)
      .range(from, to)
      // Featured recipes float to the top, then newest first.
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (rest.cuisine) query = query.eq("cuisine", rest.cuisine);
    if (rest.difficulty) query = query.eq("difficulty", rest.difficulty);
    if (rest.is_ai_generated !== undefined)
      query = query.eq("is_ai_generated", rest.is_ai_generated);
    if (rest.user_id) query = query.eq("user_id", rest.user_id);
    if (rest.search)
      query = query.textSearch("title", rest.search, { type: "websearch" });

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  async getRecipeById(id: string): Promise<Recipe> {
    const { data, error } = await supabasePublic
      .from("recipes")
      .select("*, profiles!user_id(username, avatar_url, is_verified)")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);

    // Increment view count (fire-and-forget)
    supabase
      .from("recipes")
      .update({ view_count: data.view_count + 1 })
      .eq("id", id)
      .then(() => {});

    return data;
  },

  async createRecipe(
    recipe: Omit<Recipe, "id" | "user_id" | "view_count" | "avg_rating" | "review_count" | "created_at" | "updated_at">,
    userId: string
  ): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...recipe, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateRecipe(
    id: string,
    updates: Partial<Recipe>
  ): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async uploadRecipeImage(recipeId: string, file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "halalme/recipes");
    form.append("public_id", `${recipeId}/cover`);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Upload failed");
    }
    const { url, public_id } = await res.json() as { url: string; public_id: string };

    await supabase
      .from("recipes")
      .update({ image_url: url, image_public_id: public_id })
      .eq("id", recipeId);

    return url;
  },

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  async getReviews(recipeId: string): Promise<RecipeReview[]> {
    const { data, error } = await supabasePublic
      .from("recipe_reviews")
      .select("*, profiles!user_id(username, avatar_url)")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async createReview(
    recipeId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<RecipeReview> {
    const { data, error } = await supabase
      .from("recipe_reviews")
      .insert({ recipe_id: recipeId, user_id: userId, rating, comment })
      .select("*, profiles!user_id(username, avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateReview(
    reviewId: string,
    rating: number,
    comment?: string
  ): Promise<RecipeReview> {
    const { data, error } = await supabase
      .from("recipe_reviews")
      .update({ rating, comment })
      .eq("id", reviewId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from("recipe_reviews")
      .delete()
      .eq("id", reviewId);
    if (error) throw new Error(error.message);
  },

  // ---------------------------------------------------------------------------
  // Favorites
  // ---------------------------------------------------------------------------
  async getFavorites(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipe_favorites")
      .select("recipe_id, recipes(*, profiles!user_id(username, avatar_url, is_verified))")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((f) => f.recipes as unknown as Recipe);
  },

  async addFavorite(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("recipe_favorites")
      .insert({ recipe_id: recipeId, user_id: userId });
    if (error && error.code !== "23505") throw new Error(error.message); // ignore duplicate
  },

  async removeFavorite(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("recipe_favorites")
      .delete()
      .eq("recipe_id", recipeId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async isFavorited(recipeId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("recipe_favorites")
      .select("recipe_id")
      .eq("recipe_id", recipeId)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  },

  // ---------------------------------------------------------------------------
  // AI Assistant
  // ---------------------------------------------------------------------------
  /**
   * Send a raw user message to the AI assistant.
   * Returns either a conversational reply (type="chat") or a full recipe
   * (type="recipe") depending on what the user asked for.
   */
  /**
   * Request an AI response as a complete JSON payload.
   * Retries once automatically for transient server errors (503/504).
   * Throws AIRequestError with a `code` field for clean caller-side branching.
   */
  async streamAIResponse(
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string }> = [],
    onChunk: (text: string) => void,
    signal?: AbortSignal,
    onRetry?: () => void,
    sessionId?: string | null,
  ): Promise<AIAssistantResponse> {
    for (let attempt = 0; attempt <= 1; attempt++) {
      if (signal?.aborted) throw new AIRequestError("Request cancelled.", "cancelled");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new AIRequestError("Your session has expired. Please sign in again.", "auth");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      signal?.addEventListener("abort", () => controller.abort(), { once: true });

      let response: Response;
      try {
        response = await fetch(`${supabaseUrl}/functions/v1/generate-recipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message, history, save_to_recipes: true, session_id: sessionId ?? null }),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === "AbortError") {
          throw new AIRequestError(
            signal?.aborted ? "Request cancelled." : "Request timed out. Please try again.",
            signal?.aborted ? "cancelled" : "timeout",
          );
        }
        throw err;
      }

      if (!response.ok) {
        clearTimeout(timeoutId);
        let payload: { error?: string } = {};
        try { payload = await response.json(); } catch {}

        // Retry once for transient server errors
        if ((response.status === 503 || response.status === 504) && attempt === 0 && !signal?.aborted) {
          onRetry?.();
          await new Promise<void>((r) => setTimeout(r, 1000));
          continue;
        }

        const code: AIRequestError["code"] =
          response.status === 401 ? "auth"
          : response.status === 429 ? "rate_limit"
          : response.status === 400 ? "invalid_request"
          : "upstream";
        throw new AIRequestError(String(payload.error ?? `Request failed: ${response.status}`), code);
      }

      try {
        const result = await response.json() as AIAssistantResponse & { error?: string };
        if (controller.signal.aborted) {
          throw new AIRequestError(
            signal?.aborted ? "Request cancelled." : "Request timed out. Please try again.",
            signal?.aborted ? "cancelled" : "timeout",
          );
        }
        if (result.error) {
          throw new AIRequestError(String(result.error), "upstream");
        }
        void onChunk; // chat streaming intentionally disabled for reliable recipe delivery
        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new AIRequestError("Service unavailable. Please try again.", "upstream");
  },
};
