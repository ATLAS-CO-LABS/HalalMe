import type { MetadataRoute } from "next";

const BASE_URL = "https://halalme.co.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/messages",
        "/profile",
        "/select-role",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-otp",
        "/complete-profile",
        // Phase 2 — blocked at the middleware level too, kept out of the index.
        "/fresh",
        "/travel",
        "/marketplace",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
