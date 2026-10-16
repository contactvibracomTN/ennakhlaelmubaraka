import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site.config";
import { locales, localeMeta } from "@/lib/config/locales";
import {
  staticBlogRepository,
  staticGuideRepository,
  staticProductRepository,
} from "@/lib/data";

/**
 * sitemap.xml — per-locale alternates (Blueprint §31).
 * An empty sitemap is served until a production URL is configured.
 * Cart/checkout are intentionally excluded (no SEO value).
 *
 * Detail routes matter here. The previous version listed only the 8 top-level
 * pages plus the blog articles, so the 14 date pages, 25 gift pages and 24
 * guide entries — 63 URLs per locale, 504 in total — were reachable but
 * invisible in the sitemap. They are the pages a buyer actually lands on from
 * a search, so they now get explicit entries with the right cadence:
 * catalogue pages change with the catalogue (weekly), guide entries when the
 * editorial content changes (monthly), blog posts monthly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl;
  if (!base) {
    return [];
  }

  const languages = Object.fromEntries(
    locales.map((locale) => [localeMeta[locale].bcp47, `${base}/${locale}`]),
  );

  const languageAlternates = { languages } as const;

  const topLevel = [
    "",
    "/dates",
    "/gifts",
    "/guide",
    "/blog",
    "/story",
    "/contact",
    "/faq",
    // Bulk orders — conversion page linked from every product sheet.
    "/bulk-order",
    // Legal pages — crawlable so the checkout's data collection is documented
    // where a visitor (or an auditor) can actually find it.
    "/privacy",
    "/terms",
  ];

  const posts = await staticBlogRepository.getPosts();
  const products = await staticProductRepository.getAllProducts();
  const varieties = await staticGuideRepository.getVarieties();

  /* Detail pages: one entry per real product/guide URL. Only `published` and
     `validated` items are listed — a `demo` product should not be advertised as
     a landing page, and `draft` must never reach an index. */
  const datePages = products
    .filter((p) => p.kind === "date")
    .filter(isIndexable)
    .map((p) => ({ path: `/dates/${p.slug}`, priority: 0.8 }));

  const giftPages = products
    .filter((p) => p.kind === "gift")
    .filter(isIndexable)
    .map((p) => ({ path: `/gifts/${p.slug}`, priority: 0.7 }));

  const guidePages = varieties
    .filter((v) => v.contentStatus !== "draft")
    .map((v) => ({ path: `/guide/${v.slug}`, priority: 0.6 }));

  return [
    // Root "/" resolves to the default locale (redirect) — list each locale root.
    ...locales.flatMap((locale) =>
      topLevel.map((path) => ({
        url: `${base}/${locale}${path}`,
        alternates: languageAlternates,
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : 0.8,
      })),
    ),
    /* The payment page is linked from the checkout and the footer: it has to be
       crawlable, otherwise the IBAN we went to the trouble of validating stays
       invisible to anyone who does not add to a cart. */
    ...locales.map((locale) => ({
      url: `${base}/${locale}/payment`,
      alternates: languageAlternates,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // Catalogue detail — dates, then gifts.
    ...locales.flatMap((locale) =>
      [...datePages, ...giftPages].map((page) => ({
        url: `${base}/${locale}${page.path}`,
        alternates: languageAlternates,
        changeFrequency: "weekly" as const,
        priority: page.priority,
      })),
    ),
    // Guide entries.
    ...locales.flatMap((locale) =>
      guidePages.map((page) => ({
        url: `${base}/${locale}${page.path}`,
        alternates: languageAlternates,
        changeFrequency: "monthly" as const,
        priority: page.priority,
      })),
    ),
    // Blog articles — added automatically as the dataset grows.
    ...locales.flatMap((locale) =>
      posts.map((post) => ({
        url: `${base}/${locale}/blog/${post.slug}`,
        alternates: languageAlternates,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
  ];
}

/** Only content the owner has approved belongs in a sitemap. */
function isIndexable(product: { contentStatus: string }): boolean {
  return product.contentStatus === "published" || product.contentStatus === "validated";
}