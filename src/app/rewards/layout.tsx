import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards — Earn Points, Redeem Perks",
  description: "Earn points across HalalMe Kitchen, Social, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
  alternates: { canonical: "/rewards" },
  openGraph: {
    title: "HalalMe Rewards — Earn Points, Redeem Perks",
    description: "Earn points across HalalMe Kitchen, Social, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
    url: "https://halalme.co.uk/rewards",
    images: [{ url: "/images/services/rewards.webp", width: 1200, height: 630, alt: "HalalMe Rewards" }],
  },
  twitter: {
    title: "HalalMe Rewards — Earn Points, Redeem Perks",
    description: "Earn points across HalalMe Kitchen, Social, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
    images: ["/images/services/rewards.webp"],
  },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
