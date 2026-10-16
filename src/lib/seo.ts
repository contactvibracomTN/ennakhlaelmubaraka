import type { Metadata } from "next";
import { getBrandName, siteConfig } from "@/lib/config/site.config";
import { localesMeta, type Locale } from "@/lib/config/locales";

/**
 * Per-page SEO — canonical + Open Graph/Twitter overrides (Blueprint §31).
 *
 * `path` is a locale-relative URL (e.g. "/ar/dates/ajwa"): Next.js
 * resolves it against `metadataBase` (siteUrl) once a production domain is
 * configured, so canonical/og:url point at the real page instead of the root.
 * Every locale also gets its OWN hreflang link to the same page in that
 * locale (page-level `alternates` replaces the layout's, so we re-emit the
 * full set here).
 * Image URLs are only emitted as absolute with that domain — same gating as
 * the JSON-LD (`hasSiteUrl`) — so no invented host ever reaches the head in
 * development.
 */
export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}): Metadata {
  const { title, description, path, images = [] } = opts;

  // "/ar/dates/ajwa" → locale "ar", suffix "/dates/ajwa".
  const [, localeCode = "ar", ...rest] = path.split("/");
  const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";
  const locale = localeCode as Locale;
  const bcp47 = localesMeta.find((m) => m.code === localeCode)?.bcp47;

  const languages = Object.fromEntries(
    localesMeta.map((m) => [m.bcp47, `/${m.code}${suffix}`]),
  );

  const absoluteImages =
    siteConfig.siteUrl.length > 0
      ? images.map((src) => `${siteConfig.siteUrl}${src}`)
      : undefined;
  const hasImages = absoluteImages != null && absoluteImages.length > 0;

  return {
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: "website",
      locale: bcp47,
      siteName: getBrandName(locale),
      title,
      description,
      url: path,
      ...(hasImages ? { images: absoluteImages } : {}),
    },
    twitter: {
      card: hasImages ? "summary_large_image" : "summary",
      ...(hasImages ? { images: absoluteImages } : {}),
    },
  };
}