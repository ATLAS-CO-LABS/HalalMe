import type { Metadata } from "next";

// Payment flow, not a marketing page — kept out of search results.
export const metadata: Metadata = {
  title: "Donate — Checkout",
  robots: { index: false, follow: true },
};

export default function CharityCheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
