"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Copy-to-clipboard button for a short code (IBAN, account number, phone).
 *
 * Why it is a client component: the clipboard API only exists in the browser.
 * Why it is NOT a generic `<button onClick>`: copying an IBAN by hand from a
 * phone screen is where payment typos happen, so the control reports success
 * inline rather than relying on a transient toast, and it degrades to a
 * `document.execCommand` path for browsers that refuse the async clipboard.
 *
 * Accessibility: `aria-live="polite"` announces the confirmation, and the label
 * is always visible (not an icon-only button) so the action is discoverable.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
  className = "",
}: {
  /** The exact text placed on the clipboard — unformatted, no spaces added. */
  value: string;
  /** Accessible + visible label, e.g. "Copy the IBAN". */
  label: string;
  /** Confirmation announced after a successful copy. */
  copiedLabel: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for insecure contexts / older WebViews.
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setState("copied");
    } catch {
      setState("failed");
    }
    // Revert to idle so the button does not stay in a "done" state forever.
    window.setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:border-gold-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${className}`}
    >
      {state === "copied" ? (
        <Check aria-hidden className="size-3.5 text-success" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
      <span aria-live="polite">
        {state === "copied"
          ? copiedLabel
          : state === "failed"
            ? t("copyFailed")
            : label}
      </span>
    </button>
  );
}