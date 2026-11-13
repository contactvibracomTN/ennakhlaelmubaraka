/**
 * Testimonial notification e-mail.
 *
 * Neon Postgres is the durable store in production. This e-mail is a backup
 * notification (and the local fallback when SMTP is configured but the
 * database is not). It always carries the full record so the owner can
 * re-create it from /admin/testimonials if needed.
 *
 * SMTP is the same integration already used by /api/orders/notify.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/config/site.config";
import { logsDir } from "@/lib/admin/paths";
import type { Testimonial } from "@/types/testimonial";

const RATING_LABELS: Record<number, string> = {
  1: "1/5 — faible / ضعيف",
  2: "2/5 — passable / مقبول",
  3: "3/5 — bien / جيد",
  4: "4/5 — très bien / جيد جدًا",
  5: "5/5 — excellent / ممتاز",
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#6f6659;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#23211d;font-size:14px">${esc(value)}</td></tr>`;
}

function buildText(t: Testimonial): string {
  return [
    "تقييم جديد — النخلة المباركة / Nouveau témoignage — Al Nakhlah Al Mubarakah",
    "",
    `ID: ${t.id}`,
    `Date: ${t.createdAt}`,
    `Source: ${t.source}`,
    `Langue: ${t.locale}`,
    "",
    `Nom / الاسم: ${t.name}`,
    `WhatsApp: ${t.whatsapp}`,
    `Profession / المهنة: ${t.job || "—"}`,
    `Nationalité / الجنسية: ${t.nationality || "—"}`,
    `Note / التقييم: ${RATING_LABELS[t.rating] ?? `${t.rating}/5`}`,
    "",
    "Message / الرسالة:",
    t.message,
    "",
    "—",
    "Le numéro WhatsApp est confidentiel : ne jamais le publier sur le site.",
    "Gérer les témoignages : /admin/testimonials.",
  ].join("\n");
}

function buildHtml(t: Testimonial): string {
  const rating = RATING_LABELS[t.rating] ?? `${t.rating}/5`;
  return `<!doctype html>
<html lang="fr"><body style="margin:0;background:#fbf5ee;font-family:Arial,Helvetica,sans-serif;color:#23211d">
  <div style="max-width:640px;margin:0 auto;padding:24px">
    <div style="background:#122517;color:#fbf5ee;border-radius:16px 16px 0 0;padding:20px 24px">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#dec390">آراء عملائنا — Témoignages</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:700">Nouveau témoignage client</h1>
    </div>
    <div style="background:#ffffff;border:1px solid #e6dbc8;border-top:0;border-radius:0 0 16px 16px;padding:8px 12px 20px">
      <table style="width:100%;border-collapse:collapse">
        ${row("Nom / الاسم", t.name)}
        ${row("WhatsApp", t.whatsapp)}
        ${row("Profession / المهنة", t.job || "—")}
        ${row("Nationalité / الجنسية", t.nationality || "—")}
        ${row("Note / التقييم", rating)}
        ${row("Langue", t.locale)}
        ${row("Source", t.source)}
        ${row("Date", t.createdAt)}
        ${row("ID", t.id)}
      </table>
      <h2 style="margin:20px 12px 6px;font-size:14px;color:#6f6659;text-transform:uppercase;letter-spacing:1px">Message / الرسالة</h2>
      <p style="margin:0 12px;padding:14px 16px;background:#fbf5ee;border-inline-start:3px solid #dec390;border-radius:8px;font-size:15px;line-height:1.7;white-space:pre-wrap">${esc(t.message)}</p>
      <p style="margin:20px 12px 0;font-size:12px;line-height:1.6;color:#6f6659">
        Le numéro WhatsApp est <strong>confidentiel</strong> : ne jamais le publier sur le site.<br>
        Gérer les témoignages : <code>/admin/testimonials</code>.
      </p>
    </div>
  </div>
</body></html>`;
}

export interface EmailResult {
  ok: boolean;
  /** Human-readable detail (French, for the admin/logs). */
  detail?: string;
  /** true when SMTP was not configured and the record went to the log file. */
  logged?: boolean;
}

/**
 * Send the testimonial to the owner. When SMTP is not configured (or fails),
 * append it to `logs/testimonials-email.jsonl` so nothing is silently lost.
 */
export async function sendTestimonialNotification(t: Testimonial): Promise<EmailResult> {
  const to = process.env.TESTIMONIALS_EMAIL?.trim() || siteConfig.email;
  const from = process.env.ORDER_FROM || process.env.SMTP_USER || to;
  const subject = `تقييم جديد / Nouveau témoignage — ${t.name} (${t.rating}/5)`;
  const transporter = getTransporter();

  if (!transporter) {
    const logged = logFallback(t, to, "SMTP non configuré");
    return { ok: logged, logged, detail: "SMTP non configuré — témoignage consigné dans logs/testimonials-email.jsonl." };
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: buildText(t),
      html: buildHtml(t),
    });
    return { ok: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const logged = logFallback(t, to, detail);
    return { ok: false, logged, detail: `Envoi e-mail impossible : ${detail}` };
  }
}

function logFallback(t: Testimonial, to: string, reason: string): boolean {
  try {
    mkdirSync(logsDir(), { recursive: true });
    appendFileSync(
      join(logsDir(), "testimonials-email.jsonl"),
      JSON.stringify({ at: new Date().toISOString(), to, reason, testimonial: t }) + "\n",
      "utf8",
    );
    return true;
  } catch {
    return false;
  }
}
