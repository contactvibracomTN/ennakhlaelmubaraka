import { guardAdmin } from "../guard";
import { readMessages, ADMIN_LOCALES } from "@/lib/admin/store";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { FaqEditor, type FaqEntry } from "../components/faq-editor";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  await guardAdmin();
  const itemsByLocale: Record<string, FaqEntry[]> = {};
  for (const loc of ADMIN_LOCALES) {
    const faq = readMessages(loc).faq as { items?: FaqEntry[] } | undefined;
    itemsByLocale[loc] = Array.isArray(faq?.items) ? faq.items : [];
  }
  const source = getConfiguredSourceLocale();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">FAQ du site</h1>
      <p className="text-sm text-neutral-500">
        Les questions/réponses sont gérées par langue (mêmes questions dans les 8 langues). Rédigez dans la
        langue source, puis « Traduire » et relisez chaque langue.
      </p>
      <FaqEditor
        itemsByLocale={itemsByLocale}
        sourceLocale={source}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}