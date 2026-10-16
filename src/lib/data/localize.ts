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
