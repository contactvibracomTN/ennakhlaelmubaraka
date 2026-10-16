import type { CartItem, CartTotals } from "./cart";
import type { Locale } from "./locale";

/**
 * Checkout data model (brief §38). Two modes: DELIVERY and PICKUP/STORE.
 * V1 is a "prototype checkout": confirmation goes through WhatsApp (and an
 * optional webhook). Payments stay abstracted and in `demo` mode.
 */
export type DeliveryMode = "delivery" | "pickup";

export type PaymentMethod =
  | "whatsapp" // V1: order confirmed via WhatsApp
  | "cod" // cash on delivery (KSA)
  | "bank-transfer" // IBAN displayed in WhatsApp message (config)
  | "online"; // future payment provider (abstracted, never live without credentials)

export interface CustomerInfo {
  name: string;
  phone: string; // E.164-ish display format
  email?: string;
  city?: string;
  addressLine?: string;
  notes?: string;
}

export interface OrderDraft {
  locale: Locale;
  items: CartItem[];
  customer: CustomerInfo;
  delivery: DeliveryMode;
  payment: {
    method: PaymentMethod;
    /** Set when a future PaymentProvider creates a hosted-payment intent. */
    intentId?: string;
  };
  totals: CartTotals;
  /** Client-ref for idempotency (webhook-ready). */
  orderId: string;
}

export type OrderChannel = "whatsapp" | "webhook" | "checkout";

export interface OrderResult {
  ok: boolean;
  orderId: string;
  channel: OrderChannel;
  /** WhatsApp deep link when the order is handed over to WhatsApp. */
  whatsappUrl?: string;
  error?: string;
}
