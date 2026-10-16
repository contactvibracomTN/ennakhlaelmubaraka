/**
 * Bank transfer details — VALIDATED FACTS, read from the environment.
 * ---------------------------------------------------------------------------
 * An IBAN is the single most damaging thing to invent on a shop: a customer who
 * transfers to a wrong account loses the money and the trust. The rules are
 * therefore absolute:
 *
 *   1. **Never hard-code a bank value in the source.** Every field below is read
 *      from `NEXT_PUBLIC_BANK_*`. The `NEXT_PUBLIC_` prefix is deliberate: a bank
 *      account holder has to be readable by the customer's browser so they can
 *      copy it, and `next build` inlines these values for exactly that reason.
 *   2. **Never display an unchecked value.** `readBankTransfer()` only promotes
 *      the block to `VALIDATED` when the IBAN passes the ISO 13616 mod-97 check
 *      *and* the bank name and account name are present. Anything else stays
 *      `TO_VALIDATE`, the payment page hides the copy button, and the site says
 *      "bank details being confirmed".
 *   3. **Provenance travels with the value.** The certificate this came from
 *      (Al Rajhi Bank "IBAN Letter", ref. 54997526, 24/09/2026) is recorded in
 *      `.env.local` next to the values themselves. If they ever change, the
 *      comment must change with them.
 *
 * `import.meta`/`process.env` note: Next.js inlines `process.env.NEXT_PUBLIC_*`
 * at build time and cannot inline a dynamically-computed key, hence the
 * explicit, spelled-out reads below.
 */

/** Truth markers — same vocabulary as the rest of the data layer. */
export type BankStatus = "VALIDATED" | "TO_VALIDATE";

/** Fields needed before the site is allowed to print bank details. */
interface BankFields {
  bankName: string;
  accountName: string;
  /** Compact form (no spaces) — the value actually validated. */
  iban: string;
  accountNumber: string;
  /** Provenance of the values above, shown to the customer as reassurance. */
  certificateRef: string;
  certificateDate: string;
}

/** Explicit reads — Next.js cannot inline `process.env[key]`. */
function readEnvFields(): BankFields {
  return {
    bankName: (process.env.NEXT_PUBLIC_BANK_NAME ?? "").trim(),
    accountName: (process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "").trim(),
    iban: (process.env.NEXT_PUBLIC_BANK_IBAN ?? "").replace(/\s+/g, ""),
    accountNumber: (process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "").trim(),
    certificateRef: (process.env.NEXT_PUBLIC_BANK_CERT_REF ?? "").trim(),
    certificateDate: (process.env.NEXT_PUBLIC_BANK_CERT_DATE ?? "").trim(),
  };
}

/**
 * ISO 13616 mod-97 validation.
 *
 * The first four characters are the country code + two check digits. The check
 * is computed by moving them to the end, mapping letters A→10…Z→35 (so
 * `U`→30), and taking the remainder of the resulting integer by 97. A valid
 * IBAN leaves remainder 1.
 *
 * Returns `false` for anything that is not `AD`+2 check digits+`n`{0,30}.
 */
export function isValidIban(iban: string): boolean {
  const compact = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(compact)) {
    return false;
  }

  const rearranged = compact.slice(4) + compact.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    // Digits contribute themselves; letters expand to their two-digit value.
    const chunk = /\d/.test(char) ? char : String(char.charCodeAt(0) - 55);
    remainder = Number(`${remainder}${chunk}`) % 97;
  }
  return remainder === 1;
}

/** `SA9380000351608016596327` → `SA93 8000 0351 6080 1659 6327` (4-char groups). */
export function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** Spaces as typed by the owner (e.g. `3510 0001 0006 0865 96327`). */
function formatAccountNumber(value: string): string {
  return value.replace(/\s+/g, "");
}

/**
 * The bank block the UI renders, plus the reason it is not shown when empty.
 * `status` is the single source of truth: no component decides for itself.
 */
export const bankTransfer = (() => {
  const fields = readEnvFields();

  const ibanLooksReal = fields.iban.length > 0 && isValidIban(fields.iban);
  const complete =
    ibanLooksReal && fields.bankName.length > 0 && fields.accountName.length > 0;

  return {
    status: (complete ? "VALIDATED" : "TO_VALIDATE") as BankStatus,
    /** Why the block is withheld — surfaced to the owner, not the customer. */
    reason: !fields.iban
      ? "NEXT_PUBLIC_BANK_IBAN is empty"
      : !ibanLooksReal
        ? "NEXT_PUBLIC_BANK_IBAN fails the ISO 13616 mod-97 check"
        : !fields.bankName
          ? "NEXT_PUBLIC_BANK_NAME is empty"
          : !fields.accountName
            ? "NEXT_PUBLIC_BANK_ACCOUNT_NAME is empty"
            : null,
    bankName: fields.bankName,
    accountName: fields.accountName,
    iban: fields.iban,
    accountNumber: fields.accountNumber,
    /** Shown next to the IBAN so the customer can see where the data comes from. */
    certificateRef: fields.certificateRef,
    certificateDate: fields.certificateDate,
    /** Pre-grouped for display; empty when there is nothing validated to show. */
    get ibanFormatted() {
      return complete ? formatIban(fields.iban) : "";
    },
    get accountNumberFormatted() {
      return complete ? formatAccountNumber(fields.accountNumber) : "";
    },
  } as const;
})();

/**
 * True only when the site may print bank details (IBAN mod-97 valid + bank name
 * + account name). The payment page, the checkout card and the WhatsApp order
 * message all gate on this — never on the raw strings.
 */
export function hasCompleteBankDetails(): boolean {
  return bankTransfer.status === "VALIDATED";
}

/**
 * The bank lines appended to the WhatsApp order message for a bank transfer.
 * Returns an empty list while the details are unconfirmed, so a customer is
 * never handed a half-filled payment instruction over chat.
 */
export function bankTransferOrderLines(
  labels: { iban: string; beneficiary: string },
): string[] {
  if (!hasCompleteBankDetails()) {
    return [];
  }
  return [
    `${labels.iban}: ${bankTransfer.iban}`,
    `${labels.beneficiary}: ${bankTransfer.accountName}`,
    bankTransfer.bankName
      ? `${labels.beneficiary} — ${bankTransfer.bankName}`
      : "",
  ].filter(Boolean);
}