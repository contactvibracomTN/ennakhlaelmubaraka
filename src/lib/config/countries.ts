/**
 * Countries shown in the testimonial forms and rendered as a flag on the
 * public card.
 *
 * We store the ISO 3166-1 alpha-2 code (`SA`, `FR`, `ID`…) instead of a
 * free-text nationality, so the flag is always correct and the country name can
 * be translated into every locale with `Intl.DisplayNames` (no manual
 * translation table to maintain).
 *
 * The list is curated around the shop's actual clientele (Gulf, Maghreb, West
 * Africa, South/Southeast Asia, Europe, diaspora) rather than the full ISO list,
 * which keeps the `<select>` usable on a phone.
 */

export const COUNTRY_CODES = [
  // Gulf & Middle East
  "SA", "AE", "QA", "KW", "BH", "OM", "YE", "JO", "LB", "SY", "IQ", "PS", "TR", "IR",
  // North Africa & Maghreb
  "MA", "DZ", "TN", "LY", "EG", "SD", "MR",
  // West & Central Africa
  "SN", "ML", "CI", "GN", "BF", "NE", "TG", "BJ", "GM", "GW", "SL", "LR", "GH", "NG", "CM", "TD",
  // East Africa & Horn
  "SO", "DJ", "ER", "ET", "KE", "TZ", "UG", "RW", "BI", "MU", "MG", "KM",
  // South Asia
  "PK", "IN", "BD", "LK", "NP", "MV", "AF",
  // Southeast Asia
  "ID", "MY", "SG", "TH", "VN", "PH", "BN", "KH",
  // Europe
  "FR", "BE", "NL", "DE", "ES", "IT", "PT", "GB", "CH", "SE", "NO", "DK", "FI", "IE",
  "AT", "PL", "RO", "RU", "UA", "BA", "AL", "XK",
  // Americas & Oceania
  "US", "CA", "BR", "AR", "MX", "AU", "NZ",
  // Other
  "CN", "JP", "KR", "ZA",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

const COUNTRY_SET = new Set<string>(COUNTRY_CODES);

/** Normalise user/DB input to an uppercase ISO code, or `undefined`. */
export function normalizeCountryCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : undefined;
}

/** True when the code belongs to the curated list (used for validation). */
export function isSupportedCountry(value: unknown): value is CountryCode {
  const code = normalizeCountryCode(value);
  return code !== undefined && COUNTRY_SET.has(code);
}

/**
 * Localised country name, e.g. `SA` → "Arabie saoudite" / "السعودية" / "Saudi
 * Arabia". Returns `undefined` when the runtime or the code cannot resolve, so
 * callers can simply omit the label.
 */
export function countryName(code: string | undefined, locale: string): string | undefined {
  if (!code) return undefined;
  const normalized = normalizeCountryCode(code);
  if (!normalized) return undefined;
  try {
    const display = new Intl.DisplayNames([locale], { type: "region" });
    return display.of(normalized) ?? undefined;
  } catch {
    return undefined;
  }
}

/** CSS class for the local `flag-icons` stylesheet (`fi fi-sa`). */
export function flagClass(code: string | undefined): string | undefined {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return undefined;
  return `fi fi-${normalized.toLowerCase()}`;
}
