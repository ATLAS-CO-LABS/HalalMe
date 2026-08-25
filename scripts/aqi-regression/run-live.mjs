/**
 * Live regression suite for the AQI edge function.
 *
 * Run with `npm run test:aqi`. It talks to the deployed `generate-recipe`
 * function with real auth and a real model call, because the things most likely
 * to break are the things only the model can decide: whether "the second one"
 * routes to a recipe, whether a shopping list arrives in full or as a promise
 * of one, and whether a request for a pork dish comes back halal.
 *
 * This exists so the system prompt can be changed without guessing. Prompt
 * edits are invisible until they are wrong in production; this makes them
 * visible in about two minutes.
 *
 * Costs real money — roughly $0.02 for a full run. It also reports prompt
 * tokens per call, which is how a claimed prompt-size reduction gets verified
 * rather than asserted.
 *
 * Test users are minted with the service role and deleted at the end, including
 * on Ctrl-C. Each user carries an hourly request cap, so the run rotates to a
 * fresh user every few cases rather than tripping its own rate limit.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");

// Read from the dotenv files rather than process.env: this is a local developer
// tool and the keys already live there for `next dev`. Both names are tried,
// with .env.local winning, matching how Next.js layers them.
function loadEnv() {
  const env = {};
  let found = false;
  for (const name of [".env.local", ".env"]) {
    let raw;
    try { raw = readFileSync(resolve(root, name), "utf8"); } catch { continue; }
    found = true;
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  if (!found) {
    console.error("Could not read .env.local or .env");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !ANON || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(URL_, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

// Hourly cap for a base-tier user is 10; staying under it keeps the suite from
// failing on its own rate limit rather than on a real regression.
const CASES_PER_USER = 8;
const createdUsers = [];

async function mintUser() {
  const email = `aqi-regression-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@halalme.test`;
  const password = `Rg-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw new Error(`createUser failed: ${error.message}`);
  createdUsers.push(data.user.id);

  const anon = createClient(URL_, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: session, error: signInError } = await anon.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn failed: ${signInError.message}`);
  return session.session.access_token;
}

async function cleanup() {
  for (const id of createdUsers.splice(0)) {
    try { await admin.auth.admin.deleteUser(id); } catch { /* best effort */ }
  }
}
process.on("SIGINT", async () => { await cleanup(); process.exit(130); });

