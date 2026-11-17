import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import {
  dateCategories,
  dateProducts,
  giftCategories,
  giftProducts,
  pick,
} from "@/lib/data";
import type { Locale } from "@/lib/config/locales";

/**
 * Homepage category cards — Dates / Miscellaneous products / Sweets.
 * Images and counts are real data-layer values — nothing invented
 * (Blueprint §11). The third card is a shortcut to the الحلويات family inside
 * the « منتوجات مختلفة » section (PO 2026-11). When a product has no photo
 * yet, the card renders the same honest "photo to confirm" placeholder as the
 * product cards instead of a fake image.
 */
export async function Categories() {
  const t = await getTranslations("home");
  const th = await getTranslations("dates");
  const tg = await getTranslations("gifts");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const forward = getDirection(locale) === "rtl" ? "\u2190" : "\u2192";

  // الحلويات — the sweets family of the « منتوجات مختلفة » section.
  const sweets = giftProducts.filter((p) => p.category === "sweets");
  const sweetsCategory = giftCategories.find((c) => c.slug === "sweets");

  const cards = [
    {
      href: "/dates",
      title: th("title"),
      subtitle: th("subtitle"),
      countText: t("countDates", { count: dateProducts.length }),
      image:
        dateCategories.find((c) => c.slug === "medina")?.image ??
        "/images/dates/ajwa.jpg",
    },
    {
      href: "/gifts",
      title: tg("title"),
      subtitle: tg("subtitle"),
      countText: t("countGifts", { count: giftProducts.length }),
      image: giftProducts[0]?.images[0] ?? null,
    },
    {
      href: "/gifts#sweets",
      title: t("sweetsTitle"),
      subtitle: sweetsCategory?.description
        ? pick(sweetsCategory.description, locale)
        : tg("subtitle"),
      countText: t("countGifts", { count: sweets.length }),
      image: sweets[0]?.images[0] ?? null,
    },
  ];

  return (
    <section aria-labelledby="categories-title" className="bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold tracking-widest text-date-soft uppercase">
            {t("categoriesEyebrow")}
          </p>
          <h2
            id="categories-title"
            className="mt-2 font-arabic-display text-3xl font-bold text-forest sm:text-4xl"
          >
            {t("categoriesTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            {t("categoriesSubtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative block overflow-hidden rounded-3xl border border-line shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <div className="relative aspect-[4/5] w-full">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-ivory-deep p-6 text-center text-xs leading-relaxed text-muted">
                    {tc("photoToConfirm")}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold tracking-wide text-gold-light">
                  {card.countText}
                </p>
                <h3 className="mt-1 font-arabic-display text-2xl font-bold text-ivory">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ivory/80 line-clamp-2">
                  {card.subtitle}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                  {t("explore")}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                  >
                    {forward}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
