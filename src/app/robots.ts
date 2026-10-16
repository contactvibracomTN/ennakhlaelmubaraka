import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site.config";

/**
 * robots.txt — while `siteUrl` is empty the site must NOT be indexed
 * (Blueprint §31). Once a production URL is configured, robots allows all
 * and points to the sitemap (per-locale alternates in sitemap.ts).
 */
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.siteUrl) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
