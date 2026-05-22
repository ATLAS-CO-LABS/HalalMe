import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner With HalalMe",
  description: "Join HalalMe and reach halal-seeking customers across the UK. Simple onboarding, fair commission, and payouts every 3 days.",
  openGraph: {
    title: "Partner With HalalMe | Halal Restaurant Platform UK",
    description: "Join HalalMe and reach halal-seeking customers across the UK. Simple onboarding, fair commission, and payouts every 3 days.",
    url: "https://halalme.co.uk/for-restaurants",
    images: [{ url: "/images/hero/halal3.jpg", width: 1200, height: 630, alt: "Partner with HalalMe" }],
  },
  twitter: {
    title: "Partner With HalalMe | Halal Restaurant Platform UK",
    description: "Join HalalMe and reach halal-seeking customers across the UK. Simple onboarding, fair commission, and payouts every 3 days.",
    images: ["/images/hero/halal3.jpg"],
  },
};

export default function ForRestaurantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
