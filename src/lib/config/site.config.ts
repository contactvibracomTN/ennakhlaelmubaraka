import type { Locale } from "@/lib/config/locales";
import { bankTransfer } from "@/lib/config/bank";

/**
 * REAL business configuration (source: v2.1 `site-config.js`, cross-checked).
 * Never invent business facts here — everything below comes from v2.1 config.
 * ⚠️ Payments stay in `demo` mode until a merchant account exists (Blueprint §12).
 */

export const siteConfig = {
  brand: {
    nameAr: "النخلة المباركة للتّمور الفاخرة",
    nameEn: "Al Nakhlah Al Mubarakah — Premium Dates",
    shortAr: "النخلة المباركة",
    shortEn: "Al Nakhlah Al Mubarakah",
    taglineAr: "دقّة المدينة، مذاقٌ لا يُنسى",
    taglineEn: "Madinah's dates, an unforgettable taste",
  },

  /** WhatsApp number — E.164 without "+" and without spaces. */
  whatsappNumber: "966596101097",

  phoneDisplay: "+966 59 610 1097",

  email: "nakhla.mubaraka26@gmail.com",

  address: {
    ar: "المتجر رقم 49، سوق التمور المركزي، حي الوبرة، المدينة المنورة 42371، المملكة العربية السعودية",
    en: "Shop No. 49, Central Dates Market, Al Wabra, Madinah 42371, Saudi Arabia",
    mapLabelAr: "المتجر رقم 49 — سوق التمور المركزي",
    mapLabelEn: "Shop No. 49 — Central Dates Market",
    mapsUrl:
      "https://www.google.com/maps/place/%D8%A7%D9%84%D9%86%D8%AE%D9%84%D8%A9+%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%83%D8%A9%E2%80%AD/@24.4621403,39.5837771,17z/data=!3m1!4b1!4m6!3m5!1s0x15bdbf005bd1b483:0x3c31db3f9c91aeb7!8m2!3d24.4621403!4d39.5837771!16s%2Fg%2F11x8k104lw?hl=ar&entry=ttu",
  },

  socials: {
    facebook: {
      url: "https://www.facebook.com/AlNakhlahAlMubarakahLitoumour",
      labelAr: "فيسبوك",
      labelEn: "Facebook",
    },
    instagram: {
      url: "https://www.instagram.com/nakhla_mubaraka/",
      labelAr: "إنستغرام",
      labelEn: "Instagram",
    },
    tiktok: {
      url: "https://www.tiktok.com/@nakhlamubaraka",
      labelAr: "تيك توك",
      labelEn: "TikTok",
    },
    snapchat: {
      url: "https://snapchat.com/t/i6fjhAmM",
      labelAr: "سناب شات",
      labelEn: "Snapchat",
    },
  },

  /**
   * Production/public URL. While EMPTY the site is `noindex` (never indexed),
   * which is the safe default until deployment (Blueprint §31).
   * Official domain (Hostinger, D9) — ennakhlaelmubaraka.com.
   */
  siteUrl: "https://ennakhlaelmubaraka.com",

  /** Locale tags used in `<html lang>` / metadata. */
  localeTag: { ar: "ar-SA", en: "en-SA" } as const,

  analytics: {
    /** Real tags approved by the owner (PO 13/10/2026). */
    ga4Id: "G-PPQCN5D354",
    gtmId: "GTM-TWZ3M2WB",
    clarityId: "",
    metaPixelId: "4588962788006820",
    tiktokPixelId: "",
    /**
     * When true, Google Tag Manager is the SINGLE source of truth for GA4: the
     * app injects the GTM container, and GA4 must be configured as a tag INSIDE
     * the container (avoids double counting). When false, the app injects GA4
     * directly on every page (legacy behaviour).
     */
    managedByGtm: true,
    /**
     * Meta Pixel is injected DIRECTLY by the app, independently of
     * `managedByGtm` (GA4 stays inside GTM). Set to false to let GTM own the
     * Meta Pixel instead — never enable both, to avoid double counting.
     */
    metaPixelDirect: true,
    /** Consent banner — disabled while no consent framework is required. */
    consentRequired: false,
  },

  /** Optional order webhook (Make/Zapier/n8n). Empty → WhatsApp only. */
  orderWebhookUrl: "",

  payments: {
    /** "demo" = no real charge; orders go via WhatsApp. Never "live" without a merchant account. */
    mode: "demo" as PaymentMode,
    provider: "" as PaymentProvider,
    /**
     * Bank transfer details come from the environment (`src/lib/config/bank.ts`),
     * never from this file — an IBAN must not be committed in the source.
     * They are EMPTY unless the IBAN passes its mod-97 check, so the checkout
     * and the payment page show "bank details being confirmed" instead of a
     * half-filled payment instruction.
     */
    status: bankTransfer.status,
    iban: bankTransfer.iban,
    beneficiary: bankTransfer.accountName,
    bankName: bankTransfer.bankName,
    accountNumber: bankTransfer.accountNumber,
  },
} as const;

/** Payment modes — `demo` until a merchant account exists. */
export type PaymentMode = "demo" | "live";
/** Integrable hosted-payment providers (Blueprint §12). */
export type PaymentProvider = "" | "hyperpay" | "tap" | "moyasar" | "stripe";

/** Site-wide configuration type (for consumers that need the whole object). */
export type SiteConfig = typeof siteConfig;

/** WhatsApp deep link root. */
export const WHATSAPP_BASE_URL = `https://wa.me/${siteConfig.whatsappNumber}`;

/** True when a production site URL is configured (drives sitemap/indexing). */
export const hasSiteUrl = siteConfig.siteUrl.length > 0;

export function buildWhatsAppUrl(
  message: string,
  locale: Locale = "ar",
): string {
  const params = new URLSearchParams({ text: message });
  const lang = locale === "en" ? "?lang=en&" : "?";
  return `${WHATSAPP_BASE_URL}${lang}${params.toString()}`;
}

export function getBrandName(locale: Locale): string {
  return locale === "ar" ? siteConfig.brand.nameAr : siteConfig.brand.nameEn;
}

export function getTagline(locale: Locale): string {
  return locale === "ar"
    ? siteConfig.brand.taglineAr
    : siteConfig.brand.taglineEn;
}

export function getAddress(locale: Locale): string {
  return locale === "ar" ? siteConfig.address.ar : siteConfig.address.en;
}
