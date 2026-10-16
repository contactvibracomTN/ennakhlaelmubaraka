import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticProductRepository } from "@/lib/data";
import { bankTransfer } from "@/lib/config/bank";
import { CheckoutForm } from "@/components/cart/checkout-form";

/** Checkout page (brief §38) — prototype checkout via WhatsApp. */
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("checkout");
  const products = await staticProductRepository.getAllProducts();

  return (
    <>
      <div className="border-b border-line bg-ivory-deep/40">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <h1 className="font-arabic-display text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
            {t("demoNotice")}
          </p>
        </div>
      </div>
      <CheckoutForm
        products={products}
        bank={{
          status: bankTransfer.status,
          bankName: bankTransfer.bankName,
          beneficiary: bankTransfer.accountName,
          iban: bankTransfer.ibanFormatted,
        }}
      />
    </>
  );
}
