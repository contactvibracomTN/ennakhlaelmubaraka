import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { AjwaShowcase } from "@/components/home/ajwa-showcase";
import { Featured } from "@/components/home/featured";
import { Reassurance } from "@/components/home/reassurance";
import { Stats } from "@/components/home/stats";
import { GuideTeaser } from "@/components/home/guide-teaser";
import { Testimonials } from "@/components/home/testimonials";
import { StoryBand } from "@/components/home/story-band";

/**
 * Homepage (Phase 2) — assembles the data-driven sections:
 * Hero · Categories · Ajwa flagship · Featured · Reassurance · Stats(demo) ·
 * Guide teaser · Testimonials · Story band. All catalog content comes from the
 * repositories (v2.1 migration), stay "demo" flagged.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Categories />
      <AjwaShowcase />
      <Featured />
      <Reassurance />
      <Stats />
      <GuideTeaser />
      <Testimonials />
      <StoryBand />
    </>
  );
}

/**
 * The layout's canonical is the site root for the default locale (`/`), but the
 * Arabic homepage really lives at `/ar`. Without this override `/ar` declared
 * `/` as canonical, and `/` redirects back to `/ar` — a redirect loop that told
 * search engines the page had no canonical form of its own.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return buildPageMetadata({
    title: t("defaultTitle"),
    description: t("description"),
    path: `/${locale}`,
  });
}
