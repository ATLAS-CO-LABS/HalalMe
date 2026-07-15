import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HalalMe Charity — Donate to Verified Islamic Charities",
  description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
  openGraph: {
    title: "HalalMe Charity — Donate to Verified Islamic Charities",
    description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
    url: "https://halalme.co.uk/charity",
    images: [{ url: "/images/page sections/rewards6.png", width: 1200, height: 630, alt: "HalalMe Charity" }],
  },
  twitter: {
    title: "HalalMe Charity — Donate to Verified Islamic Charities",
    description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
    images: ["/images/page sections/rewards6.png"],
  },
};

export default function CharityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
