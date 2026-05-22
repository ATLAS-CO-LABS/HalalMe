import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halal Living Blog",
  description: "Explore halal recipes, Muslim community stories, lifestyle tips and more on the HalalMe blog.",
  openGraph: {
    title: "Halal Living Blog | HalalMe",
    description: "Explore halal recipes, Muslim community stories, lifestyle tips and more on the HalalMe blog.",
    url: "https://halalme.co.uk/blog",
    images: [{ url: "/images/hero/halal2.jpg", width: 1200, height: 630, alt: "HalalMe Blog" }],
  },
  twitter: {
    title: "Halal Living Blog | HalalMe",
    description: "Explore halal recipes, Muslim community stories, lifestyle tips and more on the HalalMe blog.",
    images: ["/images/hero/halal2.jpg"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
