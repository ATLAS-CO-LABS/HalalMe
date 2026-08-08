import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halal Food Delivery Near You",
  description: "Order from 900+ certified halal restaurants near you. Fast delivery, live tracking, and £10 off your first order with code HALAL10.",
  alternates: { canonical: "/delivery" },
  openGraph: {
    title: "Halal Food Delivery Near You | HalalMe",
    description: "Order from 900+ certified halal restaurants near you. Fast delivery, live tracking, and £10 off your first order with code HALAL10.",
    url: "https://halalme.co.uk/delivery",
    images: [{ url: "/images/services/halal01.webp", width: 1200, height: 630, alt: "HalalMe Delivery" }],
  },
  twitter: {
    title: "Halal Food Delivery Near You | HalalMe",
    description: "Order from 900+ certified halal restaurants near you. Fast delivery, live tracking, and £10 off your first order with code HALAL10.",
    images: ["/images/services/halal01.webp"],
  },
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
