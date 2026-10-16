/**
 * Localized text blocks for the DATA layer (catalog, guide, gifts).
 * UI strings live in `src/messages/*.json` (next-intl); these types describe
 * editorial content that is authored per language.
 */
export interface LocalizedText {
  ar: string;
  en: string;
  fr?: string;
  tr?: string;
  ur?: string;
  ms?: string;
  bn?: string;
  id?: string;
}

/**
 * Content governance (brief §75).
 * - `draft`  : not ready for display.
 * - `demo`   : clearly identified as example/indicative (prices, concept products, sample reviews).
 * - `validated`: approved by the owner; may be published.
 * - `published`: live.
 */
export type ContentStatus = "draft" | "demo" | "validated" | "published";

/** A short quoted review. Only REAL validated reviews may be `validated`/`published`. */
export interface Review {
  id: string;
  authorName: LocalizedText;
  authorCity?: LocalizedText;
  text: LocalizedText;
  rating: 1 | 2 | 3 | 4 | 5;
  contentStatus: ContentStatus;
}
