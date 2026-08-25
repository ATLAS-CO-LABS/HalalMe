import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildHalalRetryPrompt, findHalalViolations, type HalalViolation } from "./halal.ts";

const OPENAI_TIMEOUT_MS = 25000;
const FUNCTION_TIMEOUT_MS = 30000;
const MAX_HISTORY_ITEMS = 10;

// gpt-4o-mini is a generation behind and needed a lot of the prompt scaffolding
// below to behave. Same budget tier, current generation.
const MODEL = "gpt-5.6-luna";

// USD per 1M tokens, for the cost figures written to ai_usage_log. Update these
// together with MODEL or the spend ceiling silently measures the wrong thing.
const COST_PER_1M_INPUT = 0.20;
const COST_PER_1M_OUTPUT = 1.20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Rewritten for gpt-5.6-luna. The previous version was ~2050 tokens of
// scaffolding that gpt-4o-mini needed — the same instruction repeated three
// ways, a 45-line worked example of a shopping list, and a hard contradiction
// (chat replies "2-5 sentences, never a wall of text" versus shopping lists
// "minimum 300 words"). The contradiction is resolved by making length depend
// on what was asked rather than stating one global rule and then overriding it.
//
// The halal section is written to line up with the deny-list in halal.ts: it
// names the same substitutions the validator will accept, and tells the model
// to write "halal beef bacon" rather than "bacon", so first-attempt compliance
// is high and the retry rarely fires. Prompt and validator are one mechanism.
const SYSTEM_PROMPT = `You are KitchenAI - a halal cooking assistant for HalalMe. Be warm and conversational, like a knowledgeable chef friend.

HALAL RULE (non-negotiable). Every recipe must be 100% halal.
Never use: pork in any form (bacon, ham, gammon, pancetta, prosciutto, chorizo, salami, pepperoni, lard); alcohol in any form (wine, beer, cider, spirits, liqueurs, mirin, sake, shaoxing wine, alcohol-based vanilla extract); blood or blood sausage; gelatine or rennet of unstated origin; suet or tallow of unstated origin.
Substitute silently, never mention the substitution: halal beef or turkey bacon, grape or pomegranate juice for wine, apple juice with a splash of vinegar for cider, alcohol-free vanilla, halal beef or fish gelatine, microbial rennet, halal-certified stock.
Vinegars are fine and always allowed: red wine vinegar, cider vinegar, balsamic, malt vinegar.
When a word could go either way, write the halal form in full: "halal beef bacon", not "bacon"; "beef suet", not "suet".

VISION RULES (when analyzing food photos):
When the user shares a photo, identify what's visible and suggest dishes using those ingredients. If you see meat you cannot identify (it's too blurry, or the cut is unclear), ask which meat it is — never assume a halal slaughter. Always ask, never declare: "That looks like beef — is it halal-certified?" not "Here's a beef recipe."
If the photo is blurry or doesn't clearly show food, say so and ask the user to try again or describe it in text.
Never identify or serve recipes with pork, alcohol, or other haram ingredients based on a photo. If you can see haram content, refuse: "I can see pork in that photo — I can't build recipes using it."

RESPONSE FORMAT - always return valid JSON:
{"type":"chat"|"recipe","message":string,"recipe":null|{...}}

USE "recipe" WHEN the user names a dish, says recipe/make/cook/prepare, says "I want / feel like / craving X", picks an option you listed ("the second one", "option 2"), says yes/sure/ok/go ahead after you offered options, says "surprise me" / "your choice" / "leave it to you", or asks to change a dish (spicier, healthier, simpler, vegan, without dairy, for 6 people). A change is always a NEW recipe with the change applied.

USE "chat" (recipe=null) for greetings and small talk; technique and substitution questions; vague requests, where you ask ONE focused question rather than guessing; a bare list of ingredients, where you offer 2-3 numbered options and ask which to make; shopping and grocery lists; and a short thanks after a recipe ("perfect", "great") which is satisfaction, not a new request.

[RECIPE GENERATED] markers in the history show what has already been made. Never repeat an identical dish; variations and new dishes are always fine. If you listed "1. Biryani 2. Fried Rice" and the user says "the second one", make Fried Rice. Genuinely unsure: make the recipe.

THE "message" FIELD - deliver, never announce.
The user sees only this field, and there is no follow-up message. Anything you promise must be inside the same message.
Never end on a colon, an ellipsis, or an offer of content you have not written. "Here's your shopping list!" without the list is a failure, as is "Let me adjust that for you." without the adjustment. If you are about to introduce content, write the content instead.
If the user confirms an offer ("yes", "go ahead"), do the thing in that same reply. If the user asks "is this enough" or "anything missing", answer yes or no and then list what is missing.

LENGTH depends on what was asked - there is no single limit:
- Alongside a recipe: exactly one short sentence. Never put ingredients or steps here, they are in the recipe object.
- Ordinary chat: 2-5 sentences.
- A list the user asked for (shopping list, recipe ideas, what is missing): as long as it needs to be. Completeness beats brevity here.
Never abbreviate a list with "etc", "and more", "...", "as needed" or "to taste".

MARKDOWN: the only formatting that renders is **bold**, blank-line paragraph breaks, "- " bullets and "1. " numbering. Never use #/## headings, *italics*, backticks, links or tables - they show up as raw characters. A heading is written as a bold line: **Produce**, never ## Produce.

FORMATTING a chat reply that covers more than one distinct point (e.g. a question that touches food choices, calorie balance, AND exercise, AND when to be careful): break it into short paragraphs separated by a blank line, each opening with a bolded 2-4 word label, like:
**Protein sources:** rotate in halal fish, eggs, beans, lentils, lean beef, and yogurt alongside the chicken.

**Weight loss:** a sustainable calorie deficit matters more than eating once a day.
A genuinely single-topic reply (a greeting, a yes/no, one technique question, a short thanks) stays as plain prose with no label - do not invent parts that aren't there.

"What can I make" / "give me ideas" -> 4-6 numbered dishes, one line each, ending with "Which one should I make for you?"

SHOPPING AND GROCERY LISTS:
If you do not know what the list is for, ask one question ("Is this for one dish or the whole Eid spread?") and stop.
Once you know, put the entire list in "message", starting directly with a markdown section header - never with "Here's" or "Sure!". Group by store section, skip empty sections, give every item a quantity with a unit. For an occasion (Eid, iftar, dinner party) plan 3-5 dishes and expect 30+ items. Close with one short line outside the bullets. Format:
**Produce**
- 3 kg onions
- 1 bunch fresh coriander

**Pantry**
- 3 kg basmati rice
- 500 ml ghee

RECIPES must be complete and usable: the full ingredient list, every step, nothing summarised, nothing left out.
Schema (only when type="recipe"):
{"title":string,"description":string,"cuisine":string,"difficulty":"easy"|"medium"|"hard","prep_time_mins":number,"cook_time_mins":number,"servings":number,"ingredients":[{"name":string,"amount":string,"unit":string}],"instructions":[{"step":number,"text":string}],"tags":string[],"nutrition":{"calories":number,"protein":number,"carbs":number,"fat":number}|null}
nutrition is per serving and must be your genuine estimate. If you cannot estimate it, use null for the whole object. Never send zeros.

Personalise every reply: reference what the user actually said, remember ingredients they mentioned, and never ask the same question twice.`;

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
  /**
   * Null when the model gave no usable figures. It used to coerce every
   * missing value to 0 and ship "0 kcal, 0g protein" as though it were a
   * measurement — invented data presented with the same confidence as real
   * data, on a page people may make dietary decisions from.
   */
  nutrition: NutritionFacts | null;
}

