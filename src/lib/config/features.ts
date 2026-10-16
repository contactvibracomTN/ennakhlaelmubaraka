import { siteConfig } from "@/lib/config/site.config";

/**
 * Feature flags (Blueprint V3 §12). Centralised so behaviour switches are
 * explicit, traceable and changeable without touching UI code.
 */

/** Payment mode: `demo` | `live`. `live` is forbidden without a merchant account. */
export const paymentsMode = siteConfig.payments.mode;

export const isPaymentsDemo = paymentsMode === "demo";

export const isPaymentsLive = paymentsMode === "live";

/** Order automation: webhook configured? (WhatsApp remains the primary channel.) */
export const hasOrderWebhook = siteConfig.orderWebhookUrl.length > 0;

/** Consent banner enabled? Only when real analytics identifiers exist. */
export const isConsentRequired = siteConfig.analytics.consentRequired;

export const hasAnalyticsIds =
  siteConfig.analytics.ga4Id.length > 0 ||
  siteConfig.analytics.gtmId.length > 0 ||
  siteConfig.analytics.clarityId.length > 0 ||
  siteConfig.analytics.metaPixelId.length > 0 ||
  siteConfig.analytics.tiktokPixelId.length > 0;

/** Site is indexable only once a production URL is configured. */
export const isIndexable = siteConfig.siteUrl.length > 0;
