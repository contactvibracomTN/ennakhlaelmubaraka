import type { Locale } from "@/lib/config/locales";

/** Business currency. The store operates in Saudi Riyals. */
export type Currency = "SAR";

export interface Money {
  amount: number;
  currency: Currency;
}

/**
 * Helpers for consistent price rendering (no rounding surprises).
 * `ar` renders "ر.س" (Arabic style); every other locale renders "SAR",
 * matching how the v2.1 site displayed prices on its non-Arabic pages.
 */
export const formatMoney: Record<Locale, (amount: number) => string> = {
  /** "89 ر.س" — Arabic style with Latin digits */
  ar(amount: number): string {
    return `${amount.toLocaleString("en-US")} ر.س`;
  },
  /** "SAR 89" — English style */
  en(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  fr(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  tr(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  ur(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  id(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  bn(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
  ms(amount: number): string {
    return `SAR ${amount.toLocaleString("en-US")}`;
  },
};
