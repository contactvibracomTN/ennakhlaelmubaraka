import type { DateGrade, DateProduct, GradeTier, WeightOption } from "@/types/product";
import type { Locale } from "@/lib/config/locales";

/**
 * Retail weight logic (fiche produit — demande propriétaire, v2.1 → v3).
 *
 * Quantités constatées par le client sur son comptoir : une grande partie
 * dépasse 20 kg en moyenne. Les emballages standards retenus pour la vente
 * en ligne sont : 0,5 / 1 / 3 / 7 / 20 kg (3 kg et 7 kg = cartons standard).
 *
 * Le visiteur saisit un poids en kg (champ numérique éditable) et peut
 * choisir d'un clic l'un de ces emballages standards. Le prix est dérivé du
 * prix au kilo — celui du GRADE sélectionné quand le produit en porte
 * (PO 2026-09 : prix réels au kilo par qualité de calibre), sinon du prix au
 * kilo de référence du dataset (mention « estimé » conservée si applicable).
 */
export const STANDARD_WEIGHT_KGS: readonly number[] = [0.5, 1, 3, 7, 20];

/** Parse the kilogram amount from an option id like "w-500g" → 0.5. */
export function optionKgs(option: WeightOption): number {
  const match = /-?(\d+(?:[.,]\d+)?)\s*g\b/i.exec(option.id);
  if (match) return Number(match[1].replace(",", ".")) / 1000;
  return option.pricePerKg && option.pricePerKg.amount > 0
    ? option.price.amount / option.pricePerKg.amount
    : 0.5;
}

/** Reference per-kg price: pricePerKg of an option, else smallest pack scaled. */
export function referencePricePerKg(options: WeightOption[]): number {
  if (options.length === 0) return 0;
  for (const option of options) {
    if (option.pricePerKg) return option.pricePerKg.amount;
  }
  const first = options[0];
  const kgs = optionKgs(first);
  return kgs > 0 ? Math.round(first.price.amount / kgs) : first.price.amount;
}

/**
 * Price for a given weight in kg. Uses the exact retail-pack price whenever
 * the dataset carries it; otherwise scales from the reference per-kg price.
 */
export function priceForWeightKg(
  options: WeightOption[],
  kg: number,
): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  const exact = options.find((o) => Math.abs(optionKgs(o) - kg) < 1e-9);
  if (exact) return exact.price.amount;
  return Math.round(referencePricePerKg(options) * kg);
}

/** Localized weight label — "3 كجم" (ar), "0,5 kg" (fr), "0.5 kg" (en). */
export function formatWeightKg(
  locale: Locale,
  kg: number,
  unit: string,
): string {
  const numberFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${numberFormat.format(kg)} ${unit}`;
}

/** Normalize user input (Arabic-Indic/Eastern digits, comma decimals). */
export function parseWeightKg(raw: string): number | null {
  const normalized = raw
    .replace(/[٠-٩]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(",", ".")
    .trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const kg = Number(normalized);
  if (!Number.isFinite(kg) || kg < 0.5) return null;
  return Math.round(kg * 100) / 100;
}

/* ---------------------------------------------------------------------------
 * Grade-aware pricing (V3, PO 2026-09) — real PO prices are per kilogram and
 * per grade. When a date product carries `grades`, THAT is the pricing source:
 * the customer picks a grade on the product page and the cart line remembers
 * it (`CartItem.gradeId`). A missing grade id safely falls back to the default
 * grade (first in the list, or `defaultGradeId`).
 * ------------------------------------------------------------------------- */

/** Resolve the selected grade of a date product (default = first/defaultGradeId). */
export function gradeFor(
  product: DateProduct,
  gradeId?: string,
): DateGrade | undefined {
  if (!product.grades || product.grades.length === 0) return undefined;
  if (gradeId != null) {
    const found = product.grades.find((g) => g.id === gradeId);
    if (found) return found;
  }
  const fallback =
    product.defaultGradeId != null
      ? product.grades.find((g) => g.id === product.defaultGradeId)
      : undefined;
  return fallback ?? product.grades[0];
}

/** Per-kg price of a date product for the selected grade (SAR). */
export function perKgFor(
  product: DateProduct,
  gradeId?: string,
): number {
  const grade = gradeFor(product, gradeId);
  if (grade) return grade.pricePerKg.amount;
  return referencePricePerKg(product.weightOptions) || product.price.amount;
}

/** Round to the currency's decimals (SAR has 2). */
function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Price of a date line item (cart/checkout/WhatsApp) for a chosen kg + grade. */
export function dateLineUnitPrice(
  product: DateProduct,
  weightKgs?: number,
  gradeId?: string,
): number {
  if (weightKgs == null) {
    const grade = gradeFor(product, gradeId);
    return grade ? grade.pricePerKg.amount : product.price.amount;
  }
  return roundMoney(perKgFor(product, gradeId) * weightKgs);
}

/** Grade label of a cart line, localized ("" when the product has no grades). */
export function dateLineGradeLabel(
  product: DateProduct,
  gradeId: string | undefined,
  locale: Locale,
): string {
  const grade = gradeFor(product, gradeId);
  if (!grade) return "";
  const label = grade.label;
  const value = locale === "ar" ? label.ar : label[locale] ?? label.en;
  return value ?? "";
}

/* ---------------------------------------------------------------------------
 * Quality tier + per-grade media (PO 2026-10) — transparency by quality.
 *
 * The owner wanted the price/quality variation to be explicit on the sheet.
 * A grade can therefore carry a fixed TIER badge (درجة أولى / وسطى / إقتصادية)
 * and its own photos, so picking a grade changes both the price and the image
 * shown — never the reverse direction (image never drives the price).
 * ------------------------------------------------------------------------- */

/** Localized labels for the three fixed quality tiers. */
export const GRADE_TIER_LABELS: Record<GradeTier, Record<Locale, string>> = {
  premium: {
    ar: "درجة أولى",
    en: "Premium",
    fr: "Premium",
    tr: "Premium",
    ur: "اعلیٰ درجہ",
    ms: "Premium",
    bn: "প্রিমিয়াম",
    id: "Premium",
  },
  medium: {
    ar: "درجة وسطى",
    en: "Medium",
    fr: "Moyenne",
    tr: "Orta",
    ur: "درمیانہ درجہ",
    ms: "Sederhana",
    bn: "মধ্যম",
    id: "Menengah",
  },
  economic: {
    ar: "درجة إقتصادية",
    en: "Economic",
    fr: "Économique",
    tr: "Ekonomik",
    ur: "اقتصادی درجہ",
    ms: "Ekonomi",
    bn: "অর্থনৈতিক",
    id: "Ekonomis",
  },
};

/** Localized tier label ("" when the grade carries no tier). */
export function gradeTierLabel(
  tier: GradeTier | undefined,
  locale: Locale,
): string {
  if (!tier) return "";
  return GRADE_TIER_LABELS[tier][locale] ?? GRADE_TIER_LABELS[tier].en;
}

/**
 * Photos to show for the selected grade: the grade's own images when it has
 * any, otherwise the product's images (the gallery is never left empty).
 */
export function gradeImages(
  product: DateProduct,
  gradeId?: string,
): string[] {
  const grade = gradeFor(product, gradeId);
  if (grade?.images && grade.images.length > 0) return grade.images;
  return product.images;
}