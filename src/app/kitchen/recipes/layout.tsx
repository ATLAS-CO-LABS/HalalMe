import AuthGuard from "@/components/auth/AuthGuard";

// Covers /kitchen/recipes, /kitchen/recipes/[id], /kitchen/recipes/upload
export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
