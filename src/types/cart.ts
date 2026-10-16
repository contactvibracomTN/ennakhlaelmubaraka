import type { Currency } from "./money";

/**
 * Guest cart (brief §37) — no account required in V1.
 */
export interface CartItem {
  /** Product id — resolves to a DateProduct or GiftProduct. */
  productId: string;
  kind: "date" | "gift";
  /**
   * Chosen weight in kilograms for date products (v2 — standard retail
   * packs: 0.5 / 1 / 3 / 7 / 20 kg; 3 kg & 7 kg are the standard cartons).
   */
  weightKgs?: number;
  /** Chosen quality grade id (V3, PO 2026-09) — see DateProduct.grades. */
  gradeId?: string;
  /** Legacy v1 weight option id ("w-500g") — migrated to weightKgs on load. */
  weightOptionId?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  /** Coupon code (architecture only in V1 — brief §37). */
  coupon?: string;
}

export const emptyCart: Cart = { items: [], coupon: undefined };

export interface CartTotals {
  subtotal: number;
  currency: Currency;
  discount: number;
  shipping: number;
  total: number;
}

/** GA4-friendly item shape shared by the cart and analytics (brief §25). */
export interface LineItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
  currency?: Currency;
}
