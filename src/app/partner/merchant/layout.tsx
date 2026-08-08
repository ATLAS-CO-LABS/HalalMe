import type { Metadata } from "next";

// Registration form, not a marketing page — kept out of search results.
// The public-facing page for this is /for-restaurants.
export const metadata: Metadata = {
  title: "Register Your Restaurant",
  robots: { index: false, follow: true },
};

export default function PartnerMerchantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
