import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Centre",
  description: "Answers to common questions about ordering, accounts, Kitchen, Social, Charity and Rewards on HalalMe.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Help Centre | HalalMe",
    description: "Answers to common questions about ordering, accounts, Kitchen, Social, Charity and Rewards on HalalMe.",
    url: "https://halalme.co.uk/help",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
