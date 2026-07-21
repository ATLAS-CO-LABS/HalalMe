import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | HalalMe",
  description: "The terms governing your use of HalalMe's delivery, kitchen, community, charity and rewards services.",
  openGraph: {
    title: "Terms of Service | HalalMe",
    description: "The terms governing your use of HalalMe's delivery, kitchen, community, charity and rewards services.",
    url: "https://halalme.co.uk/terms",
  },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