interface NutritionFacts {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

interface AIEnvelope {
  type: "chat" | "recipe";
  message: string;
  recipe: Record<string, unknown> | null;
}

/** Billed tokens for one OpenAI call, accumulated across retries. */
interface TokenUsage {
  prompt: number;
  completion: number;
}

/**
 * A nutrition figure, or null. Zero is treated as absent on purpose: no real
 * dish has 0 calories, so a 0 here is the model declining to answer, and
 * passing that through as a number is what produced the fake "0 kcal" panels.
 */
function nutritionValue(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseNutrition(raw: unknown): NutritionFacts | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const facts: NutritionFacts = {
    calories: nutritionValue(src.calories),
    protein: nutritionValue(src.protein),
    carbs: nutritionValue(src.carbs),
    fat: nutritionValue(src.fat),
  };
  // Nothing usable in there at all — send null rather than an object of nulls,
  // so the UI has one thing to check instead of four.
  return Object.values(facts).some((v) => v !== null) ? facts : null;
}

function validateRecipe(raw: Record<string, unknown>): ValidatedRecipe | string {
  if (typeof raw.title !== "string" || !raw.title.trim()) return "missing title";
  if (!Array.isArray(raw.ingredients) || raw.ingredients.length === 0) return "missing ingredients";
  if (!Array.isArray(raw.instructions) || raw.instructions.length === 0) return "missing instructions";

  const difficulty = raw.difficulty as string;
  const validDiffs = ["easy", "medium", "hard"];

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
    nutrition: parseNutrition(raw.nutrition),
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
  imageBase64?: string,
): Promise<{ envelope: AIEnvelope; tokens: TokenUsage; imageTokens?: number }> {
  const userContent = imageBase64
    ? [
        { type: "text" as const, text: userMessage },
        { type: "image_url" as const, image_url: { url: imageBase64, detail: "high" as const } },
      ]
    : userMessage;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({
          role: m.role,
          content: m.role === "assistant" ? m.content : [{ type: "text", text: m.content }],
        })),
        { role: "user", content: userContent },
        ...(retryPrompt ? [{ role: "user", content: retryPrompt }] : []),
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
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

