import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { GiftRequestForm } from "@/components/gift-request/gift-request-form";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "giftRequest" });
  return buildPageMetadata({
    title: t("title"),
    description: t("intro"),
    path: `/${locale}/gift-request`,
  });
}

export default async function GiftRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("giftRequest");

  return (
    <>
      <CatalogHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} />

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-10">
          <p className="text-center font-arabic-display text-xl font-bold leading-relaxed text-forest sm:text-2xl">
            {t("greeting")}
          </p>
          <div className="mt-8">
            <GiftRequestForm />
          </div>
        </div>
      </div>
    </>
  );
}
