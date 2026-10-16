import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type TermsSection = { heading: string; body: string };

/**
 * Terms of use — the shop sells via conversation (WhatsApp) and bank transfer:
 * no online payment, no fixed delivery timelines, prices confirmed in chat.
 * The page states what the site actually does, nothing more.
 */
export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("terms");
  const sections = t.raw("sections") as TermsSection[];

  return (
    <>
      <div className="border-b border-line bg-ivory-deep/40">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="font-arabic-display text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {t("intro")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6">
        {sections.map((section, i) => (
          <section
            key={i}
            className="rounded-3xl border border-line bg-ivory p-6"
          >
            <h2 className="font-arabic-display text-lg font-bold text-forest">
              {section.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: `/${locale}/terms`,
  });
}