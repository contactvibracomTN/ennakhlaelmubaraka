"use client";

/** Gift product editor (client). French-only UI, part of the /admin panel. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftProduct } from "@/types/product";
import type { ItemLocaleState, LocalizedRecord } from "@/lib/admin/shared";
import { ADMIN_LOCALES, makeLocalized } from "@/lib/admin/shared";
import {
  deleteItemAction,
  saveGiftAction,
  translateItemAction,
} from "@/app/admin/actions";
import {
  Button,
  Checkbox,
  Field,
  ImageListEditor,
  LocalizedInput,
  NumInput,
  Select,
  StatusBanner,
  TextArea,
  TextInput,
  LocaleBadge,
} from "./fields";

function contentsToLines(contents: GiftProduct["contents"]): Record<string, string[]> {
  const lines: Record<string, string[]> = {};
  for (const loc of ADMIN_LOCALES) lines[loc] = contents?.map((c) => c[loc] ?? "") ?? [];
  return lines;
}

function linesToContents(lines: Record<string, string[]>): GiftProduct["contents"] {
  const n = Math.max(0, ...ADMIN_LOCALES.map((l) => lines[l]?.length ?? 0));
  return Array.from({ length: n }, (_, i) =>
    makeLocalized(
      Object.fromEntries(ADMIN_LOCALES.map((l) => [l, lines[l]?.[i] ?? ""] as [string, string])),
    ),
  );
}

export function GiftItemEditor({
  item,
  statuses,
  sourceLocale,
  translationAvailable,
}: {
  item: GiftProduct;
  statuses: Record<string, ItemLocaleState>;
  sourceLocale: string;
  translationAvailable: boolean;
}) {
  const router = useRouter();
  const originalSlug = item.slug;
  const [doc, setDoc] = useState<GiftProduct>(structuredClone(item));
  const [busy, setBusy] = useState<"save" | "translate" | "delete" | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const patch = (p: Partial<GiftProduct>) => setDoc((d) => ({ ...d, ...p }));

  const run = async (kind: "save" | "translate" | "delete") => {
    setBanner(null);
    setBusy(kind);
    try {
      if (kind === "delete") {
        if (!confirm(`Supprimer définitivement « ${doc.name.ar || doc.slug} » ?`)) return;
        await deleteItemAction("gift", doc.slug);
        router.push("/admin/gifts");
        router.refresh();
        return;
      }
      if (kind === "save") {
        const res = await saveGiftAction(originalSlug, doc as unknown);
        setBanner(
          res.ok
            ? { ok: true, message: "Enregistré. Déployez pour publier." }
            : { ok: false, message: res.message ?? "Erreur" },
        );
      } else {
        const res = await translateItemAction("gift", originalSlug, doc as unknown);
        setBanner(
          res.ok
            ? { ok: true, message: `Traduit automatiquement (${res.translatedLocales.join(", ")}) — versions machine à valider.` }
            : { ok: false, message: `Traduction partielle : ${res.errors.join(" · ")}` },
        );
        if (res.ok && res.item) {
          const translated = res.item as GiftProduct;
          setDoc(translated);
          setContents(contentsToLines(translated.contents));
        }
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const [contents, setContents] = useState<Record<string, string[]>>(() => contentsToLines(item.contents));
  const changeContents = (lines: Record<string, string[]>) => {
    setContents(lines);
    patch({ contents: linesToContents(lines) });
  };

  const bundleText = (doc.bundleOf ?? []).join(", ");
  const patchBundle = (v: string) =>
    patch({ bundleOf: v.split(",").map((s) => s.trim()).filter(Boolean) });

  return (
    <div className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button kind="primary" busy={busy === "save"} onClick={() => void run("save")}>
          💾 Enregistrer
        </Button>
        <Button
          kind="gold"
          busy={busy === "translate"}
          disabled={!translationAvailable}
          onClick={() => void run("translate")}
        >
          ✨ Traduire automatiquement
        </Button>
        <Button kind="danger" busy={busy === "delete"} onClick={() => void run("delete")}>
          🗑 Supprimer
        </Button>
        {!translationAvailable ? (
          <span className="text-xs text-amber-700">
            ⚠️ Traduction auto indisponible : ajouter <code>GOOGLE_TRANSLATE_API_KEY</code> dans <code>.env.local</code> puis redémarrer.
          </span>
        ) : null}
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
        {Object.entries(statuses).map(([loc, st]) => (
          <LocaleBadge key={loc} locale={loc} status={st} />
        ))}
        <span className="ml-auto text-[11px] text-neutral-500">
          Langue source : {sourceLocale.toUpperCase()}
        </span>
      </div>

      {/* identity */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Identité</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Slug (URL)">
            <TextInput value={doc.slug} onChange={(v) => patch({ slug: v })} />
          </Field>
          <Field label="ID technique">
            <TextInput value={doc.id} onChange={(v) => patch({ id: v })} />
          </Field>
          <Field label="Catégorie">
            <Select
              value={doc.category}
              onChange={(v) => patch({ category: v as GiftProduct["category"] })}
              options={[
                { value: "personal", label: "Personnel (personal)" },
                { value: "occasions", label: "Occasions (occasions)" },
                { value: "date-products", label: "Produits de dattes (date-products)" },
              ]}
            />
          </Field>
          <Field label="Occasion">
            <Select
              value={doc.occasion ?? ""}
              onChange={(v) => patch({ occasion: v ? (v as GiftProduct["occasion"]) : undefined })}
              options={[
                { value: "", label: "— aucune —" },
                { value: "visit", label: "Visite (visit)" },
                { value: "ramadan", label: "Ramadan" },
                { value: "eid", label: "Aïd (eid)" },
                { value: "wedding", label: "Mariage (wedding)" },
              ]}
            />
          </Field>
          <Field label="Statut de contenu">
            <Select
              value={doc.contentStatus}
              onChange={(v) => patch({ contentStatus: v as GiftProduct["contentStatus"] })}
              options={["draft", "demo", "validated", "published"].map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Disponibilité">
            <Select
              value={doc.availability}
              onChange={(v) => patch({ availability: v as GiftProduct["availability"] })}
              options={["in-stock", "out-of-stock", "preorder"].map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Prix (SAR)">
            <NumInput value={doc.price.amount} onChange={(n) => patch({ price: { ...doc.price, amount: n } })} />
          </Field>
          <Field label="Prix barré (SAR)">
            <NumInput
              value={doc.compareAtPrice?.amount ?? 0}
              onChange={(n) =>
                patch({ compareAtPrice: n > 0 ? { amount: n, currency: "SAR" } : undefined })
              }
            />
          </Field>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Checkbox label="Conceptuel (non vendu directement)" checked={!!doc.isConceptual} onChange={(v) => patch({ isConceptual: v || undefined })} />
          <Checkbox label="Mis en avant (featured)" checked={!!doc.featured} onChange={(v) => patch({ featured: v || undefined })} />
        </div>
        <div className="mt-3">
          <Field label="Produits inclus (slugs, séparés par des virgules) — bundleOf">
            <TextArea value={bundleText} onChange={patchBundle} rows={2} />
          </Field>
        </div>
      </section>

      {/* texts */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Textes (8 langues)</h2>
        <div className="space-y-5">
          <LocalizedInput
            label="Nom"
            record={doc.name}
            onChange={(r) => patch({ name: r })}
            statuses={statuses}
            kind="gift"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Accroche (teaser)"
            record={doc.teaser}
            onChange={(r) => patch({ teaser: r })}
            statuses={statuses}
            kind="gift"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
          <LocalizedInput
            label="Ligne de taille (sizeLabel)"
            record={doc.sizeLabel}
            onChange={(r) => patch({ sizeLabel: r })}
            statuses={statuses}
            kind="gift"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Composition (contenu de la boîte)"
            hint="Une ligne par composant — traduites séparément."
            record={
              Object.fromEntries(
                ADMIN_LOCALES.map((l) => [l, (contents[l] ?? []).join("\n")] as [string, string]),
              ) as LocalizedRecord
            }
            onChange={(rec) => {
              const next: Record<string, string[]> = {};
              for (const l of ADMIN_LOCALES) {
                next[l] = (rec[l] ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
              }
              changeContents(next);
            }}
            statuses={statuses}
            kind="gift"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
        </div>
      </section>

      {/* images */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Images</h2>
        <ImageListEditor label="Photos du produit" images={doc.images} onChange={(paths) => patch({ images: paths })} />
      </section>
    </div>
  );
}