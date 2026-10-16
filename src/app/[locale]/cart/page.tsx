import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticProductRepository } from "@/lib/data";
import { CartView } from "@/components/cart/cart-view";

/**
 * Cart page (brief §37) — client view hydrated with the resolved catalog,
 * so pricing/names never drift from the data layer.
 */
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("cart");
  const products = await staticProductRepository.getAllProducts();

  return (
    <>
      <div className="border-b border-line bg-ivory-deep/40">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <h1 className="font-arabic-display text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h1>
        </div>
      </div>
      <CartView products={products} />
    </>
  );
}
