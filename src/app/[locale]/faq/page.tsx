import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/config/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/faq`,
  });
}

/**
 * FAQ page — the five Q&A pairs migrated verbatim from the v2.1 reference
 * (delivery, WhatsApp ordering, indicative prices, gift wrapping, varieties).
 */
export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const localeTyped = locale as Locale;

  const items = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-line bg-white p-5 open:border-gold-deep open:bg-gold-light/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-arabic-display text-base font-bold text-forest marker:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-date-deep transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 rounded-3xl border border-gold/50 bg-gold-light/30 px-6 py-8 text-center">
          <p className="text-sm text-muted">{t("cta")}</p>
          <a
            href={buildWhatsAppUrl(tw("greeting"), localeTyped)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-soft"
          >
            <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />
            {tn("whatsapp")}
          </a>
        </div>
      </div>
    </>
  );
}
