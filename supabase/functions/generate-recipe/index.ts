import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_REQUESTS_PER_HOUR = 10;
const OPENAI_TIMEOUT_MS = 25000;
const FUNCTION_TIMEOUT_MS = 30000;
const MAX_HISTORY_ITEMS = 10;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `You are KitchenAI - a halal cooking assistant for HalalMe. Be warm and conversational, like a knowledgeable chef friend.

HALAL RULE (non-negotiable): Every recipe must be 100% halal. Never include pork, alcohol (wine, beer, spirits, mirin, cooking wine, vanilla extract with alcohol), lard, non-halal gelatin, or blood. Substitute freely (halal beef bacon, grape juice for wine, halal-certified stocks).

RESPONSE FORMAT - always return valid JSON:
{"type":"chat"|"recipe","message":string,"recipe":null|{...}}

WHEN TO USE "chat" (recipe=null):
- Greetings, small talk, off-topic
- Vague requests needing clarification - ask ONE focused question, don't guess
- User lists ingredients without asking for a recipe - suggest 2-3 numbered options and ask which to make
- Cooking technique or substitution questions

WHEN TO USE "recipe" - ALL must be true:
A) A clear recipe signal is present: user says "recipe", "make", "cook", "prepare"; names a specific dish; says "I want/feel like/crave [dish]"; picks a numbered option ("the first one", "option 2"); or says "yes"/"go ahead"/"sure"/"ok" AFTER options were listed but BEFORE any recipe was generated. "leave it to you"/"surprise me"/"your choice" also counts if no recipe exists yet.
B) A recipe for the same dish has NOT already been generated this conversation.
When genuinely unsure and no recipe exists yet: default to recipe.

CONTEXT RULES:
- Recipe already generated -> never regenerate it. Acknowledge and ask what's next.
- Short positive after a recipe ("perfect", "thanks", "great") = satisfaction -> chat mode.
- "your choice"/"surprise me" AFTER a recipe already exists -> chat mode (they're satisfied, not requesting a new one).
- Numbered selection: if you listed "1. Biryani 2. Fried Rice" and user says "the second one", generate Fried Rice.
- Assistant history may include a marker like "[RECIPE GENERATED]" followed by a title. Treat that as proof a full recipe was already given.

BEHAVIOR:
- Chat responses: 2-5 sentences, never a wall of text
- Suggesting options: always number them and end with "Which one should I make for you?"
- Personalize every reply - reference what the user said
- Use full conversation history: remember ingredients, track numbered suggestions, never repeat a question

CRITICAL RULES:
- NEVER summarize recipes.
- NEVER use phrases like: "and more", "...", "remaining", "etc"
- ALWAYS include FULL ingredients list.
- ALWAYS include ALL steps.
- Do NOT shorten responses under any condition.
- The recipe JSON must always be COMPLETE and fully usable.

MESSAGE RULE:
- For recipe responses, "message" must be 1 short sentence only.
- Do NOT include ingredients or steps in "message".

RECIPE SCHEMA (only when type="recipe"):
{"title":string,"description":string,"cuisine":string,"difficulty":"easy"|"medium"|"hard","prep_time_mins":number,"cook_time_mins":number,"servings":number,"ingredients":[{"name":string,"amount":string,"unit":string}],"instructions":[{"step":number,"text":string}],"tags":string[],"nutrition":{"calories":number,"protein":number,"carbs":number,"fat":number}}`;

interface ValidatedRecipe {
  title: string;
  description: string;
  cuisine: string;
  difficulty: "easy" | "medium" | "hard";
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: { step: number; text: string }[];
  tags: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
}

interface AIEnvelope {
  type: "chat" | "recipe";
  message: string;
  recipe: Record<string, unknown> | null;
}

