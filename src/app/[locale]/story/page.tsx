import Image from "next/image";
import { MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { Reassurance } from "@/components/home/reassurance";
import { SocialLinks } from "@/components/layout/social-links";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import {
  buildWhatsAppUrl,
  getAddress,
  siteConfig,
} from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "story" });
  return buildPageMetadata({
    title: t("title"),
    description: t("lead"),
    path: `/${locale}/story`,
  });
}

/**
 * Story page — the boutique's origin (v2.1 copy), its values band and a
 * visit CTA with the real store address + map link.
 */
export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("story");
  const tf = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const localeTyped = locale as Locale;

  const address = getAddress(localeTyped);

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("lead")}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-ivory-deep">
            <Image
              src="/images/dates/ajwa.jpg"
              alt={t("eyebrow")}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-charcoal/85">
              {t("body1")}
            </p>
            <p className="text-base leading-relaxed text-charcoal/85">
              {t("body2")}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dates"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
              >
                {t("cta")}
              </Link>
              <a
                href={buildWhatsAppUrl(tw("greeting"), localeTyped)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-success/40 px-6 py-3 text-sm font-semibold text-success transition-colors hover:bg-success/10"
              >
                <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />
                {tn("whatsapp")}
              </a>
            </div>
          </div>
        </div>

        {/* Values — shared reassurance band */}
        <div className="mt-16">
          <h2 className="sr-only">{t("valuesTitle")}</h2>
          <Reassurance />
        </div>

        {/* Visit the store */}
        <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-gold/50 bg-gold-light/30 px-6 py-10 sm:px-10">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-forest">
              <MapPin className="h-5 w-5 text-date-deep" aria-hidden="true" />
              {t("addressLabel")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{address}</p>
            <div className="mt-3">
              <SocialLinks size="sm" />
            </div>
          </div>
          <a
            href={siteConfig.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-date-deep px-6 py-3 text-sm font-bold text-ivory transition-colors hover:bg-forest-soft"
          >
            {t("visitUs")} · {tf("getDirections")} ↗
          </a>
        </section>
      </div>
    </>
  );
}
