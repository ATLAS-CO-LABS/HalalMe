import type { Metadata } from "next";

// Own metadata so this doesn't silently inherit /social's title and
// canonical (it was reporting itself as a duplicate of the /social landing
// page — see WA indexing audit).
export const metadata: Metadata = {
  title: "Community Feed",
  description: "Browse the latest posts, recipes and questions from the HalalMe community.",
  alternates: { canonical: "/social/feed" },
  openGraph: {
    title: "Community Feed | HalalMe Social",
    description: "Browse the latest posts, recipes and questions from the HalalMe community.",
    url: "https://halalme.co.uk/social/feed",
    images: [{ url: "/images/hero/halal5.webp", width: 1200, height: 630, alt: "HalalMe Social" }],
  },
  twitter: {
    title: "Community Feed | HalalMe Social",
    description: "Browse the latest posts, recipes and questions from the HalalMe community.",
    images: ["/images/hero/halal5.webp"],
  },
};

// Publicly browsable, same as /social/post/[id] — posting, liking, bookmarking
// and the Following/Saved tabs are gated individually via useAuthGate
// instead of the whole page requiring login.
export default function HubFeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
