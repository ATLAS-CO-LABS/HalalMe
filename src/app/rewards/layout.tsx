import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HalalMe Rewards — Earn Points, Redeem Perks",
  description: "Earn points across HalalMe Kitchen, Hub, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
  openGraph: {
    title: "HalalMe Rewards — Earn Points, Redeem Perks",
    description: "Earn points across HalalMe Kitchen, Hub, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
    url: "https://halalme.co.uk/rewards",
    images: [{ url: "/images/services/rewards.png", width: 1200, height: 630, alt: "HalalMe Rewards" }],
  },
  twitter: {
    title: "HalalMe Rewards — Earn Points, Redeem Perks",
    description: "Earn points across HalalMe Kitchen, Hub, and Charity, then redeem them for profile flair, boosts, and AI power-ups.",
    images: ["/images/services/rewards.png"],
  },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
