import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halal Community Social",
  description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
  alternates: { canonical: "/social" },
  openGraph: {
    title: "Halal Community Social | HalalMe",
    description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
    url: "https://halalme.co.uk/social",
    images: [{ url: "/images/hero/halal5.webp", width: 1200, height: 630, alt: "HalalMe Social" }],
  },
  twitter: {
    title: "Halal Community Social | HalalMe",
    description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
    images: ["/images/hero/halal5.webp"],
  },
};

// Social landing (/social) is public. Auth is enforced per-route:
//   /social/feed → src/app/social/feed/layout.tsx
// Post detail (/social/post/[id]) is intentionally public (readable without login).
export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
