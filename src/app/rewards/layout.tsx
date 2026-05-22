import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn Rewards & Donate to Charity",
  description: "Earn points on every halal order and donate to verified Islamic charities through HalalMe Rewards. Every purchase does good.",
  openGraph: {
    title: "Earn Rewards & Donate to Charity | HalalMe",
    description: "Earn points on every halal order and donate to verified Islamic charities through HalalMe Rewards. Every purchase does good.",
    url: "https://halalme.co.uk/rewards",
    images: [{ url: "/images/page sections/rewards1.png", width: 1200, height: 630, alt: "HalalMe Rewards" }],
  },
  twitter: {
    title: "Earn Rewards & Donate to Charity | HalalMe",
    description: "Earn points on every halal order and donate to verified Islamic charities through HalalMe Rewards. Every purchase does good.",
    images: ["/images/page sections/rewards1.png"],
  },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
