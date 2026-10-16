import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { ProductCard } from "@/components/product/product-card";
import { staticProductRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { isDateProduct } from "@/types/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dates" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/dates`,
  });
}

/**
 * Dates listing (PO 13/10/2026):
 * - The العجوة family is ONE dedicated line at the top of the page — the two
 *   cards (عجوة المدينة + عجوة العالية) lead to the single /dates/ajwa sheet.
 * - Below, one compilation of every other variety, Médine first then the
 *   Kingdom. No more "تمور المدينة / تمور المملكة" sections: the origin is
 *   shown directly on each card (icon + colour, see ProductCard).
 * The category grouping that used to live here is gone; the real origin data
 * (product.category) now drives display order and the card badges.
 */
export default async function DatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dates");
  const tp = await getTranslations("product");
  const ta = await getTranslations("ajwa");
  const products = (await staticProductRepository.getDateProducts()).filter(
    isDateProduct,
  );

  // Dedicated top line: every Ajwa product (عجوة المدينة + عجوة العالية).
  const ajwaLine = products.filter((p) => p.varietySlug === "ajwa");

  // The rest — Médine first, then the Kingdom (stable sort keeps the
  // catalogue order inside each origin).
  const categoryRank: Record<string, number> = { medina: 0, kingdom: 1 };
  const others = products
    .filter((p) => p.varietySlug !== "ajwa")
    .sort(
      (a, b) => (categoryRank[a.category] ?? 2) - (categoryRank[b.category] ?? 2),
    );

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Ligne dédiée — la famille العجوة en tête de page. */}
        <section
          aria-labelledby="ajwa-catalogue-line"
          className="rounded-3xl border border-gold/40 bg-gold-light/25 p-5 sm:p-8"
        >
          <div className="mb-6 border-b border-gold/30 pb-4">
            <p className="text-xs font-semibold tracking-widest text-date-soft uppercase">
              {ta("eyebrow")}
            </p>
            <h2
              id="ajwa-catalogue-line"
              className="mt-1 font-arabic-display text-2xl font-bold text-forest sm:text-3xl"
            >
              {tp("ajwaFamilyTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {ajwaLine.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={index < 2}
              />
            ))}
          </div>
        </section>

        {/* Compilation des autres variétés — Médine puis Royaume. */}
        <section
          aria-labelledby="other-varieties-title"
          className="pt-14"
        >
          <div className="mb-6 border-b border-line pb-4">
            <h2
              id="other-varieties-title"
              className="font-arabic-display text-2xl font-bold text-forest"
            >
              {t("otherVarietiesTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {others.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}