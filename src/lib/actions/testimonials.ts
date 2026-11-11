"use server";

/**
 * Public testimonial submission (the only unauthenticated write path).
 *
 * Pipeline: honeypot → timing → best-effort throttle → zod validation →
 * JSON store (when writable) → e-mail to the owner (always).
 *
 * On Vercel the JSON write fails with EROFS; the e-mail is then the durable
 * record and the submission still succeeds. See RAPPORT-TEMOIGNAGES.md.
 */
import { headers } from "next/headers";
import { testimonialSubmissionSchema } from "@/lib/data/content-schema";
import { allowSubmission, appendTestimonial, buildTestimonial } from "@/lib/testimonials/service";
import { sendTestimonialNotification } from "@/lib/testimonials/email";

export type TestimonialFormResult =
  | { ok: true; stored: boolean; emailed: boolean }
  | { ok: false; code: "invalid" | "rate-limit" | "error" };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitTestimonialAction(formData: FormData): Promise<TestimonialFormResult> {
  // 1. Honeypot — bots fill every field. Silently accept, do nothing.
  if (str(formData, "website").trim().length > 0) {
    return { ok: true, stored: false, emailed: false };
  }

  // 2. Timing — a human cannot complete the form in under two seconds.
  const startedAt = Number(str(formData, "startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 2000) {
    return { ok: false, code: "rate-limit" };
  }

  // 3. Best-effort throttle by IP (per server instance).
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || null;
  if (!allowSubmission(ip)) return { ok: false, code: "rate-limit" };

  // 4. Strict server-side validation.
  const parsed = testimonialSubmissionSchema.safeParse({
    name: str(formData, "name"),
    whatsapp: str(formData, "whatsapp"),
    job: str(formData, "job"),
    nationality: str(formData, "nationality"),
    message: str(formData, "message"),
    rating: str(formData, "rating"),
    locale: str(formData, "locale") || "ar",
  });
  if (!parsed.success) return { ok: false, code: "invalid" };

  const testimonial = buildTestimonial(parsed.data, {
    source: "website",
    locale: parsed.data.locale,
  });

  // 5. Persist + notify. At least one must succeed, otherwise the data is lost.
  const stored = appendTestimonial(testimonial);
  const email = await sendTestimonialNotification(testimonial);
  const emailed = email.ok || Boolean(email.logged);

  if (!stored.ok && !emailed) {
    return { ok: false, code: "error" };
  }

  return { ok: true, stored: stored.ok, emailed };
}