async function call(token, message, history = []) {
  const res = await fetch(`${URL_}/functions/v1/generate-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, history, save_to_recipes: false, session_id: null }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
const sentences = (s) => (s.match(/[.!?]+(\s|$)/g) ?? []).length;
const bullets = (s) => (s.match(/^\s*[-*]\s+\S/gm) ?? []).length;
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const numbered = (s) => (s.match(/^\s*\d+[.)]\s+\S/gm) ?? []).length;

function isChat(b) {
  if (b.type !== "chat") return `expected type "chat", got "${b.type}"`;
  if (b.recipe) return "chat reply carried a recipe object";
  if (!b.message?.trim()) return "chat reply had an empty message";
  return null;
}

function isRecipe(b) {
  if (b.type !== "recipe") return `expected type "recipe", got "${b.type}"`;
  if (!b.recipe) return "recipe reply had no recipe object";
  if ((b.recipe.ingredients?.length ?? 0) < 4) return `only ${b.recipe.ingredients?.length ?? 0} ingredients`;
  if ((b.recipe.instructions?.length ?? 0) < 3) return `only ${b.recipe.instructions?.length ?? 0} instructions`;
  return null;
}

/** The one-short-sentence rule for the message that accompanies a recipe. */
function terseMessage(b) {
  if (sentences(b.message ?? "") > 2) return `recipe message ran to ${sentences(b.message)} sentences: "${b.message}"`;
  if (/\n\s*[-*\d]/.test(b.message ?? "")) return "recipe message contained a list";
  return null;
}

/**
 * The chat bubble renders only **bold**, newlines and bullet characters (see
 * `md()` in the AQI page). Anything else arrives as raw markdown the user has
 * to read through, so unsupported syntax is a rendering bug, not a style nit.
 */
function renderableMarkdown(b) {
  const m = b.message ?? "";
  if (/^#{1,6}\s/m.test(m)) return `used a # heading, which renders literally: "${m.match(/^#{1,6}\s.*/m)[0].slice(0, 60)}"`;
  if (/`/.test(m)) return "used backticks, which render literally";
  if (/\[[^\]]+\]\([^)]+\)/.test(m)) return "used a markdown link, which renders literally";
  if (/^\s*\|.*\|/m.test(m)) return "used a markdown table, which renders literally";
  return null;
}

/** The failure the old prompt spent 30 lines trying to prevent. */
function noEmptyPromise(b) {
  const m = (b.message ?? "").trimEnd();
  if (/[:：]$/.test(m)) return `message ends on a colon: "${m.slice(-60)}"`;
  if (/(\.\.\.|…)$/.test(m)) return `message trails off: "${m.slice(-60)}"`;
  return null;
}

/** Terms that must never survive into output, whatever was asked for. */
const HARAM = /\b(pork|bacon|ham|pancetta|prosciutto|chorizo|lard|wine|beer|rum|brandy|whisky|whiskey|vodka|mirin|sake|marsala|sherry|liqueur)\b/i;

function halalClean(b) {
  const r = b.recipe;
  if (!r) return null;
  const hay = [
    r.title, r.description,
    ...(r.ingredients ?? []).map((i) => `${i.amount} ${i.unit} ${i.name}`),
    ...(r.instructions ?? []).map((s) => s.text),
    ...(r.tags ?? []),
  ].join(" | ");
  // The qualified halal forms the validator allows are stripped first, so
  // "halal beef bacon" and "red wine vinegar" do not read as violations here.
  const cleaned = hay
    .replace(/\b(halal|turkey|beef|chicken|veal|lamb|vegan|vegetarian|plant[\s-]?based|soy)[\s-]+(bacon|ham|chorizo|salami|pepperoni|gelatine?|suet|tallow)\b/gi, "")
    .replace(/\b\w*\s*(wine|cider|sherry|champagne|malt)\s+vinegar\b/gi, "")
    .replace(/\b(non[\s-]?alcoholic|alcohol[\s-]?free)[\s-]+\w+/gi, "");
  const hit = cleaned.match(HARAM);
  return hit ? `haram term "${hit[0]}" survived into the recipe` : null;
}

function nutritionHonest(b) {
  const n = b.recipe?.nutrition;
  if (n === null || n === undefined) return null; // null is a valid answer now
  const zeros = Object.entries(n).filter(([, v]) => v === 0);
  return zeros.length ? `nutrition still reports zeros: ${zeros.map(([k]) => k).join(", ")}` : null;
}

const all = (...checks) => (b) => {
  for (const c of checks) { const e = c(b); if (e) return e; }
  return null;
};

// ---------------------------------------------------------------------------
// The suite
// ---------------------------------------------------------------------------
const RECIPE_MADE = "[RECIPE GENERATED]\nTitle: Chicken Biryani\nA full recipe has already been provided in this conversation.";

const cases = [
  { name: "greeting stays chat", message: "hey there",
    check: all(isChat, noEmptyPromise, renderableMarkdown, (b) => sentences(b.message) > 6 ? "greeting ran long" : null) },

  { name: "named dish makes a recipe", message: "chicken biryani recipe",
    check: all(isRecipe, terseMessage, halalClean, nutritionHonest) },

  { name: "bare ingredients offer options", message: "i have chicken, rice, onions and yogurt",
    check: all(isChat, noEmptyPromise, renderableMarkdown, (b) => numbered(b.message) < 2 ? "no numbered options offered" : null) },

  { name: "picking an option makes that recipe", message: "the second one",
    history: [
      { role: "user", content: "i have chicken, rice and onions" },
      { role: "assistant", content: "1. Chicken Biryani\n2. Chicken Fried Rice\n3. Chicken Pulao\nWhich one should I make for you?" },
    ],
    check: all(isRecipe, terseMessage, halalClean,
      (b) => /fried rice/i.test(b.recipe.title) ? null : `picked "${b.recipe.title}" instead of the second option`) },

  { name: "surprise me makes a recipe", message: "surprise me",
    check: all(isRecipe, terseMessage, halalClean) },

  { name: "modification makes a new recipe", message: "make it spicier",
    history: [
      { role: "user", content: "chicken biryani recipe" },
      { role: "assistant", content: RECIPE_MADE },
    ],
    check: all(isRecipe, terseMessage, halalClean) },

  { name: "thanks after a recipe stays chat", message: "perfect, thanks!",
    history: [
      { role: "user", content: "chicken biryani recipe" },
      { role: "assistant", content: RECIPE_MADE },
    ],
    check: all(isChat, noEmptyPromise, renderableMarkdown) },

  { name: "vague shopping list asks one question", message: "can you give me a shopping list",
    check: all(isChat, noEmptyPromise, renderableMarkdown,
      (b) => b.message.includes("?") ? null : "did not ask what the list is for",
      (b) => bullets(b.message) > 3 ? "produced a list before knowing what it was for" : null) },

  { name: "shopping list arrives in full", message: "for the whole Eid spread, about 10 people",
    history: [
      { role: "user", content: "can you give me a shopping list" },
      { role: "assistant", content: "Happy to. Is this for one specific dish or the whole Eid spread?" },
    ],
    check: all(isChat, noEmptyPromise, renderableMarkdown,
      (b) => bullets(b.message) >= 25 ? null : `only ${bullets(b.message)} items`,
      (b) => words(b.message) >= 200 ? null : `only ${words(b.message)} words`,
      (b) => /^\*\*/.test(b.message.trim()) ? null : `did not open with a section header: "${b.message.slice(0, 60)}"`) },

  { name: "ideas request lists dishes", message: "what can i make with chicken and rice?",
    check: all(isChat, noEmptyPromise, renderableMarkdown,
      (b) => numbered(b.message) >= 4 ? null : `only ${numbered(b.message)} numbered ideas`) },

  { name: "technique question stays chat", message: "what can i use instead of buttermilk?",
    check: all(isChat, noEmptyPromise, renderableMarkdown,
      (b) => sentences(b.message) <= 8 ? null : "technique answer ran long",
      // Single-topic answer — must NOT get the bold-label paragraph treatment
      // meant for multi-point replies.
      (b) => /^\*\*[^*]{2,40}:\*\*/m.test(b.message) ? `single-topic answer got a bold label anyway: "${b.message.slice(0, 80)}"` : null) },

  { name: "multi-topic health question gets structured", message: "so im eating one meal a day bc im losing weight so mostly im eating chicken alot, so is it fine or should i explore other options too and im doing 5km walk per day",
    check: all(isChat, noEmptyPromise, renderableMarkdown,
      (b) => /^\*\*[^*]{2,40}:\*\*/m.test(b.message) ? null : `no bold-label paragraph found: "${b.message.slice(0, 150)}"`,
      (b) => (b.message.match(/\n\n/g) ?? []).length >= 2 ? null : "fewer than 2 paragraph breaks — read as one dense block",
      (b) => /dizz|weak|faint|exhaust|doctor|healthcare|professional/i.test(b.message) ? null : "dropped the safety-warning point entirely") },

  // --- the halal cases: dishes defined by a haram ingredient ---
  { name: "carbonara comes back halal", message: "carbonara recipe",
    check: all(isRecipe, halalClean, terseMessage) },

  { name: "coq au vin comes back halal", message: "coq au vin recipe",
    check: all(isRecipe, halalClean) },

  { name: "tiramisu comes back halal", message: "tiramisu recipe",
    check: all(isRecipe, halalClean) },

  { name: "beef bourguignon comes back halal", message: "beef bourguignon recipe",
    check: all(isRecipe, halalClean) },

  { name: "explicit pork request is not served", message: "give me a pork belly recipe",
    // Either answer is acceptable: decline in chat, or offer a halal dish.
    // What is not acceptable is a recipe containing pork.
    check: (b) => (b.type === "recipe" ? all(isRecipe, halalClean)(b) : isChat(b)) },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const selected = only.length
  ? cases.filter((c) => only.some((o) => c.name.toLowerCase().includes(o.toLowerCase())))
  : cases;

console.log(`AQI live regression — ${selected.length} case(s) against ${URL_}\n`);

let token = null;
let sinceRotate = 0;
let failures = 0;
const started = Date.now();
const startedIso = new Date().toISOString();

for (const c of selected) {
  if (!token || sinceRotate >= CASES_PER_USER) {
    process.stdout.write("  (minting a fresh test user)\n");
    token = await mintUser();
    sinceRotate = 0;
  }
  sinceRotate++;

  const t0 = Date.now();
  let result;
  try {
    result = await call(token, c.message, c.history ?? []);
  } catch (err) {
    failures++;
    console.log(`FAIL  ${c.name}\n      request threw: ${err.message}\n`);
    continue;
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  if (result.status !== 200) {
    failures++;
    console.log(`FAIL  ${c.name}  (${secs}s)\n      HTTP ${result.status}: ${JSON.stringify(result.body).slice(0, 300)}\n`);
    continue;
  }

  const err = c.check(result.body);
  if (err) {
    failures++;
    console.log(`FAIL  ${c.name}  (${secs}s)\n      ${err}`);
    console.log(`      message: ${JSON.stringify((result.body.message ?? "").slice(0, 220))}\n`);
  } else {
    const kind = result.body.type === "recipe" ? `recipe "${result.body.recipe.title}"` : `chat, ${words(result.body.message)}w`;
    console.log(`PASS  ${c.name}  (${secs}s, ${kind})`);
  }

  if (process.env.AQI_VERBOSE) {
    console.log(`      ${JSON.stringify(result.body).slice(0, 1200)}\n`);
  }
  // Politeness gap; the function is not the bottleneck but OpenAI can be.
  await new Promise((r) => setTimeout(r, 400));
}

// Token figures for this run. Filtered by time rather than by user id because
// ai_usage_log.user_id is SET NULL on delete (cost history has to outlive the
// account), so the ids are about to stop identifying anything. On a project
// with concurrent live traffic these numbers would include it.
let usage = null;
try {
  const { data } = await admin
    .from("ai_usage_log")
    .select("prompt_tokens, completion_tokens, cost_usd")
    .gte("created_at", startedIso);
  if (data?.length) {
    usage = {
      calls: data.length,
      prompt: Math.round(data.reduce((a, r) => a + r.prompt_tokens, 0) / data.length),
      completion: Math.round(data.reduce((a, r) => a + r.completion_tokens, 0) / data.length),
      cost: data.reduce((a, r) => a + Number(r.cost_usd), 0),
    };
  }
} catch { /* reporting only, never fails the run */ }

await cleanup();

const mins = ((Date.now() - started) / 60000).toFixed(1);
console.log(`\n${selected.length - failures}/${selected.length} passed, ${failures} failed  (${mins} min)`);
if (usage) {
  // The system prompt is the whole of the fixed input cost, so mean prompt
  // tokens is the number a prompt rewrite has to actually move.
  console.log(`${usage.calls} OpenAI calls billed — mean ${usage.prompt} prompt + ${usage.completion} completion tokens, $${usage.cost.toFixed(4)} total`);
}
process.exit(failures ? 1 : 0);
