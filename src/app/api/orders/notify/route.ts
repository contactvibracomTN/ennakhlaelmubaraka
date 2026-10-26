import { NextRequest, NextResponse } from "next/server";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import nodemailer from "nodemailer";

const ORDER_EMAIL = process.env.ORDER_EMAIL || "commandes@ennakhlaelmubaraka.com";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transporter = getTransporter();
    const from = process.env.ORDER_FROM || process.env.SMTP_USER || ORDER_EMAIL;
    const text = body?.message || JSON.stringify(body, null, 2);
    const subject = body?.type === "gift-request" 
      ? `طلب هدايا / Gift Request — ${body.fullName || ""}`
      : `طلب بكميات كبيرة / Bulk Order — ${body.fullName || ""}`;

    if (transporter) {
      await transporter.sendMail({
        from,
        to: ORDER_EMAIL,
        subject,
        text,
        replyTo: body?.phone ? `+${String(body.phone).replace(/[^0-9]/g, "")}` : undefined,
      });
      return NextResponse.json({ ok: true, emailed: true });
    }

    // Fallback: log if SMTP not configured
    const logDir = join(process.cwd(), "logs");
    try { mkdirSync(logDir, { recursive: true }); } catch {}
    const line = JSON.stringify({ ts: new Date().toISOString(), type: body?.type, to: ORDER_EMAIL, subject, body }) + "\n";
    try { appendFileSync(join(logDir, "orders-email.jsonl"), line); } catch {}
    return NextResponse.json({ ok: true, emailed: false, queued: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
}
