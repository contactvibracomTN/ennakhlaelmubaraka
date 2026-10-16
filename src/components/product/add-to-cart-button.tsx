"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/cart-context";

/** Add-to-cart button for gift products (single option, no weights). */
export function AddToCartButton({
  productId,
  unavailable = false,
}: {
  productId: string;
  unavailable?: boolean;
}) {
  const t = useTranslations("product");
  const { addItem, openCart } = useCart();

  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={() => {
        addItem({ productId, kind: "gift" });
        openCart();
      }}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/30 px-6 py-4 text-sm font-semibold text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:flex-none"
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {t("addToCart")}
    </button>
  );
}
