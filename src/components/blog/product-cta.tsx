import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import { imageAlt, pick, staticProductRepository } from "@/lib/data";
import type { Product } from "@/types/product";
import type { Locale } from "@/lib/config/locales";

/**
 * Blog product CTA (Plan §4) — resolves `post.productSlugs` against the
 * static catalog and renders a linked card grid to /dates/[slug] or
 * /gifts/[slug]. Renders nothing when no slug resolves (or the list is empty).
 * Mirrors the "linked product CTA" pattern of the guide article page.
 */
export async function ProductCta({
  productSlugs,
  locale,
  heading,
  button,
}: {
  productSlugs: string[];
  locale: Locale;
  heading: string;
  button: string;
}) {
  const products: Product[] = [];
  for (const slug of productSlugs) {
    const product = await staticProductRepository.getProductBySlug(slug);
    if (product) products.push(product);
  }
  if (products.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="blog-products-title">
      <h2
        id="blog-products-title"
        className="mb-5 font-arabic-display text-2xl font-bold text-forest"
      >
        {heading}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={
                product.kind === "date"
                  ? product.varietySlug === "ajwa"
                    ? "/dates/ajwa" // العجوة = one page (PO 2026-10)
                    : `/dates/${product.slug}`
                  : `/gifts/${product.slug}`
              }
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ivory-deep">
                <Image
                  src={product.images[0]}
                  alt={imageAlt(
                    product.imageAlts,
                    product.images[0],
                    pick(product.name, locale),
                    locale,
                  )}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-arabic-display text-lg font-bold leading-snug text-forest">
                  {pick(product.name, locale)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {pick(product.teaser, locale)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  {button}
                  <span aria-hidden="true">
                    {getDirection(locale) === "rtl" ? "\u2190" : "\u2192"}
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}