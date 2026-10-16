import type { LocalizedText, ContentStatus } from "./localization";
import type { Money } from "./money";
import type { GuideTexture } from "./guide";

/* ---------------------------------------------------------------------------
 * Product model — discriminated union (brief §14, Blueprint V3 §6).
 * `kind` discriminates `DateProduct` (dates catalog) from `GiftProduct`
 * (gifting universe). Shared fields live in `ProductBase`.
 *
 * Category slugs are the REAL v2.1 slugs (medina|world|premium and
 * personal|occasions|date-products) — never invented.
 * ------------------------------------------------------------------------- */

export type ProductAvailability = "in-stock" | "out-of-stock" | "preorder";

export type DateCategory =
  | "medina" // تمور المدينة
  | "kingdom"; // تمور المملكة (variétés saoudiennes, V3 2026-09)

export type GiftCategory =
  | "personal" // الهدايا الشخصية
  | "occasions" // هدايا المناسبات
  | "date-products"; // منتجات التمور

export interface ProductBase {
  id: string;
  slug: string; // stable latin slugs (never Arabic titles as technical ids)
  name: LocalizedText;
  teaser: LocalizedText; // short card copy
  description?: LocalizedText; // long copy (product page)
  images: string[]; // local paths under /images/dates or /images/gifts
  price: Money;
  /** Previous/compare-at price (used for demo offers). Optional. */
  compareAtPrice?: Money;
  availability: ProductAvailability;
  /** Badges such as "عرض تجريبي" / "Demo" / "الأكثر مبيعاً". */
  badges?: LocalizedText[];
  contentStatus: ContentStatus;
  featured?: boolean;
  bestSeller?: boolean;
}

export interface WeightOption {
  id: string;
  label: LocalizedText; // "500 غرام" / "500 g"
  price: Money;
  /** price per kg, used for transparency (optional). */
  pricePerKg?: Money;
}

/**
 * Quality tier — the three fixed levels the owner asked for (PO 2026-10):
 * درجة أولى (premium) · درجة وسطى (medium) · درجة إقتصادية (economic).
 * It is a presentation/transparency label attached to a grade; it never
 * replaces the real grade name (الفاخرة, سكري مفتّل, a price tier…).
 */
export type GradeTier = "premium" | "medium" | "economic";

/**
 * A quality grade / calibre of a date variety (PO 2026-09) — e.g. درجة أولى /
 * deuxième, or the two Sukkari forms (رطب المفتّل). Prices are per kilogram.
 * Grade choice happens on the catalogue product page; the cart line remembers
 * the chosen grade but never splits into separate grade rows.
 *
 * V3 (PO 2026-10): a grade may also carry its own `images` so the product sheet
 * shows a photo that reflects the quality the visitor picked, and a `tier`
 * badge for at-a-glance price/quality transparency.
 */
export interface DateGrade {
  id: string;
  label: LocalizedText; // e.g. « الدرجة الأولى » / "Grade 1"
  pricePerKg: Money; // SAR per kg
  /** At-a-glance quality level (optional). */
  tier?: GradeTier;
  /** Photos specific to this grade; falls back to the product images when empty. */
  images?: string[];
}

export interface DateProduct extends ProductBase {
  kind: "date";
  category: DateCategory;
  varietySlug?: string; // links to /guide/[slug]
  origin: LocalizedText;
  unit: "kg" | "box";
  weightOptions: WeightOption[];
  /**
   * Quality grades shown on the catalogue page (price per kg).
   * When present, the order form lets the customer pick a grade; these prices
   * override `price`/`weightOptions` for pricing decisions.
   */
  grades?: DateGrade[];
  /** Default grade id selected in the order form (first grade by default). */
  defaultGradeId?: string;
  texture?: GuideTexture;
  offerLabel?: LocalizedText; // "عرض تجريبي" — demo offers
}

/** Real v2.1 gift occasions (visit/ramadan/eid/wedding). */
export type GiftOccasion = "visit" | "ramadan" | "eid" | "wedding";

export interface GiftProduct extends ProductBase {
  kind: "gift";
  category: GiftCategory;
  /** Composition of the box/bundle (localized lines, split from v2.1 "·"). */
  contents?: LocalizedText[];
  /** Linked date products inside the bundle. */
  bundleOf?: string[];
  /** Descriptive size line from v2.1 (e.g. "تشكيلة 750 جم + حلويات"). */
  sizeLabel?: LocalizedText;
  /** Occasion this gift targets (v2.1). */
  occasion?: GiftOccasion;
  /** True when the item is a conceptual product (brief §17). */
  isConceptual?: boolean;
}

export type Product = DateProduct | GiftProduct;

/** Products shared type-guard helpers */
export const isDateProduct = (p: Product): p is DateProduct =>
  p.kind === "date";
export const isGiftProduct = (p: Product): p is GiftProduct =>
  p.kind === "gift";

export interface CategoryInfo<T extends string> {
  slug: T;
  name: LocalizedText;
  description?: LocalizedText;
  image?: string;
}

export type DateCategoryInfo = CategoryInfo<DateCategory>;
export type GiftCategoryInfo = CategoryInfo<GiftCategory>;
