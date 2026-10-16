import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { staticProductRepository } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";

/**
 * Featured products (homepage "الأكثر مبيعًا").
 * Flag-driven: the owner ticks "Mis en avant" / "Meilleure vente" in the admin
 * (PO 2026-10). While no product is flagged, the repository falls back to the
 * explicit DEMO_FEATURED_SLUGS curation — see product-repository.
 */
export async function Featured() {
  const t = await getTranslations("home");
  const featured = await staticProductRepository.getFeatured();

  return (
    <section aria-labelledby="featured-title" className="bg-ivory-deep/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-date-soft uppercase">
              {t("featuredEyebrow")}
            </p>
            <h2
              id="featured-title"
              className="mt-2 font-arabic-display text-3xl font-bold text-forest sm:text-4xl"
            >
              {t("featuredTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-muted">{t("featuredSubtitle")}</p>
          </div>
          <Link
            href="/dates"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
          {featured.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
