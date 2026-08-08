import type { Metadata } from "next";
import { recipeService } from "@/services/recipeService";
import RecipesClient from "./RecipesClient";

// Re-fetch at most every 5 minutes so new recipes show up without a full
// redeploy, matching the revalidate window already used for recipe metadata.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Explore Recipes",
  description: "Browse halal recipes shared by the HalalMe community — filter by cuisine and difficulty, save favourites, or upload your own.",
  alternates: { canonical: "/kitchen/recipes" },
  openGraph: {
    title: "Explore Recipes | HalalMe Kitchen",
    description: "Browse halal recipes shared by the HalalMe community — filter by cuisine and difficulty, save favourites, or upload your own.",
    url: "https://halalme.co.uk/kitchen/recipes",
  },
};

// Only seeds the default (unfiltered, page 1) view — search/filter/tabs/
// pagination all still run client-side exactly as before, in RecipesClient.
export default async function RecipesPage() {
  let initialRecipes: Awaited<ReturnType<typeof recipeService.getRecipes>>["data"] = [];
  let initialHasMore = false;

  try {
    const result = await recipeService.getRecipes({ page: 1 });
    initialRecipes = result.data;
    initialHasMore = result.hasMore;
  } catch (err) {
    console.error("[kitchen/recipes] server fetch failed", err);
  }

  return <RecipesClient initialRecipes={initialRecipes} initialHasMore={initialHasMore} />;
}
