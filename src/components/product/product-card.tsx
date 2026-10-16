import Image from "next/image";
import { MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isDateProduct } from "@/types/product";
import type { Product } from "@/types/product";
import type { Locale } from "@/lib/config/locales";
import { pick } from "@/lib/data";
import { formatMoney } from "@/types/money";
import { dateLineGradeLabel } from "@/lib/data/weight-price";

/**
 * Product card (dates + gifts). Used on the homepage and in listings.
 *
 * V3 (PO 2026-09/10): dates show their real per-kg price — the full
 * min–max range for multi-grade varieties, never a crossed-out demo price
 * and never a "starts at" phrasing (PO 2026-10). Products whose photo is not
 * yet confirmed render an honest placeholder box instead of a fake image
 * (Blueprint §11: nothing invented).
 */
export async function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const t = await getTranslations("common");
  const td = await getTranslations("dates");
  const locale = (await getLocale()) as Locale;

  const name = pick(product.name, locale);
  const teaser = pick(product.teaser, locale);
  const image = product.images[0];
  const href =
    product.kind === "date"
      ? // The Ajwa family lives on ONE page (PO 2026-10): /dates/ajwa hosts
        // every Ajwa product as a card, so عجوة العالية links straight there.
        product.varietySlug === "ajwa"
        ? "/dates/ajwa"
        : `/dates/${product.slug}`
      : `/gifts/${product.slug}`;

  // Dates: the real per-kg range across grades (min–max); gifts: box price.
  const shownPrice = isDateProduct(product)
    ? product.grades && product.grades.length > 0
      ? Math.min(...product.grades.map((g) => g.pricePerKg.amount))
      : product.weightOptions.length > 0
        ? Math.min(...product.weightOptions.map((w) => w.price.amount))
        : product.price.amount
    : product.price.amount;
  const isDemo = product.contentStatus === "demo";

  /**
   * The struck-through "was" price is only rendered for a REAL promotion.
   * V3 dates carry no compareAtPrice (real prices, no invented promo); gifts
   * show one only when the owner confirms a genuine previous price —
   * otherwise it stays hidden (a crossed-out number is a factual claim).
   *
   * `text-muted` without the `/70` opacity: at 70% on white the grey measured
   * 2.83:1, which fails WCAG AA for body text.
   */
  const showCompareAt =
    !isDateProduct(product) &&
    product.compareAtPrice != null &&
    product.compareAtPrice.amount > shownPrice &&
    !isDemo;

  // Multi-grade dates display the honest price range per kg (never "from").
  // Single-grade dates show their exact per-kg price.
  const gradePrices = isDateProduct(product)
    ? product.grades && product.grades.length > 0
      ? product.grades.map((g) => g.pricePerKg.amount)
      : null
    : null;

  const priceText = isDateProduct(product)
    ? gradePrices && gradePrices.length > 1
      ? `${formatMoney[locale](Math.min(...gradePrices))}–${formatMoney[locale](Math.max(...gradePrices))}/${t("perKg")}`
      : gradePrices
        ? `${formatMoney[locale](gradePrices[0])}/${t("perKg")}`
        : `${formatMoney[locale](shownPrice)}/${t("perKg")}`
    : formatMoney[locale](shownPrice);

  const grades = isDateProduct(product) ? product.grades ?? [] : [];
  const dateData = isDateProduct(product) ? product : null;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-deep">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1152px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          /* Photo not yet confirmed — never a placeholder fake image. */
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-[0.65rem] leading-relaxed text-muted">
            {t("photoToConfirm")}
          </div>
        )}
        {isDemo ? (
          <span className="absolute top-3 start-3 rounded-full bg-gold-light/95 px-2.5 py-1 text-[0.65rem] font-semibold text-date-deep shadow-sm">
            {t("demoBadge")}
          </span>
        ) : null}
        {/* Origin — visibly shown on every date card (PO 13/10/2026): Médine
            in forest/gold, Kingdom in bordeaux. Gifts don't carry it. */}
        {isDateProduct(product) ? (
          <span
            className={`absolute top-3 end-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold shadow-sm ${
              product.category === "medina"
                ? "bg-forest-deep/90 text-gold-light"
                : "bg-bordeaux/90 text-ivory"
            }`}
          >
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {product.category === "medina"
              ? td("originMedina")
              : td("originKingdom")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-arabic-display text-lg font-bold leading-snug text-forest">
          {name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {teaser}
        </p>
        <div className="mt-3 flex items-baseline gap-2 pt-1">
          <span className="text-sm font-semibold text-date-deep">
            {priceText}
          </span>
          {showCompareAt && product.compareAtPrice ? (
            <span className="text-xs text-muted line-through">
              {formatMoney[locale](product.compareAtPrice.amount)}
            </span>
          ) : null}
        </div>
        {dateData && grades.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {grades.map((grade) => (
              <span
                key={grade.id}
                className="rounded-full bg-ivory-deep px-2 py-0.5 text-[0.6rem] font-medium text-muted"
              >
                {dateLineGradeLabel(dateData, grade.id, locale)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}