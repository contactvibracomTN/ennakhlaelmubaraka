import { guardAdmin } from "../guard";
import { readGuide } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { ItemList, type ItemListRow } from "../components/item-list";

export const dynamic = "force-dynamic";

export default async function AdminGuidePage() {
  await guardAdmin();
  const varieties = readGuide();
  const rows: ItemListRow[] = varieties.map((variety) => {
    const statuses = computeItemStatuses("guide", variety.slug, variety.title);
    const pending = Object.values(statuses).filter((s) => s.status !== "validated").length;
    return {
      href: `/admin/guide/${encodeURIComponent(variety.slug)}`,
      thumb: variety.image || undefined,
      title: variety.title.ar || variety.title.en || variety.slug,
      slug: variety.slug,
      badge: variety.contentStatus,
      note:
        pending === 0
          ? "✓ toutes les langues sont validées"
          : `${pending} langue(s) à remplir ou valider`,
    };
  });

  return (
    <ItemList
      title="Guide des dattes"
      description="Les 19 fiches du guide public : texte, photo et lien boutique. Aucun prix n’y est affiché. Le guide est éditorial : il ne bloque pas le déploiement."
      items={rows}
      newHref="/admin/guide/new"
      newLabel="+ Nouvelle variété"
      emptyText="Aucune fiche pour l’instant."
    />
  );
}
