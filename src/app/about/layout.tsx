import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About HalalMe",
  description: "Learn about HalalMe - the platform building the UK's halal lifestyle ecosystem. Food delivery, recipes, community and charity rewards in one account.",
  openGraph: {
    title: "About HalalMe | Building the UK Halal Ecosystem",
    description: "Learn about HalalMe - the platform building the UK's halal lifestyle ecosystem. Food delivery, recipes, community and charity rewards in one account.",
    url: "https://halalme.co.uk/about",
    images: [{ url: "/images/hero/halal4.jpg", width: 1200, height: 630, alt: "About HalalMe" }],
  },
  twitter: {
    title: "About HalalMe | Building the UK Halal Ecosystem",
    description: "Learn about HalalMe - the platform building the UK's halal lifestyle ecosystem. Food delivery, recipes, community and charity rewards in one account.",
    images: ["/images/hero/halal4.jpg"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
