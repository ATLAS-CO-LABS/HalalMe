import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charity — Donate to Verified Islamic Charities",
  description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
  alternates: { canonical: "/charity" },
  openGraph: {
    title: "HalalMe Charity — Donate to Verified Islamic Charities",
    description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
    url: "https://halalme.co.uk/charity",
    images: [{ url: "/images/page sections/rewards6.webp", width: 1200, height: 630, alt: "HalalMe Charity" }],
  },
  twitter: {
    title: "HalalMe Charity — Donate to Verified Islamic Charities",
    description: "Give sadaqah and zakat to verified Islamic charities through HalalMe Charity. Direct payments, instant receipts, and a full record of your impact.",
    images: ["/images/page sections/rewards6.webp"],
  },
};

export default function CharityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
