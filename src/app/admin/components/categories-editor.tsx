"use client";

/** Categories editor (dates + gifts). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDateCategoriesAction, saveGiftCategoriesAction } from "@/app/admin/actions";
import type { LocalizedRecord } from "@/lib/admin/shared";
import { Button, Field, LocalizedInput, StatusBanner, TextInput } from "./fields";

interface CategoryRow {
  slug: string;
  name: LocalizedRecord;
  description?: LocalizedRecord;
  image?: string;
}

export function CategoriesEditor({
  initialDates,
  initialGifts,
  sourceLocale,
}: {
  initialDates: CategoryRow[];
  initialGifts: CategoryRow[];
  sourceLocale: string;
}) {
  const [kind, setKind] = useState<"dates" | "gifts">("dates");
  const [dates, setDates] = useState<CategoryRow[]>(initialDates);
  const [gifts, setGifts] = useState<CategoryRow[]>(initialGifts);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const list = kind === "dates" ? dates : gifts;
  const setList = (rows: CategoryRow[]) => (kind === "dates" ? setDates(rows) : setGifts(rows));

  const patchRow = (i: number, p: Partial<CategoryRow>) =>
    setList(list.map((r, j) => (j === i ? { ...r, ...p } : r)));

  const save = async () => {
    setBusy(true);
    setBanner(null);
    try {
      const res =
        kind === "dates"
          ? await saveDateCategoriesAction(dates as unknown)
          : await saveGiftCategoriesAction(gifts as unknown);
      setBanner(
        res.ok
          ? { ok: true, message: "Catégories enregistrées. Déployez pour publier." }
          : { ok: false, message: res.message ?? "Erreur" },
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["dates", "gifts"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              kind === k ? "bg-emerald-700 text-white" : "bg-white text-neutral-700 border border-neutral-300"
            }`}
          >
            {k === "dates" ? "Catégories de dattes" : "Catégories de cadeaux"}
          </button>
        ))}
        <span className="ml-auto">
          <Button kind="primary" busy={busy} onClick={() => void save()}>
            💾 Enregistrer
          </Button>
        </span>
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <div className="space-y-4">
        {list.map((row, i) => (
          <section key={row.slug || i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-800">Catégorie : {row.name.ar || row.slug}</span>
              <Button kind="danger" onClick={() => setList(list.filter((_, j) => j !== i))}>
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Slug">
                <TextInput value={row.slug} onChange={(v) => patchRow(i, { slug: v })} />
              </Field>
              <Field label="Image">
                <TextInput value={row.image ?? ""} onChange={(v) => patchRow(i, { image: v || undefined })} />
              </Field>
            </div>
            <div className="mt-3 space-y-4">
              <LocalizedInput
                label="Nom"
                record={row.name}
                onChange={(name) => patchRow(i, { name })}
                kind="date"
                slug="categories"
                source={sourceLocale}
              />
              <LocalizedInput
                label="Description"
                record={row.description}
                onChange={(description) => patchRow(i, { description })}
                kind="date"
                slug="categories"
                source={sourceLocale}
                multiline
              />
            </div>
          </section>
        ))}
        <Button kind="secondary" onClick={() => setList([...list, { slug: "", name: {} }])}>
          + Ajouter une catégorie
        </Button>
      </div>
    </div>
  );
}