function validateRecipe(raw: Record<string, unknown>): ValidatedRecipe | string {
  if (typeof raw.title !== "string" || !raw.title.trim()) return "missing title";
  if (!Array.isArray(raw.ingredients) || raw.ingredients.length === 0) return "missing ingredients";
  if (!Array.isArray(raw.instructions) || raw.instructions.length === 0) return "missing instructions";

  const difficulty = raw.difficulty as string;
  const validDiffs = ["easy", "medium", "hard"];
  const nutrition = raw.nutrition as Record<string, unknown> | null;

  const recipe: ValidatedRecipe = {
    title: String(raw.title).trim(),
    description: typeof raw.description === "string" ? raw.description : "",
    cuisine: typeof raw.cuisine === "string" ? raw.cuisine : "International",
    difficulty: validDiffs.includes(difficulty) ? (difficulty as ValidatedRecipe["difficulty"]) : "medium",
    prep_time_mins: Number(raw.prep_time_mins) || 0,
    cook_time_mins: Number(raw.cook_time_mins) || 0,
    servings: Number(raw.servings) || 2,
    ingredients: (raw.ingredients as Record<string, unknown>[]).map((i) => ({
      name: String(i.name ?? ""),
      amount: String(i.amount ?? ""),
      unit: String(i.unit ?? ""),
    })),
    instructions: (raw.instructions as Record<string, unknown>[]).map((s, idx) => ({
      step: Number(s.step ?? idx + 1),
      text: String(s.text ?? ""),
    })),
    tags: Array.isArray(raw.tags) ? (raw.tags as unknown[]).map(String) : [],
    nutrition: {
      calories: Number(nutrition?.calories) || 0,
      protein: Number(nutrition?.protein) || 0,
      carbs: Number(nutrition?.carbs) || 0,
      fat: Number(nutrition?.fat) || 0,
    },
  };

  if (recipe.ingredients.length < 5) return "recipe has fewer than 5 ingredients";
  if (recipe.instructions.length < 5) return "recipe has fewer than 5 instructions";

  return recipe;
}

function parseEnvelope(raw: Record<string, unknown>): AIEnvelope {
  if (raw.type === "chat" || raw.type === "recipe") {
    return {
      type: raw.type as "chat" | "recipe",
      message: typeof raw.message === "string" ? raw.message : "",
      recipe: raw.recipe && typeof raw.recipe === "object"
        ? raw.recipe as Record<string, unknown>
        : null,
    };
  }

  if (raw.title && raw.ingredients && raw.instructions) {
    return {
      type: "recipe",
      message: `Here's your ${String(raw.title)}!`,
      recipe: raw,
    };
  }

  if (typeof raw.message === "string") {
    return { type: "chat", message: raw.message, recipe: null };
  }

  return {
    type: "chat",
    message: "Sorry, I had a little hiccup there. Could you rephrase what you're looking for?",
    recipe: null,
  };
}

async function fetchOpenAIEnvelope(
  openaiApiKey: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  signal: AbortSignal,
  retryPrompt?: string,
): Promise<AIEnvelope> {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage },
        ...(retryPrompt ? [{ role: "user", content: retryPrompt }] : []),
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
      max_tokens: 2000,
      stream: false,
    }),
    signal,
  });

  if (!openaiRes.ok) {
    const errorText = await openaiRes.text();
    console.error("OpenAI error:", openaiRes.status, errorText);
    throw new Error(
      openaiRes.status === 401
        ? "OpenAI API key is invalid."
        : openaiRes.status === 429
          ? "OpenAI rate limit exceeded. Please try again shortly."
          : "AI service unavailable. Please try again.",
    );
  }

  try {
    const payload = await openaiRes.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Failed to parse AI response");
    }

    return parseEnvelope(JSON.parse(content));
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

async function generateEnvelopeWithRetry(
  openaiApiKey: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  signal: AbortSignal,
): Promise<{ envelope: AIEnvelope; recipe: ValidatedRecipe | null }> {
  let lastRecipeError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const retryPrompt = attempt === 0
      ? undefined
      : "Generate full complete recipe with all steps and ingredients. Do not summarize anything.";

    const envelope = await fetchOpenAIEnvelope(openaiApiKey, history, userMessage, signal, retryPrompt);

    if (envelope.type !== "recipe") {
      return { envelope, recipe: null };
    }

    if (!envelope.recipe) {
      lastRecipeError = "recipe envelope missing recipe object";
      continue;
    }

    const validatedOrError = validateRecipe(envelope.recipe);
    if (typeof validatedOrError === "string") {
      lastRecipeError = validatedOrError;
      continue;
    }

    return { envelope, recipe: validatedOrError };
  }

  throw new Error(lastRecipeError ?? "AI returned an incomplete recipe. Please try again.");
}

