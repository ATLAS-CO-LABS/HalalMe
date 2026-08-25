import { supabase, supabasePublic, supabaseUrl, supabaseAnonKey } from "./supabase";
import { uploadWithProgress } from "@/lib/uploadWithProgress";
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
      | "parse_error"
      // The server's halal validator refused the recipe twice. Distinct from
      // "upstream" because the copy is already user-ready and retrying the same
      // prompt just spends another request on the same refusal.
      | "halal",
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

    // A user_id-filtered query is "My Recipes" and must show the caller's own
    // drafts (AI-generated recipes save unpublished — see
    // supabase/functions/generate-recipe). RLS already allows an owner to read
    // their own recipes regardless of is_published ("Users can read own
    // recipes", 003_kitchen.sql), but only for an authenticated request —
    // supabasePublic carries no session, so auth.uid() is null and that rule
    // never fires. A public browse (no user_id) stays on the public client and
    // stays filtered to published-only, exactly as before.
    const client = rest.user_id ? supabase : supabasePublic;

    let query = client
      .from("recipes")
      .select("*, profiles!user_id(username, avatar_url, is_verified)", { count: "exact" })
      .range(from, to)
      // Featured recipes float to the top, then newest first.
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (!rest.user_id) query = query.eq("is_published", true);

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
    // Authenticated client (not supabasePublic) — RLS allows anyone to read
    // published recipes, plus the owner to read their own unpublished/draft
    // recipes (e.g. right after AI generates one). supabasePublic has no
    // session, so auth.uid() is always null and the owner-read rule never
    // applies, breaking "view your own draft recipe".
    const { data, error } = await supabase
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

  /**
   * Deletes a recipe and its Cloudinary image.
   *
   * Routed through the server rather than deleting straight from the browser:
   * the image reference lives on the row being removed, so it has to be
   * captured before the delete, and recipe images have no owner in their
   * Cloudinary path to authorise cleanup afterwards. See api/recipes/[id].
   */
  async deleteRecipe(id: string): Promise<void> {
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: null }));
      throw new Error(error ?? "Recipe could not be deleted");
    }
  },

  async uploadRecipeImage(
    recipeId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "halalme/recipes");
    form.append("public_id", `${recipeId}/cover`);

    const { url, public_id } = await uploadWithProgress<{ url: string; public_id: string }>(
      "/api/upload",
      form,
      onProgress
    );

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
   * Send a message to the AI assistant and wait for the whole reply.
   * Returns either a conversational reply (type="chat") or a full recipe
   * (type="recipe") depending on what the user asked for.
   *
   * Named for what it does. It was `streamAIResponse` and took an `onChunk`
   * callback that it accepted and threw away — the response has never been
   * streamed, and the UI carried a whole streaming render path, complete with
   * a blinking cursor, that could not render because nothing ever fed it.
   * Both are gone. Real streaming is a separate piece of work with its own
   * contract, not a callback left lying in place pretending.
   *
   * Single attempt by design. Quota is reserved server-side before the OpenAI
   * call, so a client retry would spend a second unit of the user's allowance
   * for one action, and it used to compound with the edge function's own retry
   * so a single tap could bill up to four OpenAI calls. The server keeps the
   * one retry that is actually targeted: a recipe that failed validation.
   *
   * Throws AIRequestError with a `code` field for clean caller-side branching.
   */
  async sendAIMessage(
    message: string,
    history: Array<{ role: "user" | "assistant"; content: string; image?: string }> = [],
    signal?: AbortSignal,
    sessionId?: string | null,
    imageBase64?: string,
  ): Promise<AIAssistantResponse> {
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
        // Explicitly false: generating a recipe in chat is not the same act as
        // adding it to your collection. Saving happens when the user presses
        // Save, via saveAIRecipe below.
        body: JSON.stringify({ message, history, save_to_recipes: false, session_id: sessionId ?? null, image: imageBase64 ?? null }),
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
      let payload: { error?: string; message?: string; reason?: string } = {};
      try { payload = await response.json(); } catch {}

      const code: AIRequestError["code"] =
        response.status === 401 ? "auth"
        : response.status === 429 ? "rate_limit"
        : response.status === 400 ? "invalid_request"
        : payload.reason === "halal" ? "halal"
        : "upstream";
      // Prefer `message` (server's dynamic, human text — e.g. which allowance
      // was actually hit) over `error` (a short machine-facing label).
      throw new AIRequestError(String(payload.message ?? payload.error ?? `Request failed: ${response.status}`), code);
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
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Save a recipe AQI generated in chat into the user's collection.
   *
   * The edge function no longer writes these rows itself. It saved every
   * generated recipe automatically, so a user who asked four follow-up
   * questions ended up with four near-identical drafts they never asked to
   * keep, and the Save button was reduced to a link to something already
   * saved. The generation and the keeping are separate decisions now.
   *
   * Unpublished on purpose: this is the user's own draft, not something the
   * Kitchen browse should surface.
   */
  async saveAIRecipe(
    recipe: NonNullable<AIAssistantResponse["recipe"]>,
    userId: string,
  ): Promise<Recipe> {
    // Reopening a past conversation from the sidebar rebuilds the messages from
    // ai_chat_sessions, which never stored the saved recipe's id — so the button
    // reads "Save Recipe" again on a recipe already in the collection. Returning
    // the existing row instead of inserting a second one keeps that harmless.
    const { data: existing } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .eq("title", recipe.title)
      .eq("is_ai_generated", true)
      .limit(1)
      .maybeSingle();
    if (existing) return existing;

    return this.createRecipe({
      title:             recipe.title,
      description:       recipe.description,
      cuisine:           recipe.cuisine,
      difficulty:        recipe.difficulty,
      prep_time_mins:    recipe.prep_time_mins,
      cook_time_mins:    recipe.cook_time_mins,
      servings:          recipe.servings,
      ingredients:       recipe.ingredients,
      instructions:      recipe.instructions,
      tags:              recipe.tags,
      nutrition:         recipe.nutrition,
      image_url:         null,
      image_public_id:   null,
      is_ai_generated:   true,
      is_halal_verified: false,
      is_published:      false,
    }, userId);
  },
};
