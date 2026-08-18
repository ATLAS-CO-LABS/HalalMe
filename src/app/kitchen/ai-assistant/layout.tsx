import type { Metadata } from "next";
import AuthGuard from "@/components/auth/AuthGuard";

// Requires login (AuthGuard redirects to /login) — not a marketing page,
// kept out of search results (was previously inheriting /kitchen's canonical).
export const metadata: Metadata = {
  title: "AI Cooking Assistant",
  robots: { index: false, follow: true },
};

export default function AiAssistantLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
