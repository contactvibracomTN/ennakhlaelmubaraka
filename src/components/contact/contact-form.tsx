"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";

/** Contact form — opens WhatsApp with the visitor's message pre-filled. */
export function ContactForm() {
  const t = useTranslations("contact");
  const tw = useTranslations("whatsapp");
  const locale = useLocale() as Locale;

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      tw("greeting"),
      "",
      name.trim() ? `${name.trim()}:` : "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      buildWhatsAppUrl(body, locale),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-2 font-arabic-display text-xl font-bold text-forest">
        <MessageCircle className="h-5 w-5 text-success" aria-hidden="true" />
        {t("formTitle")}
      </h2>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-forest">
            {t("formName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-ivory-deep/30 px-4 py-3 text-sm text-forest placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-forest">
            {t("formMessage")}
          </span>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-line bg-ivory-deep/30 px-4 py-3 text-sm text-forest placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </label>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {t("formSend")}
        </button>
        <p className="text-center text-[0.65rem] text-muted">{t("formHint")}</p>
      </form>
    </div>
  );
}
