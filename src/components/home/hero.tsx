import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Homepage hero — full-bleed photo with forest overlay, matching the
 * v2.1 hero tone ("دقّة المدينة"). CTAs are direct product-order buttons
 * (PO 13/10/2026): each leads straight to the product sheet — العجوة family
 * page (city + aaliya cards) and the Medjool sheet.
 */
export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero.jpg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/70 to-forest-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-e from-forest-deep/50 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[600px] max-w-6xl flex-col items-start justify-center px-4 py-24 sm:px-6 md:min-h-[640px]">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ivory/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-gold-light backdrop-blur-sm">
            {t("eyebrow")}
          </p>

          <h1 className="mt-6 font-arabic-display text-4xl leading-tight font-bold text-ivory sm:text-5xl md:text-6xl">
            {t("titleLine1")}
            <br />
            <span className="text-gold-light">{t("titleLine2")}</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/dates/ajwa"
              className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-forest-deep transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaOrderAjwaMedina")}
            </Link>
            <Link
              href="/dates/ajwa#ajwa-aaliya"
              className="inline-flex items-center justify-center rounded-full border border-ivory/50 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaOrderAjwaAaliya")}
            </Link>
            <Link
              href="/dates/medjool"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold/50 px-7 py-3.5 text-sm font-semibold text-gold-light transition-colors hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaOrderMedjool")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
