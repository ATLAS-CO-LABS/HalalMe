import type { MetadataRoute } from "next";
import { supabasePublic } from "@/services/supabase";

const BASE_URL = "https://halalme.co.uk";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/kitchen", priority: 0.9, changeFrequency: "daily" },
  { path: "/kitchen/recipes", priority: 0.9, changeFrequency: "daily" },
  { path: "/hub", priority: 0.9, changeFrequency: "hourly" },
  { path: "/delivery", priority: 0.8, changeFrequency: "weekly" },
  { path: "/charity", priority: 0.8, changeFrequency: "weekly" },
  { path: "/rewards", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" },
  { path: "/for-restaurants", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
  { path: "/help", priority: 0.4, changeFrequency: "monthly" },
];

// Recipes/posts/blog are user- and admin-generated, so pull the current
// published set at request time rather than hardcoding — best-effort, a
// failed query just omits that section instead of breaking the sitemap.
async function getRecipeEntries(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabasePublic
    .from("recipes")
    .select("id, updated_at")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (error || !data) return [];

  return data.map((recipe) => ({
    url: `${BASE_URL}/kitchen/recipes/${recipe.id}`,
    lastModified: recipe.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}

async function getHubPostEntries(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabasePublic
    .from("posts")
    .select("id, updated_at")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (error || !data) return [];

  return data.map((post) => ({
    url: `${BASE_URL}/hub/post/${post.id}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
}

async function getBlogEntries(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabasePublic
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (error || !data) return [];

  return data.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [recipeEntries, hubEntries, blogEntries] = await Promise.all([
    getRecipeEntries(),
    getHubPostEntries(),
    getBlogEntries(),
  ]);

  return [...staticEntries, ...recipeEntries, ...hubEntries, ...blogEntries];
}
