import type { LocalizedText, ContentStatus } from "./localization";

/**
 * Guide variety model — reshaped to the real v2.1 editorial structure
 * (title / caption / origin / intro / timeline / strengths / taste /
 * nutrition / prices / resources). Region + texture are normalized from the
 * v2.1 French source values (golf→gulf, machrek→mashriq, egypte→egypt;
 * molle/semi/seche→soft/semi-soft/dry).
 */
export type GuideRegion =
  | "maghreb" // Morocco, Algeria, Tunisia
  | "mashriq" // Iraq, Levant
  | "gulf" // Saudi Arabia, GCC
  | "iran"
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

/**
 * Market-price row = source region/market + indicative USD range.
 * Informational ONLY — never presented as a store offer.
 */
export interface GuideMarketPriceRow {
  label: LocalizedText;
  value: LocalizedText;
}

export interface GuideResource {
  label: LocalizedText;
  href: string;
}

export interface GuideVariety {
  /** Short stable id — mirrors the linked catalog slug. */
  slug: string;
  /** Display number 01..24. */
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
  /**
   * Indicative market ranges per region/country (source: v2.1 guide).
   * Informational, NEVER a store offer.
   */
  prices: GuideMarketPriceRow[];
  resources: GuideResource[];
  /** Short indicative market price (e.g. "3–20 USD/kg") — informational only. */
  displayPrice: string;
  /** Linked catalog product slug (v2.1). */
  productSlug: string;
  /** Local image path under /images/guide. */
  image: string;
  contentStatus: ContentStatus;
}

export type GuideListSort = "number" | "name" | "region";
