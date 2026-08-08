import { recipeService } from "@/services/recipeService";
import { cldUrl } from "@/lib/cldUrl";
import type { Recipe, RecipeReview } from "@/types";
import RecipeDetailClient from "./RecipeDetailClient";

// Anonymous fetch — published recipes and their reviews are public at the
// RLS level ("Published recipes are public", "Reviews are publicly
// readable"). A null result here isn't necessarily "doesn't exist" — it
// could be the owner's own unpublished draft, which recipeService.getRecipeById
// deliberately reads via the authenticated client so the owner can see it.
// That's why this page never hard-404s on a null fetch: it always renders
// RecipeDetailClient, which retries client-side with the real session and
// has its own full loading/error/not-found handling (unchanged from before).
//
// Title/description/OG image are handled by the sibling layout.tsx's
// generateMetadata (a lighter, separate fetch) — not duplicated here.
async function getRecipe(id: string) {
  try {
    return await recipeService.getRecipeById(id);
  } catch {
    return null;
  }
}

async function getReviews(id: string) {
  try {
    return await recipeService.getReviews(id);
  } catch {
    return [];
  }
}

type IngredientRow = { name: string; amount?: string; unit?: string } | string;
type InstructionRow = { step: number; text: string } | string;

function minutesToIso8601(mins: number | null): string | undefined {
  if (!mins || mins <= 0) return undefined;
  return `PT${mins}M`;
}

// google.com/search/docs/appearance/structured-data/recipe — only emits
// fields we actually have data for for; Google ignores unknown extras but a
// wrong/empty required field can get the whole block rejected.
function buildRecipeJsonLd(recipe: Recipe, reviews: RecipeReview[], url: string) {
  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as IngredientRow[]).map((ing) =>
        typeof ing === "string" ? ing : [ing.amount, ing.unit, ing.name].filter(Boolean).join(" "),
      )
    : [];

  const steps = Array.isArray(recipe.instructions)
    ? (recipe.instructions as InstructionRow[]).map((ins) => (typeof ins === "string" ? ins : ins.text))
    : [];

  const totalMins = (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0);

  // schema.org requires absolute image URLs — cldUrl() only rewrites actual
  // Cloudinary assets and returns the input unchanged otherwise, so a local
  // /images/... path needs the origin added explicitly.
  const rawImage = recipe.image_url ? cldUrl(recipe.image_url) ?? recipe.image_url : null;
  const absoluteImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `https://halalme.co.uk${rawImage}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    image: absoluteImage ? [absoluteImage] : undefined,
    description: recipe.description ?? undefined,
    author: recipe.profiles?.username ? { "@type": "Person", name: recipe.profiles.username } : undefined,
    datePublished: recipe.created_at,
    prepTime: minutesToIso8601(recipe.prep_time_mins),
    cookTime: minutesToIso8601(recipe.cook_time_mins),
    totalTime: minutesToIso8601(totalMins),
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipe.cuisine ?? undefined,
    recipeIngredient: ingredients.length > 0 ? ingredients : undefined,
    recipeInstructions:
      steps.length > 0
        ? steps.map((text) => ({ "@type": "HowToStep", text }))
        : undefined,
    aggregateRating:
      reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
          }
        : undefined,
    url,
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, reviews] = await Promise.all([getRecipe(id), getReviews(id)]);

  return (
    <>
      {recipe && (
        <script
          type="application/ld+json"
          // JSON.stringify of a controlled schema.org object, not
          // user-supplied HTML — safe to inject directly.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildRecipeJsonLd(recipe, reviews, `https://halalme.co.uk/kitchen/recipes/${id}`),
            ),
          }}
        />
      )}
      <RecipeDetailClient id={id} initialRecipe={recipe} initialReviews={reviews} />
    </>
  );
}
