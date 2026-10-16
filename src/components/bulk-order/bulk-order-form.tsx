"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { buildWhatsAppUrl, siteConfig } from "@/lib/config/site.config";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import type { Locale } from "@/lib/config/locales";

interface BulkOrderFields {
  fullName: string;
  city: string;
  phone: string;
  quantity: string;
  variety: string;
  grade: string;
}

const EMPTY: BulkOrderFields = {
  fullName: "",
  city: "",
  phone: "",
  quantity: "",
  variety: "",
  grade: "",
};

/**
 * Bulk-order form (PO 13/10/2026) — الإسم الكامل · المدينة · رقم الهاتف/الواتس ·
 * الكمّية المطلوبة · النّوع المرغوب فيه · الصّنف. Sends a pre-filled WhatsApp
 * message (fast reply) and opens the mail client with a copy for follow-up and
 * archiving. Nothing is stored on the server.
 */
export function BulkOrderForm() {
  const t = useTranslations("bulkOrder");
  const locale = useLocale() as Locale;
  const [values, setValues] = useState<BulkOrderFields>(EMPTY);

  const set =
    (key: keyof BulkOrderFields) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value }));

  const ready =
    values.fullName.trim() !== "" &&
    values.city.trim() !== "" &&
    values.phone.trim() !== "" &&
    values.quantity.trim() !== "" &&
    values.variety.trim() !== "";

  const fallback = (value: string) => value.trim() || "—";
  const message = t("message", {
    name: fallback(values.fullName),
    city: fallback(values.city),
    phone: fallback(values.phone),
    quantity: fallback(values.quantity),
    variety: fallback(values.variety),
    grade: fallback(values.grade),
  });

  const openWhatsApp = () => {
    if (!ready) return;
    window.open(
      buildWhatsAppUrl(message, locale),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const sendEmail = () => {
    if (!ready) return;
    const subject = t("emailSubject", { name: fallback(values.fullName) });
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/30";

  return (
    <form className="grid gap-5 sm:grid-cols-2">
      <div>
        <label
          htmlFor="bulk-fullName"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("fullName")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input
          id="bulk-fullName"
          type="text"
          required
          autoComplete="name"
          value={values.fullName}
          onChange={set("fullName")}
          placeholder={t("fullNamePh")}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="bulk-city"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("city")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input
          id="bulk-city"
          type="text"
          required
          autoComplete="address-level2"
          value={values.city}
          onChange={set("city")}
          placeholder={t("cityPh")}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="bulk-phone"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("phone")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input
          id="bulk-phone"
          type="tel"
          required
          autoComplete="tel"
          dir="ltr"
          value={values.phone}
          onChange={set("phone")}
          placeholder={t("phonePh")}
          className={`${inputClass} text-start`}
        />
      </div>

      <div>
        <label
          htmlFor="bulk-quantity"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("quantity")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input
          id="bulk-quantity"
          type="text"
          required
          value={values.quantity}
          onChange={set("quantity")}
          placeholder={t("quantityPh")}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="bulk-variety"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("variety")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input
          id="bulk-variety"
          type="text"
          required
          value={values.variety}
          onChange={set("variety")}
          placeholder={t("varietyPh")}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="bulk-grade"
          className="mb-1.5 block text-sm font-semibold text-forest"
        >
          {t("grade")}
        </label>
        <input
          id="bulk-grade"
          type="text"
          value={values.grade}
          onChange={set("grade")}
          placeholder={t("gradePh")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openWhatsApp}
            disabled={!ready}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-success px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
          >
            <WhatsAppLogo className="h-5 w-5" aria-hidden="true" />
            {t("submitWhatsApp")}
          </button>
          <button
            type="button"
            onClick={sendEmail}
            disabled={!ready}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/25 px-6 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("submitEmail")}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted">{t("emailNote")}</p>
      </div>
    </form>
  );
}