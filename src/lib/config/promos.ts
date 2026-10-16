/**
 * Commercial rules — VALIDATED by the PO (2026-09/10).
 * ---------------------------------------------------------------------------
 * Decision log (see nakhla-validation-suivi.md §5quater):
 *  - The −10 % discount on the over-7-kg excess was REMOVED at launch
 *    (decision 2026-10-06): with acquisition cost at its peak for the first
 *    months, the ~25 SAR/order it gave away did not move conversion and
 *    squeezed the perceived margin for no material benefit. The constants
 *    below stay as the documented re-activation path (Ramadan, once CAC is
 *    measured below ~100 SAR/order, per simulations v1–v3).
 *  - The ONLY active rule is: FREE DELIVERY within Madinah for invoices
 *    above 200 SAR (per order, strict ">" — a 200.00 SAR invoice does not
 *    qualify). Below that, the fee is ~20 SAR within Madinah, and is always
 *    stated as "confirmed in the conversation" (never a fixed quote).
 * Outside Madinah, delivery is discussed per order — no price is ever
 * inferred here.
 */

/** Invoice (subtotal) above which delivery within Madinah is free. */
export const FREE_DELIVERY_MADINAH_MIN_INVOICE_SAR = 200;

/** Approximate Madinah delivery fee below the threshold (~20 RS — PO). */
export const MADINAH_DELIVERY_FEE_SAR = 20;

/** True when the cart subtotal qualifies for free Madinah delivery. */
export function isFreeDeliveryEligible(subtotal: number): boolean {
  return subtotal > FREE_DELIVERY_MADINAH_MIN_INVOICE_SAR;
}

/**
 * Bulk-discount rule (−10 % on the excess above 7 kg of dates in the same
 * basket, proportional) — REMOVED at launch by PO decision. Kept as a typed
 * record so a future seasonal re-activation (Ramadan) touches only this file
 * and the messages, never the cart arithmetic.
 */
export const BULK_DATE_DISCOUNT = {
  enabled: false,
  thresholdKg: 7,
  /** −10 % applied to the date subtotal, proportional to the excess share. */
  rate: 0.1,
} as const;