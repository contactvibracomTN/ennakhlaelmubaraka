import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site.config";

/**
 * Web App Manifest (PWA-capable metadata, Blueprint §31).
 * Colors mirror the design tokens (ivory/forest/gold).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brand.nameAr,
    short_name: siteConfig.brand.shortAr,
    description: "تمور المدينة المنوّرة الفاخرة والهدايا",
    start_url: "/ar",
    display: "standalone",
    background_color: "#fbf5ee",
    theme_color: "#1d3826",
    dir: "rtl",
    lang: "ar-SA",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
