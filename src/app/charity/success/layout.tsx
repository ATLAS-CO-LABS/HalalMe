import type { Metadata } from "next";

// Post-payment receipt page, not a marketing page — kept out of search results.
export const metadata: Metadata = {
  title: "Donation Successful",
  robots: { index: false, follow: true },
};

export default function CharitySuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
