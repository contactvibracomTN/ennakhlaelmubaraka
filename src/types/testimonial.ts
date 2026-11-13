/**
 * Customer testimonials (homepage social proof + /admin/testimonials).
 *
 * Governance:
 *  - Only `published` records are ever rendered on the public site.
 *  - `whatsapp` and `adminNote` are ADMIN-ONLY and must never reach a public
 *    component or the JSON-LD payload (privacy / PDPL).
 *  - `publishedText` is optional: the admin may rewrite/translate the quote per
 *    locale; otherwise the visitor's original `message` is shown.
 */
import type { Locale } from "@/lib/config/locales";

export type TestimonialStatus = "pending" | "published" | "archived";

/** How the testimonial entered the system. */
export type TestimonialSource = "website" | "in-store" | "import";

export type TestimonialRating = 1 | 2 | 3 | 4 | 5;

export interface Testimonial {
  /** Stable opaque id (crypto.randomUUID). */
  id: string;
  /** Public display name. */
  name: string;
  /** ADMIN-ONLY contact number (never rendered publicly). */
  whatsapp: string;
  /** Public job / profession (optional). */
  job?: string;
  /** Public nationality (optional). */
  nationality?: string;
  /** Original message, as written by the visitor. */
  message: string;
  rating: TestimonialRating;
  /** Language the visitor used (drives the fallback order of `publishedText`). */
  locale: string;
  status: TestimonialStatus;
  source: TestimonialSource;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  /** Optional admin-edited / translated public quote per locale. */
  publishedText?: Partial<Record<Locale, string>>;
  /** ADMIN-ONLY internal note (moderation, verification…). */
  adminNote?: string;
  /** Manual ordering among published testimonials (ascending). */
  order?: number;
}

/** Payload used by the admin editor (create or update). */
export interface TestimonialAdminInput {
  id?: string;
  name: string;
  whatsapp: string;
  job?: string;
  nationality?: string;
  message: string;
  rating: number;
  locale?: string;
  status?: TestimonialStatus;
  source?: TestimonialSource;
  publishedText?: Record<string, string>;
  adminNote?: string;
  order?: number;
}

/** Shape safe to hand to a public component (no WhatsApp, no internal note). */
export interface PublicTestimonial {
  id: string;
  name: string;
  job?: string;
  nationality?: string;
  message: string;
  rating: TestimonialRating;
  locale: string;
  createdAt: string;
  publishedAt?: string;
  /** Optional admin-edited / translated public quote per locale. */
  publishedText?: Partial<Record<Locale, string>>;
  /** Manual ordering among published testimonials (ascending). */
  order?: number;
}

export function toPublicTestimonial(t: Testimonial): PublicTestimonial {
  return {
    id: t.id,
    name: t.name,
    job: t.job,
    nationality: t.nationality,
    message: t.message,
    rating: t.rating,
    locale: t.locale,
    createdAt: t.createdAt,
    publishedAt: t.publishedAt,
    publishedText: t.publishedText,
    order: t.order,
  };
}

/**
 * Resolve the public quote for a locale:
 * requested locale → original author locale → Arabic → English → any filled value.
 */
export function resolveTestimonialText(
  t: Pick<Testimonial, "message" | "locale" | "publishedText">,
  locale: string,
): string {
  const text = t.publishedText ?? {};
  const candidates = [locale, t.locale, "ar", "en"];
  for (const code of candidates) {
    const value = text[code as Locale];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  for (const value of Object.values(text)) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return t.message;
}
