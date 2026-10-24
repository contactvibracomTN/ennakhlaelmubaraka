import { guardAdmin } from "../../guard";
import { readDates, readGuide } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { makeLocalized } from "@/lib/admin/shared";
import { GuideItemEditor } from "../../components/guide-editor";
import Link from "next/link";
import type { GuideVariety } from "@/types/guide";

export const dynamic = "force-dynamic";

function emptyVariety(nextNumber: number): GuideVariety {
  return {
    slug: "",
    number: String(nextNumber).padStart(2, "0"),
    nameSearch: "",
    title: makeLocalized(),
    caption: makeLocalized(),
    origin: makeLocalized(),
    intro: makeLocalized(),
    timeline: [],
    strengths: [],
    taste: makeLocalized(),
    region: "gulf",
    texture: "soft",
    nutrition: [],
    resources: [],
    productSlug: "",
    image: "",
    contentStatus: "draft",
  };
}

export default async function AdminNewGuidePage() {
  await guardAdmin();
  const varieties = readGuide();
  const nextNumber = varieties.length + 1;
  const item = emptyVariety(nextNumber);
  const statuses = computeItemStatuses("guide", item.slug, item.title);

  const productOptions = readDates().map((product) => ({
    value: product.slug,
    label: `${product.name.ar || product.slug} (${product.slug})`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/guide" className="text-xs text-emerald-700 underline">
          ← Retour au guide des dattes
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">Nouvelle variété</h1>
      </div>
      <GuideItemEditor
        item={item}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
        productOptions={productOptions}
        existingSlugs={varieties.map((v) => v.slug)}
      />
    </div>
  );
}
