/**
 * Server-side halal enforcement for AQI recipe output.
 *
 * Until now the halal promise lived entirely in the system prompt. A prompt is
 * a request, not a guarantee: one bad generation and the platform ships a
 * recipe with pancetta in it under a halal badge. This module is the guarantee.
 * It runs after structural validation and before a recipe is returned to the
 * user or written to `recipes`.
 *
 * Design notes, because the obvious implementation is wrong in both directions:
 *
 *  - Naive substring matching produces nonsense. "ham" is inside "hamburger",
 *    "lard" is inside "collard", "gin" is inside "ginger", "rum" is inside
 *    "drumstick". Every pattern here is word-bounded for that reason.
 *
 *  - A flat deny-list over-blocks. Turkey bacon, beef chorizo, halal gelatin,
 *    fish gelatin, microbial rennet and beef suet are all halal and all contain
 *    a denied word. Those rules carry a waiver: if a qualifying word sits next
 *    to the hit, the hit is ignored.
 *
 *  - Vinegar is deliberately allowed. Wine vinegar, cider vinegar, sherry
 *    vinegar and balsamic are the majority halal position (istihala — the
 *    substance has fully transformed), and blocking them would reject a large
 *    share of ordinary cooking. So a hit immediately followed by "vinegar" is
 *    waived rather than blocked.
 *
 * Scope: recipes only, never chat prose. A user asking "is pork haram?" must
 * get an answer containing the word "pork"; scanning free text would break the
 * assistant's ability to talk about the rule it is enforcing.
 */

/** One match against a recipe, named so the retry prompt can be specific. */
export interface HalalViolation {
  /** The literal text that matched, e.g. "pancetta". */
  term: string;
  /** Where it was found, e.g. `ingredient "150g pancetta"`. */
  where: string;
  /** Rule id, for logging. */
  rule: string;
}

interface Rule {
  id: string;
  /** Source of a case-insensitive, word-bounded pattern. */
  pattern: string;
  /** If this matches the text around the hit, the hit is not a violation. */
  waiver?: RegExp;
}

// A halal version of this product exists and is common, so the denied word on
// its own proves nothing. Applies to cured meats, gelatin, rennet, animal fats.
const HALAL_SOURCE = /\b(halal|turkey|beef|chicken|veal|lamb|duck|bovine|fish|agar|vegan|vegetarian|veggie|plant[\s-]?based|meat[\s-]?free|soy|soya|mock|facon|microbial|vegetable|plant)\b/i;

// Alcohol rules are waived only by an explicit non-alcoholic form, or by
// vinegar (see the istihala note above).
const NO_ALCOHOL = /\b(non[\s-]?alcoholic|alcohol[\s-]?free|alcohol[\s-]?removed|de[\s-]?alcoholi[sz]ed|zero[\s-]?alcohol|halal|virgin|mocktail|vinegar|substitute)\b/i;

// Pork and its cured forms. No waiver on the unambiguous ones: there is no
// halal "prosciutto", and a model that writes it means it.
const PORK: Rule[] = [
  { id: "pork",        pattern: "pork|porkchop" },
  { id: "pig",         pattern: "pigs?|piglets?|swine|hogs?|wild boar|boar" },
  { id: "lard",        pattern: "lard|lardons?|lardo" },
  { id: "prosciutto",  pattern: "prosciutto|pancetta|guanciale|speck|coppa|capicola|capocollo|mortadella|jamon|serrano ham|n'?duja|soppressata|scrapple|chitterlings|chitlins" },
  // "rashers" is deliberately absent: it is a unit of measure, so it names the
  // wrong thing in the retry prompt, and real pork always carries a meat word.
  { id: "bacon",       pattern: "bacon",                      waiver: HALAL_SOURCE },
  { id: "ham",         pattern: "ham|gammon",                 waiver: HALAL_SOURCE },
  { id: "cured-meat",  pattern: "chorizo|pepperoni|salami|bratwurst|andouille|kielbasa|saucisson", waiver: HALAL_SOURCE },
  { id: "animal-fat",  pattern: "suet|tallow|schmaltz",       waiver: HALAL_SOURCE },
  { id: "gelatin",     pattern: "gelatine?|isinglass",        waiver: HALAL_SOURCE },
  { id: "rennet",      pattern: "rennet",                     waiver: HALAL_SOURCE },
];