  let payload: Record<string, unknown>;
  try {
    payload = await openaiRes.json();
  } catch {
    throw new Error("Failed to parse AI response");
  }

  // Usage is captured even when the envelope turns out to be unparseable: the
  // tokens were billed either way, and a cost record with holes in it is worse
  // than useless for the spend ceiling that reads from it.
  const usage = (payload.usage ?? {}) as Record<string, number>;
  const tokens: TokenUsage = {
    prompt: Number(usage.prompt_tokens ?? 0),
    completion: Number(usage.completion_tokens ?? 0),
  };
  const imageTokens = Number(usage.prompt_tokens_details?.image_tokens ?? 0) || undefined;

  try {
    const choices = payload.choices as Array<{ message?: { content?: unknown } }> | undefined;
    const content = choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Failed to parse AI response");
    }
    return { envelope: parseEnvelope(JSON.parse(content)), tokens, imageTokens };
  } catch {
    const err = new Error("Failed to parse AI response") as Error & { tokens?: TokenUsage };
    err.tokens = tokens;
    throw err;
  }
}

/**
 * Records what a request actually cost.
 *
 * Two things depend on this existing: the global daily spend ceiling in
 * consume_ai_request reads sum(cost_usd) for the day, and without per-request
 * figures there is no way to answer which users cost most or whether a model
 * change helped. Never throws — a logging failure must not fail a request the
 * user has already been served.
 */
// deno-lint-ignore no-explicit-any
async function logUsage(db: any, userId: string, tokens: TokenUsage, hadImage: boolean, imageTokens?: number) {
  const cost =
    (tokens.prompt / 1_000_000) * COST_PER_1M_INPUT +
    (tokens.completion / 1_000_000) * COST_PER_1M_OUTPUT;

  const { error } = await db.from("ai_usage_log").insert({
    user_id: userId,
    model: MODEL,
    prompt_tokens: tokens.prompt,
    completion_tokens: tokens.completion,
    image_tokens: imageTokens ?? null,
    had_image: hadImage,
    cost_usd: Number(cost.toFixed(6)),
  });
  if (error) console.error("[usage-log] insert failed:", error.message);
}

