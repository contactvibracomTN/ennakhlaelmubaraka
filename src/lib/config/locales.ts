import { routing, getDirection } from "@/i18n/routing";

/**
 * Locale metadata used across the app (html lang, hreflang, formatting).
 * Source of truth remains `src/i18n/routing.ts` (next-intl routing module).
 */

export const defaultLocale = routing.defaultLocale;

export const locales = routing.locales;

export type Locale = (typeof routing.locales)[number];

export interface LocaleMeta {
  /** `html lang` value, e.g. "ar" / "en". */
  code: Locale;
  /** Full BCP-47 tag used in metadata, e.g. "ar-SA" / "en-SA". */
  bcp47: string;
  /** Text direction. */
  dir: "rtl" | "ltr";
  /** Native display name (for the language switcher). */
  nativeName: string;
}

/**
 * BCP-47 tags per locale — `ar-SA` / `en-SA` follow the store's market (KSA);
 * the other languages use their standard primary tags (part of the v2.1 site
 * which shipped `lang="fr"`, `lang="ur"`, etc.).
 */
const BCP47: Record<Locale, string> = {
  ar: "ar-SA",
  en: "en-SA",
  fr: "fr",
  ur: "ur",
  id: "id",
  bn: "bn",
  tr: "tr",
  ms: "ms",
};

const NATIVE_NAME: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  ur: "اردو",
  id: "Indonesia",
  bn: "বাংলা",
  tr: "Türkçe",
  ms: "Melayu",
};

export const localeMeta: Record<Locale, LocaleMeta> = Object.fromEntries(
  routing.locales.map((code) => [
    code,
    {
      code,
      bcp47: BCP47[code],
      dir: getDirection(code),
      nativeName: NATIVE_NAME[code],
    },
  ]),
) as Record<Locale, LocaleMeta>;

/** Ordered list of locale metas (for lang switcher, hreflang generation). */
export const localesMeta: LocaleMeta[] = routing.locales.map(
  (code) => localeMeta[code],
);

/** RTL locales (`ar`, `ur`). */
export const rtlLocales = new Set<Locale>(
  routing.locales.filter((code) => getDirection(code) === "rtl"),
);

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export function getLocaleMeta(locale: string): LocaleMeta | null {
  return isLocale(locale) ? localeMeta[locale] : null;
}
