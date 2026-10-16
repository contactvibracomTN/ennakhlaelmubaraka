import { guardAdmin } from "../../guard";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { makeLocalized } from "@/lib/admin/shared";
import { GiftItemEditor } from "../../components/gift-editor";
import Link from "next/link";
import type { GiftProduct } from "@/types/product";

export const dynamic = "force-dynamic";

function emptyGift(): GiftProduct {
  return {
    id: `gift-${Date.now().toString(36)}`,
    slug: "",
    kind: "gift",
    category: "occasions",
    name: makeLocalized(),
    teaser: makeLocalized(),
    images: [],
    price: { amount: 0, currency: "SAR" },
    availability: "in-stock",
    contentStatus: "demo",
    contents: [],
  };
}

export default async function AdminNewGiftPage() {
  await guardAdmin();
  const item = emptyGift();
  const statuses = computeItemStatuses("gift", item.slug, item.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/gifts" className="text-xs text-emerald-700 underline">
          ← Retour aux cadeaux
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">Nouveau cadeau</h1>
      </div>
      <GiftItemEditor
        item={item}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}