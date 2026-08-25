/**
 * Deny-list regression cases for the AQI halal validator.
 *
 * Run with `npm run test:halal`. Every case is a real failure mode: the "block"
 * half is what the platform must never serve, and the "pass" half is the set of
 * near-misses that a naive substring check gets wrong — hamburger, graham,
 * collard, ginger, drumstick, blood orange, black turtle beans, and the
 * vinegars, which are halal and appear in an enormous share of ordinary
 * recipes. A change to halal.ts that breaks either half is a regression.
 */
import { findHalalViolations } from "../../supabase/functions/generate-recipe/halal";

type Ing = { name: string; amount: string; unit: string };
const ing = (name: string, amount = "1", unit = ""): Ing => ({ name, amount, unit });

function recipe(over: Partial<{
  title: string; description: string; ingredients: Ing[];
  instructions: { step: number; text: string }[]; tags: string[];
}> = {}) {
  return {
    title: "Test dish",
    description: "A simple dish.",
    ingredients: [ing("chicken thighs", "500", "g"), ing("onion", "1", "")],
    instructions: [{ step: 1, text: "Cook the chicken." }, { step: 2, text: "Serve." }],
    tags: ["dinner"],
    ...over,
  };
}

type Case = { name: string; input: ReturnType<typeof recipe>; expect: "block" | "pass" };

