import { guardAdmin } from "../guard";
import { readDates } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { ItemList, type ItemListRow } from "../components/item-list";

export const dynamic = "force-dynamic";

export default async function AdminDatesPage() {
  await guardAdmin();
  const dates = readDates();
  const rows: ItemListRow[] = dates.map((p) => {
    const statuses = computeItemStatuses("date", p.slug, p.name);
    const pending = Object.values(statuses).filter((s) => s.status !== "validated").length;
    return {
      href: `/admin/dates/${encodeURIComponent(p.slug)}`,
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
      title="Produits — dates"
      description="14 produits catalogue V3 (Arabie Saoudite). Créer, éditer, traduire, valider."
      items={rows}
      newHref="/admin/dates/new"
      newLabel="+ Nouveau produit"
      emptyText="Aucun produit pour l'instant."
    />
  );
}