// Blood is haram in itself. Only the named preparations are matched — a bare
// "blood" pattern would reject blood oranges.
const BLOOD: Rule[] = [
  { id: "blood", pattern: "blood sausage|blood pudding|black pudding|boudin noir|blutwurst|sanguinaccio|dinuguan" },
];

// Drinking alcohol, cooking alcohol, and alcohol-carried flavourings. Cooking
// does not remove enough of it to matter here, and the platform's promise is
// about the ingredient, not the residue.
const ALCOHOL: Rule[] = [
  { id: "wine",        pattern: "wines?|vino",                waiver: NO_ALCOHOL },
  { id: "beer",        pattern: "beers?|lagers?|stouts?|pilsner|ipa", waiver: NO_ALCOHOL },
  // "ale" on its own, but never ginger ale, which is a soft drink.
  { id: "ale",         pattern: "ale",                        waiver: /\b(ginger|non[\s-]?alcoholic|alcohol[\s-]?free)\b/i },
  { id: "cider",       pattern: "ciders?|perry",              waiver: NO_ALCOHOL },
  { id: "rice-wine",   pattern: "mirin|shaoxing|huangjiu|soju|makgeolli|sochu|shochu", waiver: NO_ALCOHOL },
  // "sake" is a real word in English prose ("for the sake of"), so the
  // possessive/prepositional form is excluded rather than the word itself.
  { id: "sake",        pattern: "sake(?!\\s+of\\b)",          waiver: NO_ALCOHOL },
  { id: "spirits",     pattern: "rum|whisk(?:e?y)|bourbon|scotch|vodka|gin|tequila|mezcal|brandy|cognac|armagnac|calvados|grappa|pisco|cacha[cç]a|absinthe|ouzo|raki|arak|schnapps|aquavit|akvavit|moonshine|everclear|poitin", waiver: NO_ALCOHOL },
  { id: "fortified",   pattern: "sherry|marsala|madeira|vermouth|champagne|prosecco|cava|sangria|mead", waiver: NO_ALCOHOL },
  { id: "liqueur",     pattern: "liqueurs?|liquor|amaretto|kahlua|baileys|triple sec|cointreau|grand marnier|cura[cç]ao|limoncello|sambuca|chartreuse|benedictine|drambuie|frangelico|midori|malibu|j[aä]germeister|campari|aperol|kirsch|framboise|cr[eè]me de (?:cassis|menthe|cacao)|eau de vie", waiver: NO_ALCOHOL },
  { id: "bitters",     pattern: "bitters|angostura",          waiver: NO_ALCOHOL },
  { id: "extract",     pattern: "vanilla extract|rum extract|brandy extract", waiver: NO_ALCOHOL },
  { id: "alcohol",     pattern: "alcohol|ethanol|ethyl alcohol|booze", waiver: NO_ALCOHOL },
];

// Animals that are haram regardless of slaughter. Short by design: contested
// categories (shellfish, rabbit, insect-derived colourings) are left out
// rather than imposing one school's ruling on every user.
const OTHER: Rule[] = [
  { id: "haram-animal", pattern: "carrion|dog meat|cat meat|horse meat|donkey|mule meat|frogs? legs?|escargot|crocodile|alligator|vulture" },
];

const RULES: Rule[] = [...PORK, ...BLOOD, ...ALCOHOL, ...OTHER];

/** Compiled once at module load rather than per request. */
const COMPILED = RULES.map((r) => ({
  ...r,
  re: new RegExp(`\\b(?:${r.pattern})\\b`, "gi"),
}));

/**
 * Lowercase, strip accents (jamón -> jamon), normalise dashes and whitespace.
 * Without the accent fold, "jamón ibérico" walks straight past the list.
 */
