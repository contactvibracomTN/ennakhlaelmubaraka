import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { pick, staticGuideRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import type { GuideRegion, GuideTexture } from "@/types/guide";
import type { Locale } from "@/lib/config/locales";

const REGION_ORDER: GuideRegion[] = [
  "maghreb",
  "mashriq",
  "gulf",
  "oman",
  "egypt",
];

const TEXTURE_KEY: Record<GuideTexture, string> = {
  soft: "soft",
  "semi-soft": "semi-soft",
  dry: "dry",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/guide`,
  });
}

/**
 * Variety guide listing — all 19 varieties grouped by region (v2.1 "fil
 * d'Ariane" style region browsing). Editorial content, no prices.
 */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guide");
  const localeTyped = locale as Locale;
  const varieties = await staticGuideRepository.getVarieties();

  const groups = REGION_ORDER.map((region) => ({
    region,
    items: varieties.filter((v) => v.region === region),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <nav
          aria-label={t("regionsLabel")}
          className="flex flex-wrap items-center gap-2.5"
        >
          {groups.map(({ region, items }) => (
            <a
              key={region}
              href={`#${region}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span>{t(`regions.${region}`)}</span>
              <span
                aria-hidden="true"
                className="rounded-full bg-ivory-deep px-2 py-0.5 text-xs text-muted"
              >
                {items.length}
              </span>
            </a>
          ))}
        </nav>

        {groups.map(({ region, items }) => (
          <section
            key={region}
            id={region}
            aria-labelledby={`region-${region}`}
            className="scroll-mt-24 pt-12"
          >
            <h2
              id={`region-${region}`}
              className="border-b border-line pb-4 font-arabic-display text-2xl font-bold text-forest"
            >
              {t(`regions.${region}`)}
            </h2>

            <ul
              className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {items.map((variety) => (
                <li key={variety.slug}>
                  <Link
                    href={`/guide/${variety.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-ivory-deep">
                      <Image
                        src={variety.image}
                        alt={pick(variety.title, localeTyped)}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 start-3 rounded-full bg-forest-deep/80 px-2.5 py-1 font-display text-xs text-gold-light">
                        {variety.number}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-arabic-display text-lg font-bold leading-snug text-forest">
                        {pick(variety.title, localeTyped).split("—")[0].trim()}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        {pick(variety.caption, localeTyped)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full bg-gold-light/50 px-2.5 py-1 text-[0.65rem] font-semibold text-date-deep">
                          {t(`textures.${TEXTURE_KEY[variety.texture]}`)}
                        </span>
                        <span className="text-[0.65rem] text-muted">
                          {pick(variety.origin, localeTyped)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
