import { defineRouting } from "next-intl/routing";

/**
 * Central i18n routing definition (next-intl).
 * Active locales (V1+): 8 languages — ar (RTL, default), en (LTR),
 * fr (LTR), ur (RTL), id (LTR), bn (LTR), tr (LTR), ms (LTR).
 * ur (Urdu) is RTL like Arabic.
 */
export const routing = defineRouting({
  locales: ["ar", "en", "fr", "ur", "id", "bn", "tr", "ms"],
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/** Locales rendered right-to-left (Arabic + Urdu). */
export const RTL_LOCALES: readonly Locale[] = ["ar", "ur"] as const;

/** Maps a locale to its `dir` attribute. */
export function getDirection(locale: string): "rtl" | "ltr" {
  return (RTL_LOCALES as readonly string[]).includes(locale) ? "rtl" : "ltr";
}
