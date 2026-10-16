"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/cart-context";
import { isDateProduct, type Product } from "@/types/product";
import { formatMoney } from "@/types/money";
import {
  dateLineGradeLabel,
  dateLineUnitPrice,
  formatWeightKg,
} from "@/lib/data/weight-price";
import { isFreeDeliveryEligible } from "@/lib/config/promos";
import { pick } from "@/lib/data";
import type { Locale } from "@/lib/config/locales";

/**
 * Client cart view: rows + quantity steppers + demo totals. Products come
 * from the server (single source of truth) and are resolved by id here.
 *
 * Commercial rules (PO 2026-10): NO discount at launch; the only active offer
 * is free delivery within Madinah for invoices above 200 SAR — otherwise the
 * fee (≈20 SAR in Madinah) is "confirmed in the conversation".
 */
export function CartView({ products }: { products: Product[] }) {
  const t = useTranslations("cart");
  const tp = useTranslations("product");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const { items, setQuantity, removeItem } = useCart();

  const byId = new Map(products.map((p) => [p.id, p]));

  const rows = items
    .map((item) => {
      const product = byId.get(item.productId);
      if (!product) return null;

      const name = pick(product.name, locale);
      const weightLabel =
        isDateProduct(product) && item.weightKgs != null
          ? formatWeightKg(locale, item.weightKgs, tp("kg"))
          : null;
      const gradeLabel =
        isDateProduct(product) && item.gradeId != null
          ? dateLineGradeLabel(product, item.gradeId, locale)
          : null;
      const unitPrice = isDateProduct(product)
        ? dateLineUnitPrice(product, item.weightKgs, item.gradeId)
        : product.price.amount;
      const lineTotal = unitPrice * item.quantity;
      const href =
        product.kind === "date"
          ? product.varietySlug === "ajwa"
            ? "/dates/ajwa" // العجوة = one page (PO 2026-10)
            : `/dates/${product.slug}`
          : `/gifts/${product.slug}`;
      const key = `${item.productId}::${item.weightKgs ?? "*"}::${item.gradeId ?? "*"}`;

      return {
        item,
        product,
        name,
        weightLabel,
        gradeLabel,
        unitPrice,
        lineTotal,
        href,
        key,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const subtotal = rows.reduce((sum, r) => sum + r.lineTotal, 0);
  const freeDelivery = isFreeDeliveryEligible(subtotal);

  if (items.length === 0 || rows.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ivory-deep text-date-soft">
          <ShoppingCart className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-muted">{t("empty")}</p>
        <Link
          href="/dates"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Items */}
        <ul className="space-y-4" role="list">
          {rows.map(
            ({
              item,
              name,
              weightLabel,
              gradeLabel,
              unitPrice,
              lineTotal,
              href,
              key,
              product,
            }) => (
              <li
                key={key}
                className="flex gap-4 rounded-2xl border border-line bg-white p-4"
              >
                {product.images.length > 0 ? (
                  <Link
                    href={href}
                    className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-ivory-deep"
                  >
                    <Image
                      src={product.images[0]}
                      alt={name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>
                ) : (
                  <span className="relative flex aspect-square w-24 shrink-0 items-center justify-center rounded-xl bg-ivory-deep text-center text-[0.6rem] text-muted">
                    {tc("photoToConfirm")}
                  </span>
                )}

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={href}
                        className="font-arabic-display text-base font-bold text-forest hover:text-date-deep"
                      >
                        {name}
                      </Link>
                      {weightLabel ? (
                        <p className="mt-0.5 text-xs font-medium text-date-soft">
                          {weightLabel}
                          {gradeLabel ? (
                            <span className="ms-1 rounded-full bg-ivory-deep px-2 py-0.5 text-[0.65rem] text-muted">
                              {gradeLabel}
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.productId,
                          item.gradeId ?? null,
                          item.weightKgs ?? null,
                        )
                      }
                      aria-label={t("remove")}
                      title={t("remove")}
                      className="rounded-full p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {formatMoney[locale](unitPrice)}{" "}
                    <span className="opacity-60">× {item.quantity}</span>
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.gradeId ?? null,
                            item.weightKgs ?? null,
                            item.quantity - 1,
                          )
                        }
                        aria-label={t("decrease")}
                        className="rounded-full p-2 text-forest transition-colors hover:bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span
                        aria-live="polite"
                        className="w-8 text-center text-sm font-semibold text-forest"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.gradeId ?? null,
                            item.weightKgs ?? null,
                            item.quantity + 1,
                          )
                        }
                        aria-label={t("increase")}
                        className="rounded-full p-2 text-forest transition-colors hover:bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-forest">
                      {formatMoney[locale](lineTotal)}
                    </p>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>

        {/* Summary */}
        <aside className="rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-arabic-display text-lg font-bold text-forest">
            {t("title")}
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("subtotal")}</dt>
              <dd className="font-semibold text-forest">
                {formatMoney[locale](subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd className="text-xs font-medium text-success">
                {freeDelivery
                  ? t("freeShipping")
                  : t("shippingToConfirm")}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <dt className="font-semibold text-forest">{t("total")}</dt>
              <dd className="font-arabic-display text-xl font-bold text-date-deep">
                {formatMoney[locale](subtotal)}
              </dd>
            </div>
          </dl>

          <Link
            href="/cart/checkout"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-ivory transition-colors hover:bg-forest-soft"
          >
            {t("checkout")}
          </Link>
          <p className="mt-3 text-center text-[0.65rem] text-muted">
            {tc("demoPricesBanner")}
          </p>
        </aside>
      </div>
    </div>
  );
}