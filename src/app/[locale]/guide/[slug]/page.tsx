import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection, routing } from "@/i18n/routing";
import {
  pick,
  staticGuideRepository,
  staticProductRepository,
} from "@/lib/data";
import { hasSiteUrl, siteConfig } from "@/lib/config/site.config";
import { buildPageMetadata } from "@/lib/seo";
import type { GuideTexture } from "@/types/guide";
import type { Locale } from "@/lib/config/locales";

const TEXTURE_KEY: Record<GuideTexture, string> = {
  soft: "soft",
  "semi-soft": "semi-soft",
  dry: "dry",
};

/** Pre-render every variety page in every locale (SSG). */
export async function generateStaticParams() {
  const varieties = await staticGuideRepository.getVarieties();
  return varieties.flatMap((variety) =>
    routing.locales.map((locale) => ({ locale, slug: variety.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const variety = await staticGuideRepository.getVariety(slug);
  if (!variety) return {};
  const lang = locale as Locale;
  return buildPageMetadata({
    title: pick(variety.title, lang),
    description: pick(variety.caption, lang),
    path: `/${locale}/guide/${slug}`,
    images: [variety.image],
  });
}

export default async function GuideVarietyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guide");
  const tp = await getTranslations("product");
  const localeTyped = locale as Locale;

  const varieties = await staticGuideRepository.getVarieties();
  const variety = varieties.find((v) => v.slug === slug) ?? null;
  if (!variety) notFound();

  const index = varieties.findIndex((v) => v.slug === slug);
  const prev = index > 0 ? varieties[index - 1] : null;
  const next = index < varieties.length - 1 ? varieties[index + 1] : null;

  const linkedProduct = variety.productSlug
    ? await staticProductRepository.getProductBySlug(variety.productSlug)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pick(variety.title, localeTyped),
    description: pick(variety.caption, localeTyped),
    ...(hasSiteUrl ? { image: `${siteConfig.siteUrl}${variety.image}` } : {}),
    articleSection: t(`regions.${variety.region}`),
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-forest"
          >
            <span aria-hidden="true">
              {getDirection(locale) === "rtl" ? "\u2192" : "\u2190"}
            </span>
            {t("backToList")}
          </Link>
          <span className="font-display text-3xl text-date-soft/40">
            {variety.number}
          </span>
        </div>

        {/* Editorial header */}
        <header className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-line bg-ivory-deep">
            <Image
              src={variety.image}
              alt={pick(variety.title, localeTyped)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs font-semibold text-forest">
                {t(`regions.${variety.region}`)}
              </span>
              <span className="rounded-full bg-gold-light/50 px-3 py-1 text-xs font-semibold text-date-deep">
                {t(`textures.${TEXTURE_KEY[variety.texture]}`)}
              </span>
            </div>

            <h1 className="mt-4 font-arabic-display text-3xl font-bold leading-tight text-forest sm:text-4xl">
              {pick(variety.title, localeTyped)}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-date-deep/90">
              {pick(variety.caption, localeTyped)}
            </p>
            <p className="mt-2 text-sm text-muted">
              {pick(variety.origin, localeTyped)}
            </p>

            <p
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory-deep/50 px-3 py-1.5 text-xs text-muted"
              title={t("regionInformational")}
            >
              {t("showingPrice")}: {variety.displayPrice}
            </p>
          </div>
        </header>

        {/* Intro */}
        <section
          className="mt-14 max-w-3xl"
          aria-label={pick(variety.title, localeTyped)}
        >
          <p className="text-lg leading-relaxed text-charcoal/85">
            {pick(variety.intro, localeTyped)}
          </p>
        </section>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Timeline */}
          <section aria-labelledby="timeline-title">
            <h2
              id="timeline-title"
              className="font-arabic-display text-2xl font-bold text-forest"
            >
              {t("timeline")}
            </h2>
            <ol className="mt-6 space-y-0" role="list">
              {variety.timeline.map((event, i) => (
                <li
                  key={i}
                  className="relative border-s border-line ps-6 pb-6 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="absolute start-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-gold-deep"
                  />
                  <p className="text-sm font-semibold text-forest">
                    {pick(event.label, localeTyped)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {pick(event.text, localeTyped)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Strengths + taste */}
          <div className="space-y-10">
            <section aria-labelledby="strengths-title">
              <h2
                id="strengths-title"
                className="font-arabic-display text-2xl font-bold text-forest"
              >
                {t("strengths")}
              </h2>
              <ul className="mt-5 space-y-3" role="list">
                {variety.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm text-charcoal/85"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
                    />
                    {pick(strength, localeTyped)}
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="taste-title"
              className="rounded-3xl border border-gold/50 bg-gold-light/30 p-6"
            >
              <h2
                id="taste-title"
                className="font-arabic-display text-2xl font-bold text-forest"
              >
                {t("taste")}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-charcoal/85">
                {pick(variety.taste, localeTyped)}
              </p>
            </section>
          </div>
        </div>

        {/* Nutrition */}
        <section className="mt-14" aria-labelledby="nutrition-title">
          <h2
            id="nutrition-title"
            className="font-arabic-display text-2xl font-bold text-forest"
          >
            {t("nutrition")}
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {variety.nutrition.map((fact, i) => (
              <div key={i} className="bg-white p-5">
                <dt className="text-xs text-muted">
                  {pick(fact.label, localeTyped)}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-forest">
                  {pick(fact.value, localeTyped)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Indicative prices — informational only */}
        <section className="mt-14" aria-labelledby="prices-title">
          <h2
            id="prices-title"
            className="font-arabic-display text-2xl font-bold text-forest"
          >
            {t("prices")}
          </h2>
          <p className="mt-2 text-xs text-muted">{t("regionInformational")}</p>
          <dl className="mt-5 max-w-2xl divide-y divide-line rounded-2xl border border-line bg-white">
            {variety.prices.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <dt className="text-sm text-muted">
                  {pick(row.label, localeTyped)}
                </dt>
                <dd className="text-sm font-semibold text-forest">
                  {pick(row.value, localeTyped)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Resources */}
        {variety.resources.length > 0 ? (
          <section className="mt-14" aria-labelledby="resources-title">
            <h2
              id="resources-title"
              className="font-arabic-display text-2xl font-bold text-forest"
            >
              {t("resources")}
            </h2>
            <ul className="mt-5 space-y-2.5 max-w-2xl" role="list">
              {variety.resources.map((resource, i) => (
                <li key={i}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-success underline decoration-success/40 underline-offset-4 transition-colors hover:text-forest-soft hover:decoration-forest-soft"
                  >
                    {pick(resource.label, localeTyped)}
                    <span aria-hidden="true" className="text-xs">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Linked product CTA */}
        {linkedProduct ? (
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-forest px-6 py-8 text-ivory sm:px-10">
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-gold-light">
                {tp("fromTheGuide")}
              </p>
              <h2 className="mt-1 font-arabic-display text-2xl font-bold">
                {pick(linkedProduct.name, localeTyped)}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-ivory/70">
                {pick(linkedProduct.teaser, localeTyped)}
              </p>
            </div>
            <Link
              href={
                linkedProduct.kind === "date"
                  ? `/dates/${linkedProduct.slug}`
                  : `/gifts/${linkedProduct.slug}`
              }
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-deep transition-colors hover:bg-gold-light"
            >
              {t("buyThis")}
            </Link>
          </div>
        ) : null}

        {/* Prev / next */}
        <nav
          aria-label={pick(variety.title, localeTyped)}
          className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8"
        >
          {prev ? (
            <Link
              href={`/guide/${prev.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-forest"
            >
              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
              >
                {getDirection(locale) === "rtl" ? "\u2192" : "\u2190"}
              </span>
              <span>
                <span className="block text-[0.65rem] uppercase text-date-soft">
                  {t("prev")}
                </span>
                <span className="font-semibold">
                  {pick(prev.title, localeTyped).split("—")[0].trim()}
                </span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/guide/${next.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-forest"
            >
              <span className="text-end">
                <span className="block text-[0.65rem] uppercase text-date-soft">
                  {t("next")}
                </span>
                <span className="font-semibold">
                  {pick(next.title, localeTyped).split("—")[0].trim()}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              >
                {getDirection(locale) === "rtl" ? "\u2190" : "\u2192"}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
