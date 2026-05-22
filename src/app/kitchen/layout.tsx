import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Halal Recipes & AI Kitchen",
  description: "Discover thousands of halal recipes and get personalised meal ideas from our AI kitchen assistant. Cook with confidence.",
  openGraph: {
    title: "Halal Recipes & AI Kitchen | HalalMe",
    description: "Discover thousands of halal recipes and get personalised meal ideas from our AI kitchen assistant. Cook with confidence.",
    url: "https://halalme.co.uk/kitchen",
    images: [{ url: "/images/hero/halal1.png", width: 1200, height: 630, alt: "HalalMe Kitchen" }],
  },
  twitter: {
    title: "Halal Recipes & AI Kitchen | HalalMe",
    description: "Discover thousands of halal recipes and get personalised meal ideas from our AI kitchen assistant. Cook with confidence.",
    images: ["/images/hero/halal1.png"],
  },
};

// /kitchen (landing page) is public.
// Sub-routes protect themselves via their own layouts.
export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="pt-14 md:pt-16">
        {children}
      </div>
    </ErrorBoundary>
  );
}
