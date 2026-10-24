import { guardAdmin } from "../../guard";
import { readDates, readGuide } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { notFound } from "next/navigation";
import { GuideItemEditor } from "../../components/guide-editor";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminGuideEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardAdmin();
  const { slug } = await params;
  const varieties = readGuide();
  const item = varieties.find((v) => v.slug === decodeURIComponent(slug));
  if (!item) notFound();
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
        <h1 className="text-xl font-bold text-emerald-950">{item.title.ar || item.slug}</h1>
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
