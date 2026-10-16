import { guardAdmin } from "../../guard";
import { readDates } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { notFound } from "next/navigation";
import { DateItemEditor } from "../../components/date-editor";
import Link from "next/link";
import type { DateProduct } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function AdminDateEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardAdmin();
  const { slug } = await params;
  const item = readDates().find((p) => p.slug === decodeURIComponent(slug));
  if (!item) notFound();
  const statuses = computeItemStatuses("date", item.slug, item.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/dates" className="text-xs text-emerald-700 underline">
          ← Retour aux produits
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">{item.name.ar || item.slug}</h1>
      </div>
      <DateItemEditor
        item={item as DateProduct}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}