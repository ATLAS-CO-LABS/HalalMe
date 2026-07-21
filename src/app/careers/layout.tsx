import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | HalalMe",
  description: "We're not actively hiring right now, but we'd love to hear from people who want to build the UK's halal lifestyle ecosystem.",
  openGraph: {
    title: "Careers | HalalMe",
    description: "We're not actively hiring right now, but we'd love to hear from people who want to build the UK's halal lifestyle ecosystem.",
    url: "https://halalme.co.uk/careers",
    images: [{ url: "/images/hero/halal4.jpg", width: 1200, height: 630, alt: "Careers at HalalMe" }],
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
