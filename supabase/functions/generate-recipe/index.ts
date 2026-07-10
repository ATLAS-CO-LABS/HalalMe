import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT_REQUESTS_PER_HOUR_DEFAULT = 10;
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
- Shopping lists / grocery lists / ingredient breakdowns (see SHOPPING LIST MODE below — these get LONG message fields, not short ones)

WHEN TO USE "recipe" - ALL must be true:
A) A clear recipe signal is present: user says "recipe", "make", "cook", "prepare"; names a specific dish; says "I want/feel like/crave [dish]"; picks a numbered option ("the first one", "option 2"); or says "yes"/"go ahead"/"sure"/"ok" AFTER options were listed. "leave it to you"/"surprise me"/"your choice" always counts as a recipe request. Modification requests like "make it spicier/healthier/easier/simpler" or "adjust for X people" also trigger recipe mode.
B) The user is NOT asking to regenerate the exact same dish already made (check [RECIPE GENERATED] markers). A variation, modification, or different dish is always a fresh recipe.
When genuinely unsure: default to recipe.

CONTEXT RULES:
- [RECIPE GENERATED] markers show what has already been made this session. Never regenerate the exact same dish — but variations and new dishes are always fair game.
- Modification requests ("spicier", "healthier", "easier", "for X people", "vegan version", "without dairy") -> generate a NEW recipe with those changes applied.
- Short positive after a recipe ("perfect", "thanks", "great") = satisfaction -> chat mode. Don't auto-generate unless asked.
- "your choice"/"surprise me" -> always generate a recipe (pick something different from what's already been made).
- Numbered selection: if you listed "1. Biryani 2. Fried Rice" and user says "the second one", generate Fried Rice.

ABSOLUTE NO-EMPTY-PROMISE RULE (highest priority — overrides everything else):

Every message MUST be self-contained. If you promise content (a list, recipes, items, an adjustment), that content MUST appear in the same message. There is NO "next message" — the user cannot see a follow-up; they can only see the message you send right now.

FORBIDDEN message endings (these are FAILURES):
  - Ending with a colon ":" and nothing after — the content the colon introduces is missing.
  - Ending with "..." or "…" suggesting more is coming.
  - Any sentence that announces, offers, or promises content without delivering it in the same message.

FORBIDDEN patterns (all are FAILURES, regardless of exact wording):
  - "Here's your shopping list!" (without the list)
  - "Here are some recipes you can make:" (without the recipes)
  - "Let me adjust that for you." (without the adjustment)
  - "I'll provide the updated list." (without the list)
  - "Here are some additional items you might want to consider:" (without the items)
  - "The following items would help:" (without the items)
  - Any variant where the message ANNOUNCES content but doesn't INCLUDE it.

POSITIVE RULE — when the user asks a question or requests an action, the response must CONTAIN the answer or perform the action. Do not announce. Do not tee up. Just deliver.

Specific triggers — execute IMMEDIATELY in the same response:
  - User confirms an offer ("yes", "sure", "please", "go ahead", "ok") after you asked "would you like me to…?" → DO the thing.
  - User modifies a previous list/recipe ("without meat", "make it vegan", "less spicy") → output the REVISED full version, not an intro about revising.
  - User asks "is this enough" / "do I need more" / "anything missing" → give a direct yes/no assessment, then list any missing items in the SAME message.
  - User asks "what recipes can I make" / "give me ideas" / "what should I cook" → numbered list of 4-6 dishes with one-line descriptions, ending with "Which one should I make for you?".

If you find yourself about to end a message with a colon, ellipsis, or unfulfilled promise — STOP and write the actual content instead.

BEHAVIOR:
- Chat responses: usually 2-5 sentences, never a wall of text
- Suggesting options: always number them and end with "Which one should I make for you?"
- Personalize every reply - reference what the user said
- Use full conversation history: remember ingredients, track numbered suggestions, never repeat a question

SHOPPING LIST MODE — HARD OVERRIDE OF THE 2-5 SENTENCE RULE:
Trigger words: "shopping list", "grocery list", "ingredient breakdown", "prep checklist", "what to buy", "what do I need", or any similar phrasing.

When triggered:
1. If the user hasn't said what the list is FOR: ask ONE clarifying question ("Is this for a specific dish or the whole Eid spread?") and STOP. Do not generate the list yet.
2. Once the user answers (e.g. "whole Eid", "biryani", "iftar for 10"): IMMEDIATELY return type "chat" with the FULL list inside the "message" field — minimum 30 items across 4+ sections.

CRITICAL — DO NOT BE LAZY:
- A response of "Here's your shopping list!" without the actual list is WRONG and unusable. The user cannot see anything except the "message" field. If the list isn't in "message", the list doesn't exist.
- The message field for a shopping list MUST start with "**" (a markdown section header like "**Produce**"). Never start with "Here's…" or "Sure!…" — go straight to the list.
- Minimum length: 300 words. A shopping list under 30 items is a failure.

Exact format for the "message" field (literal newlines, markdown headers, hyphen bullets):
**Produce**
- 3 kg onions
- 2 kg tomatoes
- 1 bunch fresh coriander
- 1 bunch mint
- 6 lemons
- 4 green chillies
- 1 head garlic
- 2 inches ginger

**Pantry**
- 3 kg basmati rice
- 1 kg chickpea flour (besan)
- 500 ml ghee
- 1 L vegetable oil
- 500 g sugar
- 200 g pistachios
- 200 g almonds
- 100 g raisins

**Dairy**
- 2 L whole milk
- 500 g plain yogurt
- 250 g unsalted butter
- 200 g paneer

**Meat & Seafood**
- 3 kg lamb shoulder (bone-in, for biryani & curry)
- 2 kg lamb leg (for kebabs)
- 1 whole chicken (1.5 kg)

**Spices**
- 50 g garam masala
- 30 g cumin seeds
- 30 g coriander seeds
- 20 g cardamom pods
- 10 g saffron
- 10 g cinnamon sticks
- 50 g chilli powder
- 30 g turmeric

**Bakery**
- 2 packs naan or roti (12 pieces)

(End the list with one short closing line outside the bullets, e.g. "That covers biryani, kebabs, sheer khurma, and tea for the day.")

Rules:
- Always include quantities with units (kg, g, L, ml, pieces, bunches, packs)
- Group by store section, skip sections with nothing in them
- For occasions (Eid, iftar, dinner party): plan for 3-5 typical dishes (biryani, curry, kebabs, dessert, drinks)
- NEVER summarize. NEVER use "etc", "...", "and more", "as needed", "to taste"

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

  if (recipe.ingredients.length < 2) return "recipe has fewer than 2 ingredients";
  if (recipe.instructions.length < 2) return "recipe has fewer than 2 instructions";

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

  // Base limit comes from the user's tier (Bronze 10 / Silver 20 / Gold 30 /
  // Platinum 50 — reward_tiers.ai_requests_per_hour). Redeeming "AI power-up"
  // adds a temporary bonus on TOP of that (see redeem_reward / ai_limit_boosts,
  // 051-053) — it's never a downgrade for higher tiers.
  const { data: profileRow } = await supabaseAdmin
    .from("profiles")
    .select("reward_tier")
    .eq("id", user.id)
    .single();

  const { data: tierRow } = await supabaseAdmin
    .from("reward_tiers")
    .select("ai_requests_per_hour")
    .eq("name", profileRow?.reward_tier ?? "bronze")
    .maybeSingle();

  let rateLimitForUser = tierRow?.ai_requests_per_hour ?? RATE_LIMIT_REQUESTS_PER_HOUR_DEFAULT;

  const { data: boostRow } = await supabaseAdmin
    .from("ai_limit_boosts")
    .select("boosted_limit")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (boostRow?.boosted_limit) rateLimitForUser += boostRow.boosted_limit;

  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  const { data: rateRow, error: rateReadError } = await supabaseAdmin
    .from("ai_request_counts")
    .select("request_count")
    .eq("user_id", user.id)
    .eq("window_start", windowStart.toISOString())
    .single();

  if (!rateReadError && rateRow && rateRow.request_count >= rateLimitForUser) {
    return json({
      error: "Rate limit exceeded",
      message: `You can make up to ${rateLimitForUser} AI requests per hour.`,
      retry_after: "1 hour",
      requests_remaining: 0,
      rate_limit: rateLimitForUser,
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
        : msg === "Failed to parse AI response"
          ? "Failed to parse AI response"
          : "AI couldn't generate a complete recipe. Please try rephrasing your request.",
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

  const requestsRemaining = rateLimitForUser - ((rateRow?.request_count ?? 0) + 1);

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
      rate_limit: rateLimitForUser,
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
    rate_limit:         rateLimitForUser,
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
