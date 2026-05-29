import type { Metadata } from "next";
import { cldUrl } from "@/lib/cldUrl";

// Open Graph image size convention (1.91:1).
const OG_IMG = "f_auto,q_auto,c_fill,w_1200,h_630";

// Server-rendered metadata so shared recipe links get a proper title,
// description, and image preview (the page itself is a client component
// and can't emit these tags).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fallback: Metadata = { title: "Recipe · HalalMe" };
  if (!base || !key) return fallback;

  try {
    const res = await fetch(
      `${base}/rest/v1/recipes?id=eq.${id}&select=title,description,image_url&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return fallback;

    const rows = (await res.json()) as Array<{
      title?: string;
      description?: string | null;
      image_url?: string | null;
    }>;
    const recipe = rows?.[0];
    if (!recipe?.title) return fallback;

    const title = `${recipe.title} · HalalMe`;
    const description =
      recipe.description?.trim() || "A halal recipe shared on HalalMe.";
    const image = recipe.image_url ? cldUrl(recipe.image_url, OG_IMG) : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        siteName: "HalalMe",
        images: image
          ? [{ url: image, width: 1200, height: 630, alt: recipe.title }]
          : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return fallback;
  }
}

export default function RecipeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
