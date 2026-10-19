"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/context/cart-context";
import { getCatalogProduct } from "@/lib/data/client-catalog";
import { formatMoney } from "@/types/money";
import {
  dateLineGradeLabel,
  dateLineUnitPrice,
  formatWeightKg,
} from "@/lib/data/weight-price";
import { imageAlt, pick } from "@/lib/data";
import type { Locale } from "@/lib/config/locales";

/**
 * Sidebar cart (formule V2.1) — tiroir latéral qui s'ouvre au clic sur
 * « Ajouter au panier » ou sur l'icône panier de l'en-tête. Les lignes sont
 * résolues côté client via le catalogue (mêmes datasets que le serveur).
 */
export function CartDrawer() {
  const t = useTranslations("cart");
  const tp = useTranslations("product");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, setQuantity, removeItem } = useCart();

  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isRtl = locale === "ar" || locale === "ur";

  // Slide-in animation trigger (le tiroir est démonté quand fermé, donc
  // `mounted` repart de false à chaque ouverture).
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setMounted(true));
    closeRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const rows = items
    .map((item) => {
      const product = getCatalogProduct(item.productId);
      if (!product) return null;
      return {
        item,
        product,
        name: pick(product.name, locale),
        key: `${item.productId}::${item.weightKgs ?? "*"}::${item.gradeId ?? "*"}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const subtotal = rows.reduce((sum, row) => {
    const product = row.product;
    const unitPrice =
      product.kind === "date"
        ? dateLineUnitPrice(product, row.item.weightKgs, row.item.gradeId)
        : product.price.amount;
    return sum + unitPrice * row.item.quantity;
  }, 0);

  if (!isOpen) return null;

  const hidden = mounted ? "" : isRtl ? "-translate-x-full" : "translate-x-full";

  return (
    <div role="dialog" aria-modal="true" aria-label={t("title")}>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-forest-deep/60 backdrop-blur-sm transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ${hidden}`}
      >
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 font-arabic-display text-lg font-bold text-forest">
            <ShoppingCart className="h-5 w-5 text-date-deep" aria-hidden="true" />
            {t("title")}
            <span className="rounded-full bg-gold-light/50 px-2 py-0.5 text-xs font-semibold text-date-deep">
              {items.length}
            </span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label={tc("dialogClose")}
            className="rounded-full p-2 text-muted transition-colors hover:bg-ivory-deep hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory-deep text-date-soft">
              <ShoppingCart className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="text-muted">{t("empty")}</p>
            <Link
              href="/dates"
              onClick={closeCart}
              className="inline-flex items-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
            >
              {t("continueShopping")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="list">
              {rows.map(({ item, product, name, key }) => {
                const href =
                  product.kind === "date"
                    ? product.varietySlug === "ajwa"
                      ? "/dates/ajwa" // العجوة = one page (PO 2026-10)
                      : `/dates/${product.slug}`
                    : `/gifts/${product.slug}`;
                const weightLabel =
                  product.kind === "date" && item.weightKgs != null
                    ? formatWeightKg(locale, item.weightKgs, tp("kg"))
                    : null;
                const gradeLabel =
                  product.kind === "date" && item.gradeId != null
                    ? dateLineGradeLabel(product, item.gradeId, locale)
                    : null;
                const unitPrice =
                  product.kind === "date"
                    ? dateLineUnitPrice(product, item.weightKgs, item.gradeId)
                    : product.price.amount;
                const lineTotal = unitPrice * item.quantity;
                return (
                  <li
                    key={key}
                    className="flex gap-3 rounded-2xl border border-line bg-white p-3"
                  >
                    {product.images.length > 0 ? (
                      <Link
                        href={href}
                        onClick={closeCart}
                        className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-ivory-deep"
                      >
                        <Image
                          src={product.images[0]}
                          alt={imageAlt(
                            product.imageAlts,
                            product.images[0],
                            name,
                            locale,
                          )}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                    ) : (
                      <span className="relative flex aspect-square w-20 shrink-0 items-center justify-center rounded-xl bg-ivory-deep text-center text-[0.55rem] text-muted">
                        {tc("photoToConfirm")}
                      </span>
                    )}

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={href}
                            onClick={closeCart}
                            className="font-arabic-display text-sm font-bold text-forest hover:text-date-deep"
                          >
                            {name}
                          </Link>
                          {weightLabel ? (
                            <p className="mt-0.5 text-xs font-medium text-date-soft">
                              {weightLabel}
                              {gradeLabel ? (
                                <span className="ms-1 rounded-full bg-ivory-deep px-2 py-0.5 text-[0.6rem] text-muted">
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

                      <div className="mt-auto flex items-end justify-between pt-2">
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
                            className="rounded-full p-1.5 text-forest transition-colors hover:bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span
                            aria-live="polite"
                            className="w-7 text-center text-sm font-semibold text-forest"
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
                            className="rounded-full p-1.5 text-forest transition-colors hover:bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-forest">
                          {formatMoney[locale](unitPrice)}{" "}
                          <span className="text-muted/70">
                            × {item.quantity}
                          </span>
                          <span className="block text-[0.7rem] text-muted">
                            {formatMoney[locale](lineTotal)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-line bg-white px-5 py-4">
              <dl className="flex items-center justify-between text-sm">
                <dt className="text-muted">{t("subtotal")}</dt>
                <dd className="font-arabic-display text-lg font-bold text-forest">
                  {formatMoney[locale](subtotal)}
                </dd>
              </dl>
              <Link
                href="/cart/checkout"
                onClick={closeCart}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-success px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-forest-soft"
              >
                {t("checkout")}
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-forest/30 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30"
              >
                {t("viewCart")}
              </Link>
              <p className="mt-3 text-center text-[0.65rem] text-muted">
                {tc("demoPricesBanner")}
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}