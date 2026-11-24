import { guardAdmin } from "../../guard";
import { readGifts } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { notFound } from "next/navigation";
import { GiftItemEditor } from "../../components/gift-editor";
import Link from "next/link";
import type { GiftProduct } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function AdminGiftEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardAdmin();
  const { slug } = await params;
  const key = decodeURIComponent(slug);
  // Legacy items saved with an empty slug are still reachable by technical id.
  const item = readGifts().find((p) => p.slug === key || p.id === key);
  if (!item) notFound();
  const statuses = computeItemStatuses("gift", item.slug || item.id, item.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/gifts" className="text-xs text-emerald-700 underline">
          ← Retour aux cadeaux
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">{item.name.ar || item.name.en || item.id}</h1>
      </div>
      <GiftItemEditor
        item={item as GiftProduct}
        originalKey={key}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}