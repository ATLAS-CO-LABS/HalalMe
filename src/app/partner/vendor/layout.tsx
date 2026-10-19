import type { Metadata } from "next";

// Registration form, not a marketing page - kept out of search results.
// The public-facing page for this is /marketplace/sell.
export const metadata: Metadata = {
  title: "Apply to Sell on HalalMe Marketplace",
  robots: { index: false, follow: true },
};

export default function PartnerVendorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
