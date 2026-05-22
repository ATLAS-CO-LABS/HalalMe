import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact HalalMe",
  description: "Get in touch with the HalalMe team. We're here to help with orders, restaurant partnerships, and any questions about the platform.",
  openGraph: {
    title: "Contact HalalMe | Get in Touch",
    description: "Get in touch with the HalalMe team. We're here to help with orders, restaurant partnerships, and any questions about the platform.",
    url: "https://halalme.co.uk/contact",
    images: [{ url: "/images/hero/halal5.jpg", width: 1200, height: 630, alt: "Contact HalalMe" }],
  },
  twitter: {
    title: "Contact HalalMe | Get in Touch",
    description: "Get in touch with the HalalMe team. We're here to help with orders, restaurant partnerships, and any questions about the platform.",
    images: ["/images/hero/halal5.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
