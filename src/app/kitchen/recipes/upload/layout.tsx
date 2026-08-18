import type { Metadata } from "next";

// Recipe submission form, requires login — not a marketing page, kept out of
// search results (was previously inheriting /kitchen/recipes' canonical).
export const metadata: Metadata = {
  title: "Upload a Recipe",
  robots: { index: false, follow: true },
};

export default function RecipeUploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