const cases: Case[] = [
  // ---------- must BLOCK ----------
  { name: "pork ingredient", expect: "block",
    input: recipe({ ingredients: [ing("pork shoulder", "1", "kg"), ing("onion")] }) },
  { name: "pancetta", expect: "block",
    input: recipe({ ingredients: [ing("pancetta, diced", "150", "g")] }) },
  { name: "jamon with accent", expect: "block",
    input: recipe({ ingredients: [ing("jamón ibérico", "100", "g")] }) },
  { name: "unqualified bacon", expect: "block",
    input: recipe({ ingredients: [ing("bacon", "6", "rashers")] }) },
  { name: "unqualified ham", expect: "block",
    input: recipe({ ingredients: [ing("ham", "200", "g")] }) },
  { name: "lard", expect: "block",
    input: recipe({ ingredients: [ing("lard", "2", "tbsp")] }) },
  { name: "gelatine unqualified", expect: "block",
    input: recipe({ ingredients: [ing("gelatine leaves", "4", "")] }) },
  { name: "white wine in ingredients", expect: "block",
    input: recipe({ ingredients: [ing("dry white wine", "150", "ml")] }) },
  { name: "wine only in instructions", expect: "block",
    input: recipe({ instructions: [{ step: 1, text: "Deglaze the pan with white wine." }, { step: 2, text: "Reduce." }] }) },
  { name: "mirin", expect: "block",
    input: recipe({ ingredients: [ing("mirin", "2", "tbsp")] }) },
  { name: "sake the drink", expect: "block",
    input: recipe({ ingredients: [ing("sake", "60", "ml")] }) },
  { name: "shaoxing wine", expect: "block",
    input: recipe({ ingredients: [ing("shaoxing rice wine", "1", "tbsp")] }) },
  { name: "brandy", expect: "block",
    input: recipe({ ingredients: [ing("brandy", "50", "ml")] }) },
  { name: "vanilla extract", expect: "block",
    input: recipe({ ingredients: [ing("vanilla extract", "1", "tsp")] }) },
  { name: "beer batter", expect: "block",
    input: recipe({ ingredients: [ing("lager", "330", "ml")] }) },
  { name: "black pudding", expect: "block",
    input: recipe({ ingredients: [ing("black pudding", "200", "g")] }) },
  { name: "chorizo unqualified", expect: "block",
    input: recipe({ ingredients: [ing("chorizo", "150", "g")] }) },
  { name: "prosciutto in title", expect: "block",
    input: recipe({ title: "Melon and Prosciutto Salad" }) },
  { name: "pork in tags", expect: "block",
    input: recipe({ tags: ["pork", "quick"] }) },
  { name: "rum in description", expect: "block",
    input: recipe({ description: "Soaked in dark rum overnight." }) },
  { name: "hard cider", expect: "block",
    input: recipe({ ingredients: [ing("dry cider", "200", "ml")] }) },
  { name: "amaretto", expect: "block",
    input: recipe({ ingredients: [ing("amaretto", "30", "ml")] }) },
  { name: "escargot", expect: "block",
    input: recipe({ ingredients: [ing("escargot", "12", "")] }) },
  { name: "animal rennet", expect: "block",
    input: recipe({ ingredients: [ing("rennet", "3", "drops")] }) },
  { name: "suet unqualified", expect: "block",
    input: recipe({ ingredients: [ing("suet", "100", "g")] }) },

  // ---------- must PASS ----------
  { name: "plain chicken curry", expect: "pass", input: recipe() },
  { name: "hamburger", expect: "pass",
    input: recipe({ title: "Beef Hamburger", ingredients: [ing("hamburger buns", "4", "")] }) },
  { name: "graham crackers", expect: "pass",
    input: recipe({ ingredients: [ing("graham cracker crumbs", "200", "g")] }) },
  { name: "collard greens", expect: "pass",
    input: recipe({ ingredients: [ing("collard greens", "1", "bunch")] }) },
  { name: "ginger and garlic", expect: "pass",
    input: recipe({ ingredients: [ing("fresh ginger", "2", "inch"), ing("garlic")] }) },
  { name: "drumsticks", expect: "pass",
    input: recipe({ ingredients: [ing("chicken drumsticks", "8", "")] }) },
  { name: "red wine vinegar", expect: "pass",
    input: recipe({ ingredients: [ing("red wine vinegar", "2", "tbsp")] }) },
  { name: "apple cider vinegar", expect: "pass",
    input: recipe({ ingredients: [ing("apple cider vinegar", "1", "tbsp")] }) },
  { name: "balsamic vinegar", expect: "pass",
    input: recipe({ ingredients: [ing("balsamic vinegar", "2", "tbsp")] }) },
  { name: "turkey bacon", expect: "pass",
    input: recipe({ ingredients: [ing("turkey bacon", "6", "slices")] }) },
  { name: "halal beef bacon then bare bacon in method", expect: "pass",
    input: recipe({
      ingredients: [ing("halal beef bacon", "6", "slices")],
      instructions: [{ step: 1, text: "Fry the bacon until crisp." }, { step: 2, text: "Set aside." }],
    }) },
  { name: "turkey ham", expect: "pass",
    input: recipe({ ingredients: [ing("turkey ham, diced", "150", "g")] }) },
  { name: "halal gelatine", expect: "pass",
    input: recipe({ ingredients: [ing("halal beef gelatine", "10", "g")] }) },
  { name: "vegetarian rennet", expect: "pass",
    input: recipe({ ingredients: [ing("vegetarian rennet", "3", "drops")] }) },
  { name: "beef suet", expect: "pass",
    input: recipe({ ingredients: [ing("beef suet", "100", "g")] }) },
  { name: "ginger ale", expect: "pass",
    input: recipe({ ingredients: [ing("ginger ale", "200", "ml")] }) },
  { name: "alcohol-free vanilla", expect: "pass",
    input: recipe({ ingredients: [ing("alcohol-free vanilla extract", "1", "tsp")] }) },
  { name: "non-alcoholic wine substitute", expect: "pass",
    input: recipe({ ingredients: [ing("non-alcoholic white wine", "150", "ml")] }) },
  { name: "for the sake of clarity in prose", expect: "pass",
    input: recipe({ instructions: [{ step: 1, text: "For the sake of speed, use a food processor." }, { step: 2, text: "Mix." }] }) },
  { name: "blood orange", expect: "pass",
    input: recipe({ ingredients: [ing("blood orange juice", "100", "ml")] }) },
  { name: "porterhouse steak", expect: "pass",
    input: recipe({ ingredients: [ing("porterhouse steak", "1", "")] }) },
  { name: "portobello mushrooms", expect: "pass",
    input: recipe({ ingredients: [ing("portobello mushrooms", "4", "")] }) },
  { name: "black turtle beans", expect: "pass",
    input: recipe({ ingredients: [ing("black turtle beans", "400", "g")] }) },
  { name: "snake gourd", expect: "pass",
    input: recipe({ ingredients: [ing("snake gourd", "1", "")] }) },
  { name: "vine tomatoes", expect: "pass",
    input: recipe({ ingredients: [ing("vine tomatoes", "6", "")] }) },
  { name: "agar agar", expect: "pass",
    input: recipe({ ingredients: [ing("agar agar powder", "5", "g")] }) },
  { name: "malt vinegar", expect: "pass",
    input: recipe({ ingredients: [ing("malt vinegar", "2", "tbsp")] }) },
  { name: "pigeon peas", expect: "pass",
    input: recipe({ ingredients: [ing("pigeon peas", "200", "g")] }) },
  { name: "hoisin and gochujang", expect: "pass",
    input: recipe({ ingredients: [ing("hoisin sauce", "2", "tbsp"), ing("gochujang", "1", "tbsp")] }) },
  { name: "cardamom pods", expect: "pass",
    input: recipe({ ingredients: [ing("cardamom pods", "6", "")] }) },

  // Negations. A recipe that explicitly rules a term out is the model getting
  // it right; these all came from a live run rejecting correct output.
  { name: "gelatine-free ladyfingers", expect: "pass",
    input: recipe({ ingredients: [ing("gelatine-free ladyfingers", "24", "biscuits")] }) },
  { name: "pork-free sausages", expect: "pass",
    input: recipe({ ingredients: [ing("pork-free sausages", "6", "")] }) },
  { name: "no wine in the method", expect: "pass",
    input: recipe({ instructions: [{ step: 1, text: "Deglaze with stock, no wine needed." }, { step: 2, text: "Simmer." }] }) },
  { name: "grape juice instead of wine", expect: "pass",
    input: recipe({ ingredients: [ing("grape juice, instead of wine", "150", "ml")] }) },
  { name: "gluten-free beer is still beer", expect: "block",
    input: recipe({ ingredients: [ing("gluten-free beer", "330", "ml")] }) },
  { name: "free-range chicken waives nothing", expect: "block",
    input: recipe({ ingredients: [ing("free-range chicken", "1", "kg"), ing("dry white wine", "150", "ml")] }) },
];

let failed = 0;
for (const c of cases) {
  const v = findHalalViolations(c.input);
  const got = v.length > 0 ? "block" : "pass";
  const ok = got === c.expect;
  if (!ok) failed++;
  const detail = v.map((x: { rule: string; term: string; where: string }) => `${x.rule}:"${x.term}" in ${x.where}`).join("; ");
  console.log(`${ok ? "PASS" : "FAIL"}  [${c.expect.padEnd(5)}] ${c.name}${detail ? "  ->  " + detail : ""}`);
}
console.log(`\n${cases.length - failed}/${cases.length} passed, ${failed} failed`);
if (failed) process.exit(1);