async function generateEnvelopeWithRetry(
  openaiApiKey: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  signal: AbortSignal,
  imageBase64?: string,
): Promise<{ envelope: AIEnvelope; recipe: ValidatedRecipe | null; tokens: TokenUsage; imageTokens?: number }> {
  let lastRecipeError: string | null = null;
  let nextRetryPrompt: string | null = null;
  let lastViolations: HalalViolation[] = [];
  const total: TokenUsage = { prompt: 0, completion: 0 };
  let totalImageTokens = 0;

  const add = (t?: TokenUsage, imgT?: number) => {
    if (!t) return;
    total.prompt += t.prompt;
    total.completion += t.completion;
    if (imgT) totalImageTokens += imgT;
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    const retryPrompt = attempt === 0 ? undefined : (nextRetryPrompt ?? undefined);

    let envelope: AIEnvelope;
    try {
      const res = await fetchOpenAIEnvelope(openaiApiKey, history, userMessage, signal, retryPrompt, imageBase64);
      add(res.tokens, res.imageTokens);
      envelope = res.envelope;
    } catch (err) {
      add((err as { tokens?: TokenUsage }).tokens);
      (err as { tokens?: TokenUsage }).tokens = total;
      throw err;
    }

    if (envelope.type !== "recipe") {
      return { envelope, recipe: null, tokens: total, imageTokens: totalImageTokens || undefined };
    }

    const incomplete = "Generate full complete recipe with all steps and ingredients. Do not summarize anything.";

    if (!envelope.recipe) {
      lastRecipeError = "recipe envelope missing recipe object";
      nextRetryPrompt = incomplete;
      continue;
    }

    const validatedOrError = validateRecipe(envelope.recipe);
    if (typeof validatedOrError === "string") {
      lastRecipeError = validatedOrError;
      nextRetryPrompt = incomplete;
      continue;
    }

    // The halal promise, enforced rather than requested. This runs before the
    // recipe is returned or saved, so a violating recipe can never reach a user
    // or the recipes table — the prompt asks, this decides.
    const violations = findHalalViolations(validatedOrError);
    if (violations.length > 0) {
      lastViolations = violations;
      lastRecipeError = "halal violation";
      nextRetryPrompt = buildHalalRetryPrompt(violations);
      console.warn(
        "[halal] attempt", attempt + 1, "rejected:",
        violations.map((v) => `${v.rule}="${v.term}" (${v.where})`).join(", "),
      );
      continue;
    }

    return { envelope, recipe: validatedOrError, tokens: total, imageTokens: totalImageTokens || undefined };
  }

  // Both attempts failed. A halal failure is reported differently on purpose:
  // "try rephrasing" is misleading advice when the model has twice insisted on
  // an ingredient the platform will not serve, and quietly returning the
  // recipe anyway is the one outcome that is not acceptable.
  if (lastViolations.length > 0) {
    console.error(
      "[halal] both attempts rejected, refusing to serve:",
      lastViolations.map((v) => v.term).join(", "),
    );
  }

  const err = new Error(
    lastViolations.length > 0
      ? "halal violation"
      : lastRecipeError ?? "AI returned an incomplete recipe. Please try again.",
  ) as Error & { tokens?: TokenUsage };
  err.tokens = total;
  throw err;
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

  // Quota is checked and reserved further down, after the body is parsed, since
  // the image flag is part of the request and image requests have their own cap.

  let userMessage: string;
  let saveToRecipes: boolean;
  let sessionId: string | null;
  let imageBase64: string | null;
  let history: { role: "user" | "assistant"; content: string }[];

  try {
    const body = await req.json();
    userMessage = String(body.message ?? "").trim();
    saveToRecipes = body.save_to_recipes === true;
    sessionId = typeof body.session_id === "string" && body.session_id ? body.session_id : null;
    imageBase64 = typeof body.image === "string" && body.image ? body.image : null;
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

  const hasImage = imageBase64 !== null;

  // Reserve quota BEFORE calling OpenAI. Two problems this fixes at once: the
  // old code read the counter at the start and wrote count+1 at the end, so
  // concurrent requests all read the same value and the limit was bypassable;
  // and it only incremented after a success, so failed calls were billed by
  // OpenAI while costing the user nothing. consume_ai_request does the check
  // and the increment in one advisory-locked call (migration 074).
  const { data: quota, error: quotaError } = await supabaseAdmin
    .rpc("consume_ai_request", { p_user_id: user.id, p_is_image: hasImage });

  if (quotaError) {
    console.error("[rate-limit] consume_ai_request failed:", quotaError.message);
    return json({ error: "Could not verify your usage allowance. Please try again." }, 503);
  }

  if (!quota?.allowed) {
    const reason = quota?.reason ?? "hourly";
    // Deliberately distinct copy per reason: "try again in an hour" is wrong
    // and frustrating when the real block is a monthly cap or a platform pause.
    const message =
      reason === "disabled"         ? "AQI is paused for maintenance right now. Please try again shortly."
      : reason === "global_spend_cap" ? "AQI has hit today's usage ceiling. It'll be back tomorrow."
      : reason === "monthly"        ? `You've used all ${quota.limit} of your AI requests this month.`
      : reason === "daily"          ? `You've used all ${quota.limit} of your AI requests today. Your allowance resets tomorrow.`
      : reason === "image_daily"    ? `You've used all ${quota.limit} of your photo requests today.`
      : `You can make up to ${quota.limit} AI requests per hour.`;

    return json({
      error: "Rate limit exceeded",
      message,
      reason,
      retry_after: reason === "hourly" ? "1 hour" : "later",
      requests_remaining: 0,
      rate_limit: quota?.limit ?? null,
    }, 429);
  }

  if (signal.aborted) {
    await supabaseAdmin.rpc("refund_ai_request", { p_user_id: user.id, p_is_image: hasImage });
    return json({ error: "Request cancelled" }, 499);
  }

  // Moderation check on image BEFORE calling OpenAI. Fails fast without burning quota.
  if (imageBase64) {
    try {
      const moderationReq = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: [
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "low" },
            },
          ],
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!moderationReq.ok) throw new Error(`Moderation API error: ${moderationReq.status}`);

      const modResult = await moderationReq.json() as { results: Array<{ flagged: boolean }> };
      if (modResult.results?.[0]?.flagged) {
        await supabaseAdmin.rpc("refund_ai_request", { p_user_id: user.id, p_is_image: hasImage });
        return json({
          error: "Image flagged by safety check. Please upload a different image.",
          message: "That image contains content I can't analyze. Please try a different photo.",
        }, 400);
      }
    } catch (modErr) {
      console.error("Moderation check failed:", modErr instanceof Error ? modErr.message : String(modErr));
      await supabaseAdmin.rpc("refund_ai_request", { p_user_id: user.id, p_is_image: hasImage });
      return json({ error: "Image validation failed. Please try again." }, 503);
    }
  }

  const openaiController = new AbortController();
  const openaiTimeout = setTimeout(() => openaiController.abort(), OPENAI_TIMEOUT_MS);
  signal.addEventListener("abort", () => openaiController.abort(), { once: true });

  let envelope: AIEnvelope;
  let recipe: ValidatedRecipe | null;
  let tokens: TokenUsage = { prompt: 0, completion: 0 };
  let imageTokens: number | undefined;

  try {
    const result = await generateEnvelopeWithRetry(
      openaiApiKey,
      history,
      userMessage,
      openaiController.signal,
      imageBase64,
    );
    envelope = result.envelope;
    recipe = result.recipe;
    tokens = result.tokens;
    imageTokens = result.imageTokens;
  } catch (error) {
    clearTimeout(openaiTimeout);
    const msg = error instanceof Error ? error.message : String(error);
    const timedOut = msg.toLowerCase().includes("abort");
    console.error("OpenAI request failed:", msg);

    // Anything OpenAI actually billed still gets recorded, even on failure, so
    // the spend ceiling sees real spend rather than only successful spend.
    const failedTokens = (error as { tokens?: TokenUsage }).tokens;
    if (failedTokens && (failedTokens.prompt || failedTokens.completion)) {
      await logUsage(supabaseAdmin, user.id, failedTokens, hasImage, imageTokens);
    } else {
      // Nothing was billed, so the reserved quota is handed back rather than
      // charged for a request the user never got an answer to.
      await supabaseAdmin.rpc("refund_ai_request", { p_user_id: user.id, p_is_image: hasImage });
    }

    // `reason` lets the client tell a halal refusal apart from a generic
    // upstream failure, so it can show the sentence as written instead of
    // wrapping it in "Sorry, I ran into an issue", and can leave off the retry
    // button — retrying the same prompt costs another request for an answer the
    // validator has already refused twice.
    if (!timedOut && msg === "halal violation") {
      return json({
        error: "halal violation",
        reason: "halal",
        message: "I couldn't put that dish together in a halal way. Ask me for something else and I'll get straight to it.",
      }, 503);
    }

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

  await logUsage(supabaseAdmin, user.id, tokens, hasImage, imageTokens);

  const requestsRemaining = Number(quota.requests_remaining ?? 0);
  const rateLimitForUser = Number(quota.rate_limit ?? 0);

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
