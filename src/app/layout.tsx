import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import LayoutContent from "@/components/layout/LayoutContent";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://halalme.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/hero/halal5.jpg`;

export const metadata: Metadata = {
  title: {
    default: "HalalMe",
    template: "%s | HalalMe",
  },
  description: "Four halal services. One account. Order food, discover recipes, connect with the community and earn charity rewards.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "HalalMe",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "HalalMe" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@halalme",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
