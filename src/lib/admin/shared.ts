/**
 * Client-safe constants/types shared by the admin UI and server actions.
 * Do NOT import node:* modules here (this file is bundled for the browser).
 */
import type { LocalizedText } from "@/types/localization";

export const ADMIN_LOCALES = ["ar", "en", "fr", "tr", "ur", "ms", "bn", "id"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const LANGUAGE_LABELS: Record<string, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  ur: "اردو",
  ms: "Melayu",
  bn: "বাংলা",
  id: "Bahasa Indonesia",
};

export const LANGUAGE_FLAGS: Record<string, string> = {
  ar: "🇸🇦",
  en: "🇬🇧",
  fr: "🇫🇷",
  tr: "🇹🇷",
  ur: "🇵🇰",
  ms: "🇲🇾",
  bn: "🇧🇩",
  id: "🇮🇩",
};

export type ItemLocaleStatus = "validated" | "machine" | "missing";

export interface ItemLocaleState {
  status: ItemLocaleStatus;
  by?: string;
  at?: string;
  /** true when the text came from machine translation (never validated). */
  machine?: boolean;
}

export type ContentKind = "date" | "gift" | "post" | "guide";

export const KIND_LABELS: Record<ContentKind, string> = {
  date: "Produit (dates)",
  gift: "Produit (cadeaux)",
  post: "Article de blog",
  guide: "Fiche du guide des dattes",
};

/** Localized record used across the datasets. */
export type LocalizedRecord = Record<string, string>;

/**
 * Any localized value the admin tooling may receive: a loose record
 * (partial translations, block editors) or a full LocalizedText (live data).
 */
export type AnyLocalized = LocalizedRecord | LocalizedText;

/** Build a full-8-locales localized record (empty strings by default). */
export const makeLocalized = (src: Record<string, string | undefined> = {}): LocalizedText =>
  Object.fromEntries(
    ADMIN_LOCALES.map((l) => [l, src[l] ?? ""] as [string, string]),
  ) as unknown as LocalizedText;