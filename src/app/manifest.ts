import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HalalMe — Halal Food Delivery, Recipes and Giving",
    short_name: "HalalMe",
    description: "Order halal food, discover recipes, connect with the community and give to verified causes — all in one account.",
    start_url: "/",
    display: "standalone",
    background_color: "#102C26",
    theme_color: "#102C26",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
