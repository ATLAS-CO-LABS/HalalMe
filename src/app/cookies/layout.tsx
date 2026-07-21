import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | HalalMe",
  description: "How HalalMe uses cookies and similar technologies.",
  openGraph: {
    title: "Cookie Policy | HalalMe",
    description: "How HalalMe uses cookies and similar technologies.",
    url: "https://halalme.co.uk/cookies",
  },
  robots: { index: true, follow: true },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
