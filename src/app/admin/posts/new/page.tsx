import { guardAdmin } from "../../guard";
import { computeItemStatuses } from "@/lib/admin/item-status";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { makeLocalized } from "@/lib/admin/shared";
import { PostItemEditor } from "../../components/post-editor";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

export const dynamic = "force-dynamic";

function emptyPost(): BlogPost {
  return {
    slug: "",
    category: "story",
    date: "",
    title: makeLocalized(),
    excerpt: makeLocalized(),
    sections: [{ heading: makeLocalized(), blocks: [] }],
    productSlugs: [],
    contentStatus: "draft",
    faq: [],
  };
}

export default async function AdminNewPostPage() {
  await guardAdmin();
  const item = emptyPost();
  const statuses = computeItemStatuses("post", item.slug, item.title);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/posts" className="text-xs text-emerald-700 underline">
          ← Retour aux articles
        </Link>
        <h1 className="text-xl font-bold text-emerald-950">Nouvel article</h1>
      </div>
      <PostItemEditor
        item={item}
        statuses={statuses}
        sourceLocale={getConfiguredSourceLocale()}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}