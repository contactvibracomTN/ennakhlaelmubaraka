import type { LocalizedText, ContentStatus } from "./localization";

/**
 * Guide variety model — reshaped to the real v2.1 editorial structure
 * (title / caption / origin / intro / timeline / strengths / taste /
 * nutrition / resources). Region + texture are normalized from the
 * v2.1 French source values (golf→gulf, machrek→mashriq, egypte→egypt;
 * molle/semi/seche→soft/semi-soft/dry).
 *
 * The guide is purely editorial: it never shows prices. Varieties sold in the
 * boutique carry a `productSlug` + an optional localized `ctaLabel` so the
 * article can send visitors to the product page or to WhatsApp.
 */
export type GuideRegion =
  | "maghreb" // Morocco, Algeria, Tunisia
  | "mashriq" // Iraq, Levant
  | "gulf" // Saudi Arabia, GCC
  | "oman"
  | "egypt";

/** Same texture vocabulary as `DateProduct.texture`. */
export type GuideTexture = "soft" | "semi-soft" | "dry";

export interface NutritionFact {
  label: LocalizedText;
  value: LocalizedText;
}

/** One timeline entry (v2.1: label + text, e.g. "1927 — eleven palms…"). */
export interface GuideTimelineEvent {
  label: LocalizedText;
  text: LocalizedText;
}

export interface GuideResource {
  label: LocalizedText;
  href: string;
}

export interface GuideVariety {
  /** Short stable id — mirrors the linked catalog slug. */
  slug: string;
  /** Display number 01..19 (order in the guide). */
  number: string;
  /** Search aliases (e.g. "medjool mejhoul majhoul مجدول"). */
  nameSearch: string;
  /** Editorial heading (e.g. "Medjool — la Reine des dattes"). */
  title: LocalizedText;
  /** Short one-line description under the title. */
  caption: LocalizedText;
  /** Origin line (e.g. "Morocco · USA · Tunisia"). */
  origin: LocalizedText;
  /** Long editorial introduction. */
  intro: LocalizedText;
  timeline: GuideTimelineEvent[];
  strengths: LocalizedText[];
  taste: LocalizedText;
  region: GuideRegion;
  texture: GuideTexture;
  nutrition: NutritionFact[];
  resources: GuideResource[];
  /**
   * Linked catalog product slug — empty when the variety is not sold in the
   * boutique. Only then does the guide show a shop CTA.
   */
  productSlug: string;
  /** Optional localized wording for the shop CTA ("اطلبها الآن"…). */
  ctaLabel?: LocalizedText;
  /** Local image path under /images/guide. */
  image: string;
  contentStatus: ContentStatus;
}

export type GuideListSort = "number" | "name" | "region";