async function handle(req: Request, signal: AbortSignal): Promise<Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return json({ error: "Server configuration error" }, 500);
  }
  if (!openaiApiKey) {
    return json({ error: "AI service is not configured" }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  console.log("[auth] validating jwt prefix:", jwt.slice(0, 20));
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !user) {
    console.error("[auth] getUser failed:", authError?.message ?? "no user");
    return json({ error: "Unauthorized" }, 401);
  }
  console.log("[auth] user ok:", user.id);
  if (signal.aborted) return json({ error: "Request cancelled" }, 499);

  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  const { data: rateRow, error: rateReadError } = await supabaseAdmin
    .from("ai_request_counts")
    .select("request_count")
    .eq("user_id", user.id)
    .eq("window_start", windowStart.toISOString())
    .single();

  if (!rateReadError && rateRow && rateRow.request_count >= RATE_LIMIT_REQUESTS_PER_HOUR) {
    return json({
      error: "Rate limit exceeded",
      message: `You can make up to ${RATE_LIMIT_REQUESTS_PER_HOUR} AI requests per hour.`,
      retry_after: "1 hour",
    }, 429);
  }
  if (signal.aborted) return json({ error: "Request cancelled" }, 499);

  let userMessage: string;
  let saveToRecipes: boolean;
  let sessionId: string | null;
  let history: { role: "user" | "assistant"; content: string }[];

  try {
    const body = await req.json();
    userMessage = String(body.message ?? "").trim();
    saveToRecipes = body.save_to_recipes ?? true;
    sessionId = typeof body.session_id === "string" && body.session_id ? body.session_id : null;
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    history = rawHistory
      .filter((m: unknown) =>
        m !== null &&
        typeof m === "object" &&
        (
          (m as Record<string, unknown>).role === "user" ||
          (m as Record<string, unknown>).role === "assistant"
        ) &&
        typeof (m as Record<string, unknown>).content === "string"
      )
      .slice(-MAX_HISTORY_ITEMS)
      .map((m: Record<string, unknown>) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content),
      }));

    if (!userMessage) throw new Error("message must be a non-empty string");
  } catch (error) {
    return json({
      error: "Invalid request body",
      details: error instanceof Error ? error.message : String(error),
    }, 400);
  }

  const openaiController = new AbortController();
  const openaiTimeout = setTimeout(() => openaiController.abort(), OPENAI_TIMEOUT_MS);
  signal.addEventListener("abort", () => openaiController.abort(), { once: true });

  let envelope: AIEnvelope;
  let recipe: ValidatedRecipe | null;

  try {
    const result = await generateEnvelopeWithRetry(
      openaiApiKey,
      history,
      userMessage,
      openaiController.signal,
    );
    envelope = result.envelope;
    recipe = result.recipe;
  } catch (error) {
    clearTimeout(openaiTimeout);
    const msg = error instanceof Error ? error.message : String(error);
    const timedOut = msg.toLowerCase().includes("abort");
    console.error("OpenAI request failed:", msg);
    return json({
      error: timedOut
        ? "AI request timed out. Please try again."
        : msg === "Failed to parse AI response" ||
            msg.startsWith("missing ") ||
            msg.startsWith("recipe ")
          ? msg
          : "AI service unavailable. Please try again.",
    }, timedOut ? 504 : 503);
  } finally {
    clearTimeout(openaiTimeout);
  }

  try {
    await supabaseAdmin.from("ai_request_counts").upsert(
      {
        user_id: user.id,
        window_start: windowStart.toISOString(),
        request_count: (rateRow?.request_count ?? 0) + 1,
      },
      { onConflict: "user_id,window_start" },
    );
  } catch (e) {
    console.error("[rate-limit] upsert failed:", e);
  }

  const requestsRemaining = RATE_LIMIT_REQUESTS_PER_HOUR - ((rateRow?.request_count ?? 0) + 1);

  if (envelope.type === "chat" || !recipe) {
    const newMessages = [
      { role: "user",      content: userMessage,      timestamp: new Date().toISOString() },
      { role: "assistant", content: envelope.message, timestamp: new Date().toISOString() },
    ];
    let returnedSessionId = sessionId;
    try {
      if (sessionId) {
        // Append to existing session
        const { data: existing } = await supabaseUser
          .from("ai_chat_sessions").select("messages").eq("id", sessionId).single();
        const merged = [...(Array.isArray(existing?.messages) ? existing.messages : []), ...newMessages];
        await supabaseUser.from("ai_chat_sessions")
          .update({ messages: merged }).eq("id", sessionId);
      } else {
        // First message — create a new session
        const { data: created } = await supabaseUser.from("ai_chat_sessions")
          .insert({ user_id: user.id, ingredients: null, recipe_id: null, messages: newMessages })
          .select("id").single();
        returnedSessionId = created?.id ?? null;
      }
    } catch (e) {
      console.error("[session-log] failed:", e instanceof Error ? e.message : e);
    }

    return json({
      type: "chat",
      message: envelope.message,
      session_id: returnedSessionId,
      requests_remaining: requestsRemaining,
    });
  }

  let savedRecipeId: string | null = null;

  if (saveToRecipes) {
    try {
      const { data: savedRecipe, error: saveError } = await supabaseUser
        .from("recipes")
        .insert({
          user_id: user.id,
          title: recipe.title,
          description: recipe.description,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
          prep_time_mins: recipe.prep_time_mins,
          cook_time_mins: recipe.cook_time_mins,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags,
          nutrition: recipe.nutrition,
          is_ai_generated: true,
          is_published: false,
        })
        .select("id")
        .single();

      if (saveError) {
        console.error("[recipe-save] failed:", saveError.message);
      } else {
        savedRecipeId = savedRecipe.id;
      }
    } catch (e) {
      console.error("[recipe-save] threw:", e instanceof Error ? e.message : e);
    }
  }

  const newMessages = [
    { role: "user",      content: userMessage, timestamp: new Date().toISOString() },
    { role: "assistant", content: recipe,      timestamp: new Date().toISOString() },
  ];
  let returnedSessionId = sessionId;
  try {
    if (sessionId) {
      // Append to existing session and update recipe metadata
      const { data: existing } = await supabaseUser
        .from("ai_chat_sessions").select("messages").eq("id", sessionId).single();
      const merged = [...(Array.isArray(existing?.messages) ? existing.messages : []), ...newMessages];
      await supabaseUser.from("ai_chat_sessions")
        .update({
          messages:    merged,
          ingredients: recipe.ingredients.map((i) => i.name),
          recipe_id:   savedRecipeId,
        })
        .eq("id", sessionId);
    } else {
      // First message — create a new session
      const { data: created } = await supabaseUser.from("ai_chat_sessions")
        .insert({
          user_id:     user.id,
          ingredients: recipe.ingredients.map((i) => i.name),
          recipe_id:   savedRecipeId,
          messages:    newMessages,
        })
        .select("id").single();
      returnedSessionId = created?.id ?? null;
    }
  } catch (e) {
    console.error("[session-log] failed:", e instanceof Error ? e.message : e);
  }

  return json({
    type: "recipe",
    message: envelope.message || `Here's your ${recipe.title}!`,
    recipe,
    recipe_id:          savedRecipeId,
    is_saved:           savedRecipeId !== null,
    session_id:         returnedSessionId,
    requests_remaining: requestsRemaining,
  });
}

serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), FUNCTION_TIMEOUT_MS);

  const combined = new AbortController();
  const fireAbort = () => {
    if (!combined.signal.aborted) combined.abort();
  };
  timeoutController.signal.addEventListener("abort", fireAbort, { once: true });
  req.signal?.addEventListener("abort", fireAbort, { once: true });

  return handle(req, combined.signal)
    .catch(() => json({ error: "Request timed out. Please try again." }, 504))
    .finally(() => clearTimeout(timeoutId));
});
