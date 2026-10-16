"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/cart-context";

/** Cart entry in the header — opens the sidebar cart (formule V2.1) and
 *  shows a live count badge from the cart store. */
export function CartLink() {
  const t = useTranslations("nav");
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`${t("cart")}${count > 0 ? ` (${t("cartCount")}: ${count})` : ""}`}
      title={t("cart")}
      className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-ivory-deep/60 text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-date-deep px-1 text-[0.65rem] font-bold text-ivory"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}