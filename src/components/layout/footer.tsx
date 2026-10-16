import { getLocale, getTranslations } from "next-intl/server";
import { MapPin, Mail, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/layout/social-links";
import { FooterFaqAccordion } from "@/components/layout/footer-faq-accordion";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import {
  buildWhatsAppUrl,
  getAddress,
  siteConfig,
} from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";
import {
  FOOTER_CATEGORY_LINKS,
  NAV_ITEMS,
} from "@/components/navigation/nav-items";

/**
 * Site footer — brand + socials, quick links, contact channels and store
 * location. Business facts come from `siteConfig`; hours are intentionally
 * NOT shown until verified (Blueprint §11 demo-data rule).
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const tc = await getTranslations("common");
  const tl = await getTranslations("contact");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();

  const contactRows = [
    {
      icon: <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />,
      label: tl("whatsapp"),
      content: siteConfig.phoneDisplay,
      href: buildWhatsAppUrl(tw("greeting")),
      external: true,
      title: tn("whatsapp"),
    },
    {
      icon: <Mail className="h-4 w-4" aria-hidden="true" />,
      label: tl("email"),
      content: siteConfig.email,
    },
    {
      icon: <MapPin className="h-4 w-4" aria-hidden="true" />,
      label: tl("address"),
      content: getAddress(locale),
    },
  ];

  return (
    <footer className="border-t border-forest-soft/40 bg-forest-deep text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <p className="font-arabic-display text-xl font-bold leading-snug">
            {tc("brandFull")}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/70">
            {t("about")}
          </p>
          <h3 className="mt-6 text-sm font-semibold tracking-wide text-gold">
            {t("socialsTitle")}
          </h3>
          <SocialLinks className="mt-3" />
        </div>

        {/* Quick links */}
        <nav aria-label={t("quickLinks")}>
          <h3 className="text-sm font-semibold tracking-wide text-gold">
            {t("quickLinks")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex transition-colors hover:text-gold"
                >
                  {tn(item.messageKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Categories */}
        <nav aria-label={t("categories")}>
          <h3 className="text-sm font-semibold tracking-wide text-gold">
            {t("categories")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
            {FOOTER_CATEGORY_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex transition-colors hover:text-gold"
                >
                  {t(item.messageKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact + location */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-gold">
            {t("contactTitle")}
          </h3>
          <ul className="mt-4 space-y-3.5 text-sm text-ivory/85">
            {contactRows.map((row) => {
              const inner = (
                <>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ivory/20 text-gold"
                  >
                    {row.icon}
                  </span>
                  <span className="leading-relaxed">{row.content}</span>
                </>
              );
              return (
                <li key={row.label} className="flex items-start gap-3">
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.external ? "_blank" : undefined}
                      rel={row.external ? "noopener noreferrer" : undefined}
                      title={row.title}
                      className="flex items-start gap-3 transition-colors hover:text-gold"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 rounded-xl border border-ivory/15 bg-ivory/5 p-4">
            <p className="text-xs font-semibold tracking-wide text-gold">
              {t("locationTitle")}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ivory/75">
              {locale === "ar"
                ? siteConfig.address.mapLabelAr
                : siteConfig.address.mapLabelEn}
            </p>
            <p className="mt-2 text-[0.7rem] text-ivory/50">
              {tl("hoursNote")}
            </p>
            <a
              href={siteConfig.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold hover:text-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {t("openMap")}
            </a>
          </div>
        </div>
      </div>

      {/* FAQ accordion (PO 2026-09: opened by clicking the title) */}
      <FooterFaqAccordion />

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-ivory/60 sm:flex-row sm:px-6 sm:text-start">
          <p>
            © {year} {tc("brandFull")} — {t("rights")}
          </p>
          <nav aria-label={t("legal")} className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-gold"
            >
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gold">
              {t("terms")}
            </Link>
          </nav>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
