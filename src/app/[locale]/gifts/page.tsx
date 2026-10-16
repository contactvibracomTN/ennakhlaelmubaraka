import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { ProductCard } from "@/components/product/product-card";
import { giftCategories, pick, staticProductRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/config/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gifts" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/gifts`,
  });
}

/**
 * Gifts listing — grouped by the real v2.1 categories
 * (personal / occasions / date-products).
 */
export default async function GiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("gifts");
  const localeTyped = locale as Locale;
  const products = await staticProductRepository.getGiftProducts();

  const groups = giftCategories
    .map((category) => ({
      category,
      items: products.filter((p) => p.category === category.slug),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <nav
          aria-label={t("categoriesLabel")}
          className="flex flex-wrap items-center gap-2.5"
        >
          {groups.map(({ category, items }) => (
            <a
              key={category.slug}
              href={`#${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span>{pick(category.name, localeTyped)}</span>
              <span
                aria-hidden="true"
                className="rounded-full bg-ivory-deep px-2 py-0.5 text-xs text-muted"
              >
                {items.length}
              </span>
            </a>
          ))}
        </nav>

        {groups.map(({ category, items }) => (
          <section
            key={category.slug}
            id={category.slug}
            aria-labelledby={`cat-${category.slug}`}
            className="scroll-mt-24 pt-12"
          >
            <div className="mb-6 border-b border-line pb-4">
              <h2
                id={`cat-${category.slug}`}
                className="font-arabic-display text-2xl font-bold text-forest"
              >
                {pick(category.name, localeTyped)}
              </h2>
              {category.description ? (
                <p className="mt-1 max-w-2xl text-sm text-muted">
                  {pick(category.description, localeTyped)}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
