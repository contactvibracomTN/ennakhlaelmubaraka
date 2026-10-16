"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { formatMoney } from "@/types/money";
import { pick } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import { useCart } from "@/context/cart-context";
import {
  STANDARD_WEIGHT_KGS,
  dateLineGradeLabel,
  dateLineUnitPrice,
  formatWeightKg,
  gradeFor,
  gradeTierLabel,
  parseWeightKg,
  perKgFor,
} from "@/lib/data/weight-price";
import type { Locale } from "@/lib/config/locales";
import type { DateProduct, GradeTier } from "@/types/product";

/** Small coloured chip tones for the three quality tiers. */
const TIER_TONE: Record<GradeTier, string> = {
  premium: "bg-gold-light text-date-deep",
  medium: "bg-ivory-deep text-forest",
  economic: "bg-line text-muted",
};

/**
 * Order form (fiche produit dates — V3, PO 2026-09/10).
 *
 * Le client choisit d'abord le grade / calibre (prix réel PO au kilo — jamais
 * un descriptif inventé : le libellé du grade est son prix au kilo, sauf les
 * deux formes réelles du Soukari, مفتّل et رطب), puis saisit un poids en kg
 * (champ éditable + emballages standard 0,5 · 1 · 3 · 7 · 20 kg). Le prix de
 * la ligne = prix du grade × kg, arrondi à la devise. Le grade choisi est
 * mémorisé par la ligne du panier (jamais de lignes séparées par grade).
 *
 * Le grade peut être piloté de l'extérieur (`gradeId` + `onGradeChange`) afin
 * que la galerie de la fiche reflète la qualité choisie (PO 2026-10).
 */
export function WeightSelector({
  product,
  gradeId: controlledGradeId,
  onGradeChange,
}: {
  product: DateProduct;
  gradeId?: string;
  onGradeChange?: (gradeId: string) => void;
}) {
  const t = useTranslations("product");
  const tw = useTranslations("whatsapp");
  const { addItem, openCart } = useCart();
  const locale = useLocale() as Locale;

  const grades = product.grades ?? [];
  const [internalGradeId, setInternalGradeId] = useState<string | undefined>(
    product.defaultGradeId ?? grades[0]?.id,
  );
  const gradeId = controlledGradeId ?? internalGradeId;
  const setGradeId = (id: string) => {
    setInternalGradeId(id);
    onGradeChange?.(id);
  };
  const [raw, setRaw] = useState("1");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const kg = parseWeightKg(raw);
  const perKg = perKgFor(product, gradeId);
  const price = kg != null ? dateLineUnitPrice(product, kg, gradeId) : null;
  const kgUnit = t("kg");
  const unavailable = product.availability === "out-of-stock";
  const selectedGrade = gradeFor(product, gradeId);
  const gradeLabel = selectedGrade
    ? dateLineGradeLabel(product, selectedGrade.id, locale)
    : "";

  // Close the suggestion list on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectWeight = (w: number) => {
    setRaw(String(w));
    setOpen(false);
  };

  const optionText =
    kg != null
      ? `${formatWeightKg(locale, kg, kgUnit)}${
          gradeLabel ? ` · ${gradeLabel}` : ""
        }`
      : "";

  const orderHref =
    kg != null
      ? buildWhatsAppUrl(
          tw("orderProduct", {
            product: pick(product.name, locale),
            option: optionText,
          }),
          locale,
        )
      : "#";

  const handleAddToCart = () => {
    if (kg == null || unavailable) return;
    addItem({
      productId: product.id,
      kind: "date",
      weightKgs: kg,
      gradeId: selectedGrade?.id,
    });
    openCart();
  };

  return (
    <div>
      {/* Grade / calibre — real PO per-kg prices */}
      {grades.length > 0 ? (
        <div className="mb-5">
          <p className="text-sm font-semibold text-forest">{t("gradeLabel")}</p>
          <div
            className="mt-2 flex flex-wrap gap-2"
            role="group"
            aria-label={t("gradeLabel")}
          >
            {grades.map((grade) => {
              const active = (selectedGrade?.id ?? grades[0].id) === grade.id;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setGradeId(grade.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    active
                      ? "border-gold-deep bg-gold-light/40 text-forest"
                      : "border-line bg-white text-muted hover:border-gold/60"
                  }`}
                >
                  {grade.tier ? (
                    <span
                      className={`me-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${TIER_TONE[grade.tier]}`}
                    >
                      {gradeTierLabel(grade.tier, locale)}
                    </span>
                  ) : null}
                  {pick(grade.label, locale)}
                  <span className="ms-1.5 opacity-70">
                    {formatMoney[locale](grade.pricePerKg.amount)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Editable numeric weight + standard-pack list */}
      <div ref={wrapRef} className="relative">
        <label
          htmlFor={`weight-${product.id}`}
          className="block text-sm font-semibold text-forest"
        >
          {t("weightLabel")}
        </label>
        <div className="relative mt-2">
          <input
            id={`weight-${product.id}`}
            type="text"
            inputMode="decimal"
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            value={raw}
            placeholder={t("weightPlaceholder")}
            onChange={(e) => setRaw(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-controls={`weight-list-${product.id}`}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 pe-12 text-end text-sm font-semibold text-forest placeholder:font-normal placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("weightSuggestions")}
            aria-expanded={open}
            className="absolute inset-y-0 start-0 flex w-10 items-center justify-center rounded-s-xl text-muted transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {open ? (
            <ul
              id={`weight-list-${product.id}`}
              role="listbox"
              aria-label={t("weightSuggestions")}
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-xl"
            >
              {STANDARD_WEIGHT_KGS.map((w) => (
                <li key={w} role="option" aria-selected={kg === w}>
                  <button
                    type="button"
                    onClick={() => selectWeight(w)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm transition-colors hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      kg === w ? "bg-gold-light/40 text-forest" : "text-charcoal/85"
                    }`}
                  >
                    <span className="font-semibold">
                      {formatWeightKg(locale, w, kgUnit)}
                    </span>
                    <span className="text-xs text-date-deep">
                      {formatMoney[locale](dateLineUnitPrice(product, w, gradeId))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted">{t("weightHint")}</p>
        {kg == null ? (
          <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {t("weightInvalid")}
          </p>
        ) : null}
      </div>

      {/* Price */}
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {price != null ? (
            <>
              <span className="font-arabic-display text-3xl font-bold text-forest">
                {formatMoney[locale](price)}
              </span>
              <span className="rounded-full bg-ivory-deep px-2.5 py-1 text-xs text-muted">
                {formatWeightKg(locale, kg!, kgUnit)} · {t("pricePerKg")}{" "}
                {formatMoney[locale](perKg)}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </div>
      </div>

      {unavailable ? (
        <span className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-line px-6 py-4 text-sm font-bold text-muted sm:w-auto">
          <WhatsAppLogo className="h-5 w-5" aria-hidden="true" />
          {t("outOfStock")}
        </span>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={kg == null}
            tabIndex={kg == null ? -1 : 0}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-success px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:flex-none ${
              kg == null ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <WhatsAppLogo className="h-5 w-5" aria-hidden="true" />
            {product.availability === "preorder"
              ? t("preorder")
              : t("orderViaWhatsapp")}
          </a>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={kg == null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/30 px-6 py-4 text-sm font-semibold text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:hover:border-transparent disabled:hover:bg-line sm:flex-none"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {t("addToCart")}
          </button>
        </div>
      )}
    </div>
  );
}