function normalise(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Waivers are judged on the text immediately around the hit, not the whole
 * recipe. A "halal" in the description must not license pancetta 40 lines
 * later, but "halal beef bacon" in one ingredient line must pass.
 */
const WAIVER_BEFORE = 40;
const WAIVER_AFTER = 24;

/**
 * A denied word being explicitly ruled out is the opposite of a violation.
 * "gelatine-free ladyfingers", "no pork", "grape juice instead of wine" are the
 * model getting it exactly right, and rejecting them wasted a retry and half a
 * cent per dessert recipe until this was added. Caught live in the regression
 * run rather than reasoned about in advance.
 *
 * Applies to every rule, including the ones with no waiver of their own: there
 * is nothing wrong with a recipe that advertises itself as pork-free.
 */
const NEGATED_AFTER = /^[\s-]*free\b/i;
const NEGATED_BEFORE = /\b(no|without|free of|instead of|in place of|rather than|non)\s*-?\s*$/i;

function isNegated(text: string, index: number, length: number): boolean {
  const before = text.slice(Math.max(0, index - 20), index);
  const after = text.slice(index + length, index + length + 12);
  return NEGATED_AFTER.test(after) || NEGATED_BEFORE.test(before);
}

function scan(
  field: string,
  label: string,
  out: HalalViolation[],
  /** Rule ids already cleared by a qualified ingredient line. */
  cleared: Set<string>,
  /** When true, a waived hit adds its rule to `cleared` for later passes. */
  recordClears: boolean,
) {
  if (!field) return;
  const text = normalise(field);

  for (const rule of COMPILED) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text)) !== null) {
      if (isNegated(text, m.index, m[0].length)) continue;

      if (rule.waiver) {
        // Cleared at the ingredient level: the method saying "fry the bacon"
        // is not a second violation when the ingredient was "halal beef bacon".
        if (cleared.has(rule.id)) continue;
        const window = text.slice(
          Math.max(0, m.index - WAIVER_BEFORE),
          m.index + m[0].length + WAIVER_AFTER,
        );
        if (rule.waiver.test(window)) {
          if (recordClears) cleared.add(rule.id);
          continue;
        }
      }
      out.push({ term: m[0], where: label, rule: rule.id });
      // One hit per rule per field is enough to fail it, and stops a recipe
      // that says "wine" six times producing six identical violations.
      break;
    }
  }
}

/** The shape this needs from a recipe. Kept structural so the caller's fuller type fits. */
interface ScannableRecipe {
  title: string;
  description: string;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: { step: number; text: string }[];
  tags: string[];
}

/**
 * Every haram term found in a recipe. Empty array means it passed.
 *
 * Instructions are scanned as well as ingredients: "deglaze with white wine"
 * routinely appears in a method whose ingredient list never mentions it, and
 * that is exactly the case an ingredient-only check would wave through.
 */
export function findHalalViolations(recipe: ScannableRecipe): HalalViolation[] {
  const out: HalalViolation[] = [];
  const cleared = new Set<string>();

  // Ingredients first, and only they may clear a rule. The ingredient list is
  // where a qualifier is stated ("halal beef bacon"); prose never restates it.
  for (const ing of recipe.ingredients ?? []) {
    // Scanned as one line: the qualifier that waives a rule ("turkey") often
    // sits in a different field from the hit ("bacon").
    const line = [ing.amount, ing.unit, ing.name].filter(Boolean).join(" ").trim();
    scan(line, `ingredient "${line}"`, out, cleared, true);
  }

  scan(recipe.title, "the title", out, cleared, false);
  scan(recipe.description, "the description", out, cleared, false);

  for (const step of recipe.instructions ?? []) {
    scan(step.text, `step ${step.step}`, out, cleared, false);
  }

  scan((recipe.tags ?? []).join(" "), "the tags", out, cleared, false);

  // Same term found in several places is one problem, not five.
  const seen = new Set<string>();
  return out.filter((v) => {
    const key = `${v.rule}:${v.term}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * A correction the model can actually act on. Naming the exact terms matters:
 * a generic "make it halal" retry tends to return the same recipe with a
 * halal claim bolted on, while naming "pancetta" gets it replaced.
 */
export function buildHalalRetryPrompt(violations: HalalViolation[]): string {
  const terms = [...new Set(violations.map((v) => v.term))].join(", ");
  return (
    `That recipe is not halal. It contains: ${terms}. ` +
    `Regenerate the full recipe with every one of those replaced by a halal ingredient ` +
    `(halal beef or turkey bacon, grape or pomegranate juice instead of wine, ` +
    `alcohol-free vanilla, halal or beef gelatine, vegetable stock). ` +
    `Do not mention the substitution in the message field. Return the complete recipe.`
  );
}
