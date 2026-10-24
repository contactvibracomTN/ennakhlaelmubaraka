"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import type { Locale } from "@/lib/config/locales";

interface GiftRequestFields {
  fullName: string;
  city: string;
  phone: string;
  object: "large-order" | "box-diagnosis" | "institutions" | "";
  quantity: string;
  productType: string;
  organization: string;
  occasion: string;
  budget: string;
  deliveryDate: string;
  details: string;
}

const EMPTY: GiftRequestFields = {
  fullName: "",
  city: "",
  phone: "",
  object: "",
  quantity: "",
  productType: "",
  organization: "",
  occasion: "",
  budget: "",
  deliveryDate: "",
  details: "",
};

export function GiftRequestForm() {
  const t = useTranslations("giftRequest");
  const locale = useLocale() as Locale;
  const [values, setValues] = useState<GiftRequestFields>(EMPTY);

  const set = (key: keyof GiftRequestFields) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const ready = values.fullName.trim() !== "" && values.city.trim() !== "" && values.phone.trim() !== "" && values.object !== "";

  const fallback = (value: string) => value.trim() || "—";

  const message = t("message", {
    name: fallback(values.fullName),
    city: fallback(values.city),
    phone: fallback(values.phone),
    object: values.object ? t(`objectOptions.${values.object}`) : "—",
    quantity: fallback(values.quantity),
    productType: fallback(values.productType),
    organization: fallback(values.organization),
    occasion: fallback(values.occasion),
    budget: fallback(values.budget),
    deliveryDate: fallback(values.deliveryDate),
    details: fallback(values.details),
  });

  const openWhatsApp = async () => {
    if (!ready) return;
    // Try to send email in background
    try {
      fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gift-request",
          ...values,
          message,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
    window.open(buildWhatsAppUrl(message, locale), "_blank", "noopener,noreferrer");
  };

  const inputClass = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/30";

  return (
    <form className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="gift-fullName" className="mb-1.5 block text-sm font-semibold text-forest">
          {t("fullName")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input id="gift-fullName" type="text" required autoComplete="name" value={values.fullName} onChange={set("fullName")} placeholder={t("fullNamePh")} className={inputClass} />
      </div>

      <div>
        <label htmlFor="gift-city" className="mb-1.5 block text-sm font-semibold text-forest">
          {t("city")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input id="gift-city" type="text" required autoComplete="address-level2" value={values.city} onChange={set("city")} placeholder={t("cityPh")} className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="gift-phone" className="mb-1.5 block text-sm font-semibold text-forest">
          {t("phone")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <input id="gift-phone" type="tel" required autoComplete="tel" dir="ltr" value={values.phone} onChange={set("phone")} placeholder={t("phonePh")} className={`${inputClass} text-start sm:max-w-xs`} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="gift-object" className="mb-1.5 block text-sm font-semibold text-forest">
          {t("object")} <span aria-hidden="true" className="text-bordeaux">*</span>
        </label>
        <select id="gift-object" required value={values.object} onChange={set("object")} className={inputClass}>
          <option value="">{t("objectPh")}</option>
          <option value="large-order">{t("objectOptions.large-order")}</option>
          <option value="box-diagnosis">{t("objectOptions.box-diagnosis")}</option>
          <option value="institutions">{t("objectOptions.institutions")}</option>
        </select>
      </div>

      {(values.object === "large-order" || values.object === "institutions") && (
        <div>
          <label htmlFor="gift-quantity" className="mb-1.5 block text-sm font-semibold text-forest">{t("quantity")}</label>
          <input id="gift-quantity" type="text" value={values.quantity} onChange={set("quantity")} placeholder={t("quantityPh")} className={inputClass} />
        </div>
      )}

      {(values.object === "large-order" || values.object === "box-diagnosis") && (
        <div>
          <label htmlFor="gift-productType" className="mb-1.5 block text-sm font-semibold text-forest">{t("productType")}</label>
          <input id="gift-productType" type="text" value={values.productType} onChange={set("productType")} placeholder={t("productTypePh")} className={inputClass} />
        </div>
      )}

      {values.object === "institutions" && (
        <div>
          <label htmlFor="gift-organization" className="mb-1.5 block text-sm font-semibold text-forest">{t("organization")}</label>
          <input id="gift-organization" type="text" value={values.organization} onChange={set("organization")} placeholder={t("organizationPh")} className={inputClass} />
        </div>
      )}

      {(values.object === "box-diagnosis" || values.object === "institutions") && (
        <div>
          <label htmlFor="gift-occasion" className="mb-1.5 block text-sm font-semibold text-forest">{t("occasion")}</label>
          <input id="gift-occasion" type="text" value={values.occasion} onChange={set("occasion")} placeholder={t("occasionPh")} className={inputClass} />
        </div>
      )}

      {(values.object === "box-diagnosis" || values.object === "institutions") && (
        <div>
          <label htmlFor="gift-budget" className="mb-1.5 block text-sm font-semibold text-forest">{t("budget")}</label>
          <input id="gift-budget" type="text" value={values.budget} onChange={set("budget")} placeholder={t("budgetPh")} className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor="gift-deliveryDate" className="mb-1.5 block text-sm font-semibold text-forest">{t("deliveryDate")}</label>
        <input id="gift-deliveryDate" type="text" value={values.deliveryDate} onChange={set("deliveryDate")} placeholder={t("deliveryDatePh")} className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="gift-details" className="mb-1.5 block text-sm font-semibold text-forest">{t("details")}</label>
        <textarea id="gift-details" rows={4} value={values.details} onChange={set("details")} placeholder={t("detailsPh")} className={inputClass} />
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
        </div>
      </div>
    </form>
  );
}
