import { guardAdmin } from "../../guard";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { makeLocalized } from "@/lib/admin/shared";
import { DateItemEditor } from "../../components/date-editor";
import Link from "next/link";
import type { DateProduct } from "@/types/product";

export const dynamic = "force-dynamic";

function emptyDate(): DateProduct {
  return {
    id: `date-${Date.now().toString(36)}`,
    slug: "",
    kind: "date",
    category: "medina",
    unit: "kg",
    name: makeLocalized(),
    teaser: makeLocalized(),
    origin: makeLocalized(),
    images: [],
    price: { amount: 0, currency: "SAR" },
    availability: "in-stock",
    contentStatus: "demo",
    weightOptions: [],
  };
}

export default async function AdminNewDatePage() {
  await guardAdmin();
  const source = getConfiguredSourceLocale();
  const item = emptyDate();
  // seed statuses for the source locale so the UI aligns
  const statuses = computeItemStatuses("date", item.slug, item.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/dates" className="text-xs text-emerald-700 underline">
          ← Retour aux produits
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">Nouveau produit (dates)</h1>
      </div>
      <DateItemEditor
        item={item}
        statuses={statuses}
        sourceLocale={source}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}