import { guardAdmin } from "../../guard";
import { readPosts } from "@/lib/admin/store";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { notFound } from "next/navigation";
import { PostItemEditor } from "../../components/post-editor";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

export const dynamic = "force-dynamic";

export default async function AdminPostEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await guardAdmin();
  const { slug } = await params;
  const item = readPosts().find((p) => p.slug === decodeURIComponent(slug));
  if (!item) notFound();
  const statuses = computeItemStatuses("post", item.slug, item.title);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/posts" className="text-xs text-emerald-700 underline">
          ← Retour aux articles
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">{item.title.ar || item.slug}</h1>
      </div>
      <PostItemEditor
        item={item as BlogPost}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}