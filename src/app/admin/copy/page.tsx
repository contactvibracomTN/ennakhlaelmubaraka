import { guardAdmin } from "../guard";
import { readAllMessages } from "@/lib/admin/store";
import { getConfiguredSourceLocale, isTranslationConfigured } from "@/lib/admin/translate";
import { CopyEditor } from "../components/copy-editor";

export const dynamic = "force-dynamic";

export default async function AdminCopyPage() {
  await guardAdmin();
  const messagesByLocale = readAllMessages();
  const source = getConfiguredSourceLocale();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Textes du site</h1>
      <p className="text-sm text-neutral-500">
        Affichettes, héros, navigation, sections… modifiez une clé par langue ou traduisez toute une section
        depuis l’arabe. La FAQ a son propre écran.
      </p>
      <CopyEditor
        messagesByLocale={messagesByLocale}
        sourceLocale={source}
        translationAvailable={isTranslationConfigured()}
      />
    </div>
  );
}