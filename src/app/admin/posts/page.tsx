import { guardAdmin } from "../guard";
import { readPosts } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { ItemList, type ItemListRow } from "../components/item-list";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await guardAdmin();
  const posts = readPosts();
  const rows: ItemListRow[] = posts.map((p) => {
    const statuses = computeItemStatuses("post", p.slug, p.title);
    const pending = Object.values(statuses).filter((s) => s.status !== "validated").length;
    return {
      href: `/admin/posts/${encodeURIComponent(p.slug)}`,
      thumb: p.coverImage,
      title: p.title.ar || p.title.en || p.slug,
      slug: p.slug,
      badge: p.contentStatus,
      note:
        pending === 0
          ? "✓ toutes versions validées"
          : `${pending} version(s) à valider — ${p.date}`,
    };
  });

  return (
    <ItemList
      title="Articles de blog"
      description="Contenus éditoriaux (guides, recettes, stories). Deux articles Ajwa restent en brouillon (déc. 2026)."
      items={rows}
      newHref="/admin/posts/new"
      newLabel="+ Nouvel article"
      emptyText="Aucun article pour l'instant."
    />
  );
}