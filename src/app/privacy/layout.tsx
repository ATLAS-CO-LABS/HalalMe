import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | HalalMe",
  description: "How HalalMe collects, uses, and protects your personal data under UK GDPR and the Data Protection Act 2018.",
  openGraph: {
    title: "Privacy Policy | HalalMe",
    description: "How HalalMe collects, uses, and protects your personal data under UK GDPR and the Data Protection Act 2018.",
    url: "https://halalme.co.uk/privacy",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
