import { Banknote, MessageCircle } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { bankTransfer, hasCompleteBankDetails } from "@/lib/config/bank";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import { CopyButton } from "@/components/ui/copy-button";
import type { Locale } from "@/lib/config/locales";

/** `label` — value row, with the value forced LTR (IBANs are Latin digits). */
function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2">
        {/* `bdi dir=ltr` keeps an LTR value readable inside an RTL paragraph. */}
        <bdi
          dir="ltr"
          className={`font-semibold text-charcoal ${mono ? "font-mono tracking-wide" : ""}`}
        >
          {value}
        </bdi>
        {children}
      </dd>
    </div>
  );
}

/**
 * Bank transfer card — the single place the site is allowed to print an IBAN.
 *
 * Two states, decided by `hasCompleteBankDetails()` and nothing else:
 *
 *   * `VALIDATED` — the IBAN passes its ISO 13616 mod-97 check and the bank
 *     name / account name are present. Everything is printed with a copy
 *     button, plus the provenance of the certificate so the customer (and the
 *     owner) can see these are not invented numbers.
 *   * `TO_VALIDATE` — the env vars are missing or the IBAN failed its check.
 *     No number is printed at all, the copy buttons do not exist, and the
 *     customer is pointed at WhatsApp. A shop that cannot show a valid IBAN
 *     must not show a broken one.
 *
 * Used by the checkout (when the customer picks "bank transfer") and by
 * `/[locale]/payment`.
 */
export async function BankDetailsCard({
  compact = false,
}: {
  /** `compact` drops the intro paragraph and the provenance footer. */
  compact?: boolean;
}) {
  const t = await getTranslations("bank");
  const locale = (await getLocale()) as Locale;
  const validated = hasCompleteBankDetails();

  const whatsappHref = buildWhatsAppUrl(t("whatsappAsk"), locale);

  return (
    <section
      aria-labelledby="bank-details-title"
      className="rounded-3xl border border-line bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex size-10 items-center justify-center rounded-full bg-gold-light/50 text-forest"
        >
          <Banknote className="size-5" />
        </span>
        <h2
          id="bank-details-title"
          className="font-arabic-display text-lg font-bold text-forest"
        >
          {t("title")}
        </h2>
      </div>

      {validated ? (
        <>
          {!compact ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t("intro")}
            </p>
          ) : null}

          <dl className="mt-5">
            <DetailRow label={t("bankName")} value={bankTransfer.bankName}>
              <CopyButton
                value={bankTransfer.bankName}
                label={t("copyValue")}
                copiedLabel={t("copied")}
              />
            </DetailRow>
            <DetailRow
              label={t("accountName")}
              value={bankTransfer.accountName}
            >
              <CopyButton
                value={bankTransfer.accountName}
                label={t("copyValue")}
                copiedLabel={t("copied")}
              />
            </DetailRow>
            <DetailRow
              label={t("iban")}
              value={bankTransfer.ibanFormatted}
              mono
            >
              <CopyButton
                value={bankTransfer.iban}
                label={t("copyIban")}
                copiedLabel={t("copied")}
              />
            </DetailRow>
            {bankTransfer.accountNumber ? (
              <DetailRow
                label={t("accountNumber")}
                value={bankTransfer.accountNumber}
                mono
              >
                <CopyButton
                  value={bankTransfer.accountNumber}
                  label={t("copyValue")}
                  copiedLabel={t("copied")}
                />
              </DetailRow>
            ) : null}
          </dl>

          {/* The transfer must be traceable: tell the customer what to put in
              the reference field, so our side can match the payment. */}
          <p className="mt-4 rounded-xl bg-ivory-deep/60 px-4 py-3 text-xs leading-relaxed text-forest">
            {t("referenceNote")}
          </p>

          {!compact ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {t("provenance", {
                bank: bankTransfer.bankName,
                ref: bankTransfer.certificateRef,
                date: bankTransfer.certificateDate,
              })}
            </p>
          ) : null}
        </>
      ) : (
        <div className="mt-4 rounded-xl bg-ivory-deep/60 p-5">
          <p className="text-sm font-semibold text-forest">{t("pendingTitle")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("pendingBody")}
          </p>
          <a
            href={whatsappHref}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <MessageCircle aria-hidden className="size-4" />
            {t("whatsappAsk")}
          </a>
        </div>
      )}
    </section>
  );
}