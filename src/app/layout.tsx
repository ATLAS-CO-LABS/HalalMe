import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { preload } from "react-dom";

import LayoutContent from "@/components/layout/LayoutContent";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Runs before hydration so a themed route (/social, /kitchen, /delivery)
// with a stored "light" preference never flashes dark first. Every other
// route is left untouched (no attribute → CSS default → dark), matching the
// platform's baseline hardcoded colors.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var themed = ["/social", "/kitchen", "/delivery"].some(function (p) {
      return window.location.pathname.startsWith(p);
    });
    var stored = window.localStorage.getItem("hm-theme");
    var theme = themed && (stored === "light" || stored === "dark") ? stored : "dark";
    document.documentElement.setAttribute("data-hm-theme", theme);
  } catch (e) {}
})();
`;

const BASE_URL = "https://halalme.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-share.jpg`;

export const metadata: Metadata = {
  title: {
    default: "HalalMe — Halal Food Delivery, Recipes and Giving in the UK",
    template: "%s | HalalMe",
  },
  description: "Five halal services, one account. Order food, discover recipes, connect on Social, give through Charity and earn Rewards.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
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

// sameAs deliberately omitted — the footer's social icons are still
// href="#" placeholders (not this item's scope to fix), and a fabricated
// profile URL is worse for a search engine to trust than no sameAs at all.
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HalalMe",
  url: BASE_URL,
  logo: `${BASE_URL}/logo/logo.png`,
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HalalMe",
  url: BASE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Body font (Unbounded) Latin files, fetched in parallel with the CSS instead
  // of after it. Regular + Medium cover nearly all text on every page.
  preload("/fonts/woff2/Unbounded-Regular-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/woff2/Unbounded-Medium-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <Script
          id="hm-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider>
                <LayoutContent>{children}</LayoutContent>
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
