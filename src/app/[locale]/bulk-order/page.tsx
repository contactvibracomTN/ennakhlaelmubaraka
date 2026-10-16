import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { BulkOrderForm } from "@/components/bulk-order/bulk-order-form";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bulkOrder" });
  return buildPageMetadata({
    title: t("title"),
    description: t("intro"),
    path: `/${locale}/bulk-order`,
  });
}

/**
 * Bulk orders — dedicated page reached from "أنقر هنا" on every product sheet
 * (PO 13/10/2026). The greeting is localized per visitor language; the simple
 * form sends a pre-filled WhatsApp message (fast reply) plus an e-mail copy to
 * the boutique inbox for follow-up and records. No data is stored server-side.
 */
export default async function BulkOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("bulkOrder");

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("intro")}
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-10">
          <p className="text-center font-arabic-display text-xl font-bold leading-relaxed text-forest sm:text-2xl">
            {t("greeting")}
          </p>
          <div className="mt-8">
            <BulkOrderForm />
          </div>
        </div>
      </div>
    </>
  );
}