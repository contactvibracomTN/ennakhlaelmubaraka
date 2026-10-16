import { guardAdmin } from "../guard";
import { readCategoriesData } from "@/lib/admin/store";
import { getConfiguredSourceLocale } from "@/lib/admin/translate";
import { CategoriesEditor } from "../components/categories-editor";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await guardAdmin();
  const data = readCategoriesData();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Catégories</h1>
      <p className="text-sm text-neutral-500">
        Noms, descriptions et images des familles de produits (« تمور المدينة », « تمور المملكة », cadeaux).
      </p>
      <CategoriesEditor
        initialDates={data.dates as unknown as Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>}
        initialGifts={data.gifts as unknown as Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>}
        sourceLocale={getConfiguredSourceLocale()}
      />
    </div>
  );
}