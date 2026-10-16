import { guardAdmin } from "../guard";
import { readGifts } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { ItemList, type ItemListRow } from "../components/item-list";

export const dynamic = "force-dynamic";

export default async function AdminGiftsPage() {
  await guardAdmin();
  const gifts = readGifts();
  const rows: ItemListRow[] = gifts.map((p) => {
    const statuses = computeItemStatuses("gift", p.slug, p.name);
    const pending = Object.values(statuses).filter((s) => s.status !== "validated").length;
    return {
      href: `/admin/gifts/${encodeURIComponent(p.slug)}`,
      thumb: p.images?.[0],
      title: p.name.ar || p.name.en || p.slug,
      slug: p.slug,
      badge: p.contentStatus,
      note:
        pending === 0
          ? "✓ toutes versions validées"
          : `${pending} version(s) à valider ou manquante(s) — ${(p.price?.amount ?? 0).toLocaleString("fr-FR")} SAR`,
    };
  });

  return (
    <ItemList
      title="Produits — cadeaux"
      description="Corbeilles et boîtes (visite, ramadan, aïd, mariage)."
      items={rows}
      newHref="/admin/gifts/new"
      newLabel="+ Nouveau cadeau"
      emptyText="Aucun cadeau pour l'instant."
    />
  );
}