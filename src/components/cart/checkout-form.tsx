"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/context/cart-context";
import { isDateProduct, type Product } from "@/types/product";
import type { DeliveryMode, OrderDraft, PaymentMethod } from "@/types/checkout";
import { formatMoney } from "@/types/money";
import { dateLineUnitPrice } from "@/lib/data/weight-price";
import { isFreeDeliveryEligible } from "@/lib/config/promos";
import type { Locale } from "@/lib/config/locales";

/** Client-ref for idempotency — kept out of the render path. */
function createOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}`;
}

/**
 * Prototype checkout: collects customer info, assembles an OrderDraft and
 * POSTs it to /api/orders which returns the wa.me deep link. Nothing is
 * ever charged in demo mode (Blueprint §12).
 */
export function CheckoutForm({
  products,
  bank,
}: {
  products: Product[];
  /**
   * Bank block, resolved on the server from `src/lib/config/bank.ts`. `status`
   * is what the form branches on — never on the presence of `iban`, so an
   * incomplete block can never be rendered as a payment instruction.
   */
  bank: {
    status: "VALIDATED" | "TO_VALIDATE";
    bankName: string;
    beneficiary: string;
    iban: string;
  };
}) {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const { items, clear } = useCart();

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMode>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("whatsapp");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const product = byId.get(item.productId);
        if (!product) return null;
        const unitPrice = isDateProduct(product)
          ? dateLineUnitPrice(product, item.weightKgs, item.gradeId)
          : product.price.amount;
        return { item, product, unitPrice };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [items, byId]);

  const subtotal = rows.reduce(
    (sum, r) => sum + r.unitPrice * r.item.quantity,
    0,
  );

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-semibold text-success">{t("success")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dates")}
            className="inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
          >
            {t("continue")}
          </button>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted">{t("cartEmpty")}</p>
        <button
          type="button"
          onClick={() => router.push("/dates")}
          className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
        >
          {t("backToCatalog")}
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const draft: OrderDraft = {
        locale,
        items: rows.map((r) => r.item),
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          addressLine:
            delivery === "delivery" ? address.trim() || undefined : undefined,
          notes: notes.trim() || undefined,
        },
        delivery,
        payment: { method: payment },
        totals: {
          subtotal,
          currency: "SAR",
          discount: 0,
          shipping: 0,
          total: subtotal,
        },
        orderId: createOrderId(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await res.json()) as {
        ok: boolean;
        whatsappUrl?: string;
        error?: string;
      };

      if (!res.ok || !result.ok || !result.whatsappUrl) {
        setError(t("error"));
        setSending(false);
        return;
      }

      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      clear();
      setSuccess(true);
      setSending(false);
    } catch {
      setError(t("error"));
      setSending(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-forest placeholder:text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <form
      onSubmit={submit}
      className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-start"
    >
      <div className="space-y-8">
        {/* Customer */}
        <fieldset className="rounded-3xl border border-line bg-white p-6">
          <legend className="sr-only">{t("customerName")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-forest">
                {t("customerName")} *
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-forest">
                {t("customerPhone")} *
              </span>
              <input
                required
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 5X XXX XXXX"
                className={`${inputCls} text-end`}
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-forest">
                {t("customerEmail")}
              </span>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputCls} text-end`}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-forest">
                {t("customerCity")}
              </span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
                autoComplete="address-level2"
              />
            </label>
            {delivery === "delivery" ? (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-forest">
                  {t("customerAddress")}
                </span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className={inputCls}
                  autoComplete="street-address"
                />
              </label>
            ) : null}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-forest">
                {t("notes")}
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputCls}
              />
            </label>
          </div>
        </fieldset>

        {/* Delivery mode */}
        <fieldset className="rounded-3xl border border-line bg-white p-6">
          <legend className="text-sm font-semibold text-forest">
            {t("deliveryMode")}
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["delivery", "pickup"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDelivery(mode)}
                aria-pressed={delivery === mode}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  delivery === mode
                    ? "border-gold-deep bg-gold-light/40 text-forest"
                    : "border-line bg-ivory-deep/30 text-muted hover:border-gold/60"
                }`}
              >
                {t(mode)}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Payment */}
        <fieldset className="rounded-3xl border border-line bg-white p-6">
          <legend className="text-sm font-semibold text-forest">
            {t("paymentMethod")}
          </legend>
          {payment === "bank-transfer" ? (
            bank.status === "VALIDATED" ? (
              /* The real account, from the official bank certificate. */
              <dl className="mt-3 space-y-1 rounded-xl bg-ivory-deep px-4 py-3 text-xs text-muted">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt>{t("bankName")}</dt>
                  <dd>
                    <bdi dir="ltr" className="font-semibold text-forest">
                      {bank.bankName}
                    </bdi>
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt>{t("beneficiary")}</dt>
                  <dd>
                    <bdi dir="ltr" className="font-semibold text-forest">
                      {bank.beneficiary}
                    </bdi>
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt>{t("iban")}</dt>
                  <dd>
                    <bdi
                      dir="ltr"
                      className="font-mono font-semibold tracking-wide text-forest"
                    >
                      {bank.iban}
                    </bdi>
                  </dd>
                </div>
              </dl>
            ) : (
              /* Never print a half-filled payment instruction. */
              <p className="mt-3 rounded-xl bg-ivory-deep px-4 py-3 text-xs leading-relaxed text-muted">
                {t("bankPending")}
              </p>
            )
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["whatsapp", "cod", "bank-transfer", "online"] as const).map(
              (method) => {
                const disabled = method === "online";
                const active = payment === method;
                return (
                  <button
                    key={method}
                    type="button"
                    disabled={disabled}
                    onClick={() => setPayment(method)}
                    aria-pressed={active}
                    className={`relative rounded-xl border px-4 py-3 text-sm font-medium text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      disabled
                        ? "cursor-not-allowed border-line bg-ivory-deep/30 text-muted/60"
                        : active
                          ? "border-gold-deep bg-gold-light/40 text-forest"
                          : "border-line bg-white text-muted hover:border-gold/60"
                    }`}
                  >
                    {t(method)}
                    {disabled ? (
                      <span className="absolute top-2 end-2 rounded-full bg-line px-2 py-0.5 text-[0.6rem] font-semibold text-muted">
                        {t("onlineSoon")}
                      </span>
                    ) : null}
                  </button>
                );
              },
            )}
          </div>
          <p className="mt-3 text-[0.65rem] text-muted">
            {t("paymentDemoNote")}
          </p>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-arabic-display text-lg font-bold text-forest">
          {t("title")}
        </h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t("subtotal")}</dt>
            <dd className="font-semibold text-forest">
              {formatMoney[locale](subtotal)}
            </dd>
          </div>
          {delivery === "delivery" ? (
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd className="text-xs font-medium text-success">
                {isFreeDeliveryEligible(subtotal)
                  ? t("freeShipping")
                  : t("shippingToConfirm")}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-line pt-3">
            <dt className="font-semibold text-forest">{t("total")}</dt>
            <dd className="font-arabic-display text-xl font-bold text-date-deep">
              {formatMoney[locale](subtotal)}
            </dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={sending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("sending")}
            </>
          ) : (
            t("placeOrder")
          )}
        </button>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-danger/10 px-4 py-2.5 text-xs text-danger"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            role="status"
            className="mt-3 rounded-xl bg-success/10 px-4 py-2.5 text-xs font-medium text-success"
          >
            {t("success")}
          </p>
        ) : null}

        <p className="mt-4 text-center text-[0.65rem] text-muted">
          {tc("demoPricesBanner")}
        </p>
      </aside>
    </form>
  );
}
