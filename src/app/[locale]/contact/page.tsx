import { Clock, Mail, MapPin, Phone, Store } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { ContactForm } from "@/components/contact/contact-form";
import { SocialLinks } from "@/components/layout/social-links";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import {
  buildWhatsAppUrl,
  getAddress,
  siteConfig,
} from "@/lib/config/site.config";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/config/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/contact`,
  });
}

/**
 * Contact page — real business channels (WhatsApp/phone/email/address)
 * plus a WhatsApp message form and the store map link.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const tf = await getTranslations("footer");
  const tw = await getTranslations("whatsapp");
  const localeTyped = locale as Locale;

  const address = getAddress(localeTyped);

  return (
    <>
      <CatalogHeader
        eyebrow={t("whatsapp")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-start">
        {/* Info cards */}
        <div className="space-y-4">
          <a
            href={buildWhatsAppUrl(tw("greeting"), localeTyped)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-gold-deep"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <WhatsAppLogo className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-forest">
                {t("whatsapp")}
              </span>
              <span className="block text-sm text-muted" dir="ltr">
                +{siteConfig.whatsappNumber}
              </span>
            </span>
          </a>

          <a
            href={`tel:${siteConfig.phoneDisplay.replace(/\s/g, "")}`}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-gold-deep"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light/60 text-date-deep">
              <Phone className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-forest">
                {t("phone")}
              </span>
              <span className="block text-sm text-muted" dir="ltr">
                {siteConfig.phoneDisplay}
              </span>
            </span>
          </a>

          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-gold-deep"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light/60 text-date-deep">
              <Mail className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-forest">
                {t("email")}
              </span>
              <span className="block text-sm text-muted" dir="ltr">
                {siteConfig.email}
              </span>
            </span>
          </a>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-forest">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-forest">
                  {t("address")}
                </span>
                <span className="block text-sm text-muted">{address}</span>
              </span>
            </div>
            <a
              href={siteConfig.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-forest/25 px-4 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
            >
              {tf("openMap")} ↗
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-forest">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-forest">
                  {t("hours")}
                </span>
                <span className="block text-sm text-muted">
                  {t("hoursNote")}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-forest">
                <Store className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-forest">
                  {t("atTheStore")}
                </span>
                <div className="mt-2">
                  <SocialLinks size="sm" />
                </div>
              </span>
            </div>
          </div>
        </div>

        {/* Message form */}
        <ContactForm />
      </div>
    </>
  );
}
