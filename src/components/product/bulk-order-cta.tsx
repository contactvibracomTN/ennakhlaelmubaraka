import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PackageSearch } from "lucide-react";

/**
 * Bulk-order card at the foot of EVERY product sheet (PO 13/10/2026):
 * "للطّلبيات الكبيرة (أكثر من 200 كغ) أنقر هنا" — the link opens the dedicated
 * /bulk-order page (warm greeting + form → WhatsApp + e-mail for records).
 */
export async function BulkOrderCta({ variant = "dates" }: { variant?: "dates" | "gifts" } = {}) {
  const t = await getTranslations(variant === "gifts" ? "product" : "product");
  const tb = await getTranslations("bulkOrder");

  const href = variant === "gifts" ? "/gift-request" : "/bulk-order";
  const text = t("bulkOrderText");
  const linkLabel = t("bulkOrderLink");

  return (
    <section
      aria-label={tb("eyebrow")}
      className="mt-16 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-gold/50 bg-gold-light/25 px-6 py-7 sm:px-10"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
          <PackageSearch className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="max-w-2xl text-base leading-relaxed text-charcoal/90">
          {text}{" "}
          <Link
            href={href}
            className="font-bold text-bordeaux underline decoration-bordeaux/40 underline-offset-4 transition-colors hover:text-forest hover:decoration-forest/40"
          >
            {linkLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}