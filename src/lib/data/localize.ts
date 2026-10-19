import type { LocalizedText } from "@/types/localization";
import type { Locale } from "@/lib/config/locales";

/**
 * Pick the right language string from a `LocalizedText` block.
 *
 * The data layer keeps AR + EN authoritatively and merges extra locales
 * (fr/tr/ur/ms/bn/id) from the migrated v2.1 overlays. Like the v2.1 site,
 * any missing locale falls back to English — the UI never renders a hole.
 */
export function pick(text: LocalizedText, locale: Locale): string {
  if (locale === "ar") return text.ar;
  return text[locale] ?? text.en;
}

/**
 * Alt text for one image.
 *
 * Prefers the per-image localized alt carried by the data (an `imageAlts` map
 * keyed by the exact image path), and otherwise falls back to the supplied
 * string — normally the localized product name. Every rendered image therefore
 * keeps a meaningful `alt`, which helps both accessibility and image SEO.
 */
export function imageAlt(
  alts: Record<string, LocalizedText> | undefined,
  src: string,
  fallback: string,
  locale: Locale,
): string {
  const entry = alts?.[src];
  return entry ? pick(entry, locale) : fallback;
}
