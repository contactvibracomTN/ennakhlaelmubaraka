import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection, routing } from "@/i18n/routing";
import { hasSiteUrl, siteConfig } from "@/lib/config/site.config";
import { buildPageMetadata } from "@/lib/seo";
import {
  dateCategories,
  pick,
  staticGuideRepository,
  staticProductRepository,
} from "@/lib/data";
import { isDateProduct } from "@/types/product";
import type { DateProduct } from "@/types/product";
import type { Locale } from "@/lib/config/locales";
import { DateProductView } from "@/components/product/date-product-view";
import { ProductCard } from "@/components/product/product-card";
import { BulkOrderCta } from "@/components/product/bulk-order-cta";

/**
 * The العجوة variety has ONE page: /dates/ajwa renders every Ajwa product as a
 * distinct card under the single العجوة name (PO 2026-10) — عجوة المدينة with
 * its three grades الفاخرة / الوسطى / الصغيرة, then عجوة العالية. The legacy
 * slugs (ajwa-medina, ajwa-small, ajwa-aaliya) redirect there (next.config.ts)
 * and are never rendered as standalone pages.
 */
const AJWA_FAMILY_SLUG = "ajwa";
const REDIRECTED_SLUGS = new Set(["ajwa-medina", "ajwa-small", "ajwa-aaliya"]);

/** Pre-render every date product in every locale (SSG) except redirected slugs. */
export async function generateStaticParams() {
  const dates = await staticProductRepository.getDateProducts();
  return dates
    .filter((product) => !REDIRECTED_SLUGS.has(product.slug))
    .flatMap((product) =>
      routing.locales.map((locale) => ({ locale, slug: product.slug })),
    );
}

/**
 * The catalogue is the only source of truth (Saudi-only since V3, PO
 * 2026-09): any non-listed slug (varieties removed from the Saudi-only
 * catalog — barhi, sayer, khalas, kabkab, rabbi, khidri, shishi, khasab…)
 * must 404 immediately instead of being rendered on demand.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await staticProductRepository.getProductBySlug(slug);
  if (!product || !isDateProduct(product)) return {};
  const lang = locale as Locale;
  return buildPageMetadata({
    title: pick(product.name, lang),
    description: pick(product.teaser, lang),
    path: `/${locale}/dates/${slug}`,
    images: product.images,
  });
}

export default async function DateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("product");
  const localeTyped = locale as Locale;

  const product = await staticProductRepository.getProductBySlug(slug);
  if (!product || !isDateProduct(product)) notFound();

  // Family page: /dates/ajwa shows every Ajwa product as a distinct card.
  const isAjwaFamily = slug === AJWA_FAMILY_SLUG;
  const allDates = await staticProductRepository.getDateProducts();
  const products: DateProduct[] = isAjwaFamily
    ? allDates
        .filter(
          (p): p is DateProduct =>
            isDateProduct(p) && p.varietySlug === AJWA_FAMILY_SLUG,
        )
        .sort((a) => (a.slug === AJWA_FAMILY_SLUG ? -1 : 1))
    : [product];

  const primary = products[0];
  const name = pick(primary.name, localeTyped);
  const variety =
    primary.varietySlug != null
      ? await staticGuideRepository.getVariety(primary.varietySlug)
      : null;

  const familyIds = new Set(products.map((p) => p.id));
  const related = allDates
    .filter((p) => !familyIds.has(p.id) && p.category === primary.category)
    .slice(0, 4);

  // JSON-LD: offers are omitted while content is demo (Blueprint §11) —
  // never emit unvalidated prices as structured data. Absolute image URLs
  // are only emitted once a production siteUrl exists.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(hasSiteUrl
      ? {
          image: primary.images.map((img) => `${siteConfig.siteUrl}${img}`),
        }
      : {}),
    description: pick(primary.teaser, localeTyped),
    brand: { "@type": "Brand", name: "النخلة المباركة" },
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/dates"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-forest"
        >
          <span aria-hidden="true">
            {getDirection(locale) === "rtl" ? "\u2192" : "\u2190"}
          </span>
          {t("backToCatalog")}
        </Link>

        {isAjwaFamily ? (
          <div className="mt-6">
            <h1 className="font-arabic-display text-3xl font-bold leading-tight text-forest sm:text-4xl">
              {t("ajwaFamilyTitle")}
            </h1>
            <div className="mt-8 grid gap-12">
              {products.map((product) => (
                <DateProductView
                  key={product.id}
                  product={product}
                  categoryName={categoryNameFor(product, localeTyped)}
                  framed
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <DateProductView
              product={primary}
              categoryName={categoryNameFor(primary, localeTyped)}
            />
          </div>
        )}

        {variety ? (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold/50 bg-gold-light/30 px-6 py-8 sm:px-10">
            <div>
              <p className="text-xs font-semibold tracking-wide text-date-soft uppercase">
                {t("fromTheGuide")}
              </p>
              <h2 className="mt-1 font-arabic-display text-2xl font-bold text-forest">
                {pick(variety.title, localeTyped)}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {pick(variety.origin, localeTyped)}
              </p>
            </div>
            <Link
              href={`/guide/${variety.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
            >
              {t("viewGuide")}
            </Link>
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-16" aria-labelledby="related-title">
            <h2
              id="related-title"
              className="font-arabic-display text-2xl font-bold text-forest"
            >
              {t("related")}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        ) : null}

        <BulkOrderCta />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

/** Localized category name for a date product (badge + details line). */
function categoryNameFor(product: DateProduct, locale: Locale): string | null {
  const category = dateCategories.find((c) => c.slug === product.category);
  return category ? pick(category.name, locale) : null;
}