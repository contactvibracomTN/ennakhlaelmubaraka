/**
 * Testimonial service — turns a validated public submission into a stored
 * `pending` record. Used by the public server action and by the admin's
 * "nouveau témoignage" form.
 */
import { randomUUID } from "node:crypto";
import { readTestimonials, saveTestimonials } from "@/lib/admin/store";
import type { TestimonialSubmission } from "@/lib/data/content-schema";
import type { Testimonial, TestimonialRating, TestimonialSource } from "@/types/testimonial";

export interface BuildOptions {
  source?: TestimonialSource;
  locale?: string;
  status?: Testimonial["status"];
  order?: number;
}

export function buildTestimonial(input: TestimonialSubmission, options: BuildOptions = {}): Testimonial {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    job: input.job?.trim() || undefined,
    nationality: input.nationality?.trim() || undefined,
    message: input.message.trim(),
    rating: input.rating as TestimonialRating,
    locale: options.locale || input.locale || "ar",
    status: options.status ?? "pending",
    source: options.source ?? "website",
    createdAt: now,
    ...(options.status === "published" ? { publishedAt: now } : {}),
    ...(typeof options.order === "number" ? { order: options.order } : {}),
  };
}

export interface AppendResult {
  ok: boolean;
  error?: string;
}

/** Append a record to the JSON store. Never throws: returns a readable error. */
export function appendTestimonial(testimonial: Testimonial): AppendResult {
  try {
    const all = readTestimonials();
    all.push(testimonial);
    saveTestimonials(all);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ------------------------------------------------------------------ */
/* lightweight anti-spam (per server instance)                        */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Best-effort in-memory throttle. Serverless instances each keep their own
 * map, so this is a speed bump, not a security boundary — the real defences
 * are the honeypot, the timing check and server-side validation.
 */
export function allowSubmission(key: string | null): boolean {
  if (!key) return true;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 1000) {
    for (const [k, list] of hits) {
      if (list.every((at) => now - at >= WINDOW_MS)) hits.delete(k);
    }
  }
  return true;
}

/** Digits-only phone for `https://wa.me/<number>` links (admin-only UI). */
export function whatsappHref(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
