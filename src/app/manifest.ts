import type { MetadataRoute } from "next";
import { SITE_SEO, SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_SEO.name,
    short_name: "Rajput Events",
    description: SITE_SEO.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0B1736",
    theme_color: "#0B1736",
    lang: "en-PK",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["business", "lifestyle"],
    id: SITE_URL,
  };
}
