import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection, routing } from "@/i18n/routing";
import { giftCategories, pick, staticProductRepository } from "@/lib/data";
import { isGiftProduct } from "@/types/product";
import type { Locale } from "@/lib/config/locales";
import { buildPageMetadata } from "@/lib/seo";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { BulkOrderCta } from "@/components/product/bulk-order-cta";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import {
  buildWhatsAppUrl,
  hasSiteUrl,
  siteConfig,
} from "@/lib/config/site.config";
import { formatMoney } from "@/types/money";

/** Pre-render every gift product in every locale (SSG). */
export async function generateStaticParams() {
  const gifts = await staticProductRepository.getGiftProducts();
  return gifts.flatMap((product) =>
    routing.locales.map((locale) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await staticProductRepository.getProductBySlug(slug);
  if (!product || !isGiftProduct(product)) return {};
  const lang = locale as Locale;
  return buildPageMetadata({
    title: pick(product.name, lang),
    description: pick(product.teaser, lang),
    path: `/${locale}/gifts/${slug}`,
    images: product.images,
  });
}

export default async function GiftDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("product");
  const tg = await getTranslations("gifts");
  const tw = await getTranslations("whatsapp");
  const localeTyped = locale as Locale;

  const product = await staticProductRepository.getProductBySlug(slug);
  if (!product || !isGiftProduct(product)) notFound();

  const name = pick(product.name, localeTyped);
  const category = giftCategories.find((c) => c.slug === product.category);
  const size = product.sizeLabel ? pick(product.sizeLabel, localeTyped) : null;
  const contents = product.contents?.map((c) => pick(c, localeTyped)) ?? [];

  const related = (await staticProductRepository.getGiftProducts())
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const orderOption = size ?? name;
  const orderHref = buildWhatsAppUrl(
    tw("orderProduct", { product: name, option: orderOption }),
    localeTyped,
  );

  const isDemo = product.contentStatus === "demo";
  const showCompareAt =
    product.compareAtPrice != null &&
    product.compareAtPrice.amount > product.price.amount &&
    !isDemo;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(hasSiteUrl
      ? { image: product.images.map((img) => `${siteConfig.siteUrl}${img}`) }
      : {}),
    description: pick(product.teaser, localeTyped),
    brand: { "@type": "Brand", name: "النخلة المباركة" },
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/gifts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-forest"
        >
          <span aria-hidden="true">
            {getDirection(locale) === "rtl" ? "\u2192" : "\u2190"}
          </span>
          {t("backToCatalog")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} alt={name} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs font-semibold text-forest">
                  {pick(category.name, localeTyped)}
                </span>
              ) : null}
              {product.occasion ? (
                <span className="rounded-full bg-gold-light/50 px-3 py-1 text-xs font-semibold text-date-deep">
                  {tg(`occasions.${product.occasion}`)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-arabic-display text-3xl font-bold leading-tight text-forest sm:text-4xl">
              {name}
            </h1>

            {size ? (
              <p className="mt-3 text-sm text-muted">
                <span className="font-semibold text-forest">{t("size")}: </span>
                {size}
              </p>
            ) : null}

            <p className="mt-5 text-base leading-relaxed text-charcoal/85">
              {pick(product.teaser, localeTyped)}
            </p>

            <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-arabic-display text-3xl font-bold text-forest">
                  {formatMoney[localeTyped](product.price.amount)}
                </p>
                {/* A crossed-out price states a fact — "this was SAR X" — and no promotion
                    has ever run at that figure, so it stays hidden while the
                    price is `demo`. `text-muted` rather than `/70`, which
                    measured 2.83:1 on white. */}
                {showCompareAt && product.compareAtPrice ? (
                  <p className="text-base text-muted line-through">
                    {formatMoney[localeTyped](product.compareAtPrice.amount)}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={orderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-success px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:flex-none"
                >
                  <WhatsAppLogo className="h-5 w-5" aria-hidden="true" />
                  {t("orderViaWhatsapp")}
                </a>
                <AddToCartButton
                  productId={product.id}
                  unavailable={product.availability === "out-of-stock"}
                />
              </div>
              {product.badges && product.badges.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gold-light/40 px-3 py-1 text-xs font-semibold text-date-deep"
                    >
                      {pick(badge, localeTyped)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {contents.length > 0 ? (
              <div className="mt-8 rounded-2xl border border-line bg-ivory-deep/40 p-6">
                <h2 className="text-sm font-semibold text-forest">
                  {t("contents")}
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-charcoal/80">
                  {contents.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

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
