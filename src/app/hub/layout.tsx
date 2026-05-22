import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halal Community Social",
  description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
  openGraph: {
    title: "Halal Community Social | HalalMe",
    description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
    url: "https://halalme.co.uk/hub",
    images: [{ url: "/images/hero/halal5.jpg", width: 1200, height: 630, alt: "HalalMe Social" }],
  },
  twitter: {
    title: "Halal Community Social | HalalMe",
    description: "Connect with the Muslim community on HalalMe Social. Share recipes, experiences, and discover halal living tips from people like you.",
    images: ["/images/hero/halal5.jpg"],
  },
};

// Hub landing (/hub) is public. Auth is enforced per-route:
//   /hub/feed → src/app/hub/feed/layout.tsx
// Post detail (/hub/post/[id]) is intentionally public (readable without login).
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
