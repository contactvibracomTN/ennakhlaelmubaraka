import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { buildPageMetadata } from "@/lib/seo";
import { BankDetailsCard } from "@/components/bank/bank-details-card";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Payment / bank transfer — the permanent, indexable home of the IBAN. */
export default async function PaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("payment");

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

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
        <BankDetailsCard />

        <section
          aria-labelledby="how-to-pay-title"
          className="rounded-3xl border border-line bg-ivory p-6"
        >
          <h2
            id="how-to-pay-title"
            className="font-arabic-display text-lg font-bold text-forest"
          >
            {t("stepsTitle")}
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li>1. {t("step1")}</li>
            <li>2. {t("step2")}</li>
            <li>3. {t("step3")}</li>
            <li>4. {t("step4")}</li>
          </ol>
        </section>

        {/* No online payment exists yet — say so rather than leaving a customer
            to hunt for a card form that was never built. */}
        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="font-arabic-display text-lg font-bold text-forest">
            {t("noOnlineTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t("noOnlineBody")}
          </p>
        </section>
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
  const t = await getTranslations({ locale, namespace: "payment" });
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: `/${locale}/payment`,
  });
}