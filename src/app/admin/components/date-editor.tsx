"use client";

/** Date product editor (client). French-only UI, part of the /admin panel. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DateGrade, DateProduct, WeightOption } from "@/types/product";
import type { ItemLocaleState } from "@/lib/admin/shared";
import { makeLocalized } from "@/lib/admin/shared";
import {
  deleteItemAction,
  saveDateAction,
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
  TextInput,
  LocaleBadge,
} from "./fields";

const STATUS_OPTIONS = ["draft", "demo", "validated", "published"];
const AVAILABILITY_OPTIONS = ["in-stock", "out-of-stock", "preorder"];

/** The three fixed quality tiers (PO 2026-10). */
const TIER_OPTIONS = [
  { value: "", label: "— aucune —" },
  { value: "premium", label: "درجة أولى (Premium)" },
  { value: "medium", label: "درجة وسطى (Medium)" },
  { value: "economic", label: "درجة إقتصادية (Economic)" },
];

export function DateItemEditor({
  item,
  statuses,
  sourceLocale,
  translationAvailable,
}: {
  item: DateProduct;
  statuses: Record<string, ItemLocaleState>;
  sourceLocale: string;
  translationAvailable: boolean;
}) {
  const router = useRouter();
  const originalSlug = item.slug;
  const [doc, setDoc] = useState<DateProduct>(structuredClone(item));
  const [busy, setBusy] = useState<"save" | "translate" | "delete" | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string; tone?: "error" | "success" | "info" } | null>(
    null,
  );

  const patch = (p: Partial<DateProduct>) => setDoc((d) => ({ ...d, ...p }));
  const patchMoney = (field: "price" | "compareAtPrice", amount: number) => {
    const current = doc[field] ?? { amount: 0, currency: "SAR" as const };
    patch({ [field]: { ...current, amount } } as Partial<DateProduct>);
  };

  const run = async (kind: "save" | "translate" | "delete") => {
    setBanner(null);
    setBusy(kind);
    try {
      if (kind === "delete") {
        if (!confirm(`Supprimer définitivement « ${doc.name.ar || doc.slug} » ?`)) return;
        await deleteItemAction("date", doc.slug);
        router.push("/admin/dates");
        router.refresh();
        return;
      }
      if (kind === "save") {
        const res = await saveDateAction(originalSlug, doc as unknown);
        setBanner(res.ok ? { ok: true, message: "Enregistré. Déployez pour publier." } : { ok: false, message: res.message ?? "Erreur" });
      } else {
        const res = await translateItemAction("date", originalSlug, doc as unknown);
        setBanner(
          res.ok
            ? { ok: true, message: `Traduit automatiquement (${res.translatedLocales.join(", ")}) — versions machine à valider.` }
            : { ok: false, message: `Traduction partielle : ${res.errors.join(" · ")}` },
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const patchWeightOptions = (list: WeightOption[]) => patch({ weightOptions: list });
  const patchWeight = (i: number, p: Partial<WeightOption>) =>
    patchWeightOptions(doc.weightOptions.map((w, j) => (j === i ? { ...w, ...p } : w)));

  const grades = doc.grades ?? [];
  const patchGrades = (list: DateGrade[]) => patch({ grades: list });
  const patchGrade = (i: number, p: Partial<DateGrade>) =>
    patchGrades(grades.map((g, j) => (j === i ? { ...g, ...p } : g)));

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
          title={translationAvailable ? "Traduire tous les champs depuis la langue source" : "Clé API Google non configurée"}
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

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} tone={banner.tone} /> : null}

      {/* per-locale validation status */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
        {Object.entries(statuses).map(([loc, st]) => (
          <LocaleBadge key={loc} locale={loc} status={st} />
        ))}
        <span className="ml-auto text-[11px] text-neutral-500">
          Langue source : {sourceLocale.toUpperCase()} · cliquez « valider » sur chaque version traduite
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
              onChange={(v) => patch({ category: v as DateProduct["category"] })}
              options={[
                { value: "medina", label: "تمور المدينة (Médine)" },
                { value: "kingdom", label: "تمور المملكة (Royaume)" },
              ]}
            />
          </Field>
          <Field label="Unité">
            <Select
              value={doc.unit}
              onChange={(v) => patch({ unit: v as DateProduct["unit"] })}
              options={[
                { value: "kg", label: "Kilogramme (kg)" },
                { value: "box", label: "Boîte / Carton (box)" },
              ]}
            />
          </Field>
          <Field label="Texture">
            <Select
              value={doc.texture ?? ""}
              onChange={(v) => patch({ texture: v ? (v as DateProduct["texture"]) : undefined })}
              options={[
                { value: "", label: "— non défini —" },
                { value: "soft", label: "Molle (soft)" },
                { value: "semi-soft", label: "Semi-molle (semi-soft)" },
                { value: "dry", label: "Sèche (dry)" },
              ]}
            />
          </Field>
          <Field label="Variété liée (guide)">
            <TextInput value={doc.varietySlug ?? ""} onChange={(v) => patch({ varietySlug: v || undefined })} />
          </Field>
          <Field label="Statut de contenu">
            <Select
              value={doc.contentStatus}
              onChange={(v) => patch({ contentStatus: v as DateProduct["contentStatus"] })}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Disponibilité">
            <Select
              value={doc.availability}
              onChange={(v) => patch({ availability: v as DateProduct["availability"] })}
              options={AVAILABILITY_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Prix (SAR)">
            <NumInput value={doc.price.amount} onChange={(n) => patchMoney("price", n)} />
          </Field>
          <Field label="Prix barré (SAR)" hint="Optionnel — affiche une comparaison si renseigné.">
            <NumInput value={doc.compareAtPrice?.amount ?? 0} onChange={(n) => patchMoney("compareAtPrice", n)} />
          </Field>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Checkbox label="Mis en avant (featured)" checked={!!doc.featured} onChange={(v) => patch({ featured: v || undefined })} />
          <Checkbox label="Meilleure vente (bestSeller)" checked={!!doc.bestSeller} onChange={(v) => patch({ bestSeller: v || undefined })} />
        </div>
      </section>

      {/* localized texts */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Textes (8 langues)</h2>
        <div className="space-y-5">
          <LocalizedInput
            label="Nom"
            record={doc.name}
            onChange={(r) => patch({ name: r })}
            statuses={statuses}
            kind="date"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Accroche (teaser)"
            record={doc.teaser}
            onChange={(r) => patch({ teaser: r })}
            statuses={statuses}
            kind="date"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
          <LocalizedInput
            label="Origine"
            record={doc.origin}
            onChange={(r) => patch({ origin: r })}
            statuses={statuses}
            kind="date"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Étiquette d'offre"
            hint="Ex. « عرض تجريبي » — étiquette démo affichée sur les offres."
            record={doc.offerLabel}
            onChange={(r) => patch({ offerLabel: r })}
            statuses={statuses}
            kind="date"
            slug={originalSlug}
            source={sourceLocale}
          />
        </div>
      </section>

      {/* images */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Images</h2>
        <ImageListEditor label="Photos du produit" images={doc.images} onChange={(paths) => patch({ images: paths })} />
      </section>

      {/* weight options */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Poids & prix (options)</h2>
          <Button
            kind="secondary"
            onClick={() =>
              patchWeightOptions([
                ...doc.weightOptions,
                {
                  id: `opt-${Date.now()}`,
                  label: makeLocalized(),
                  price: { amount: doc.price.amount, currency: "SAR" },
                },
              ])
            }
          >
            + Ajouter une option
          </Button>
        </div>
        {doc.weightOptions.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune option — seul le prix principal est montré.</p>
        ) : (
          <ul className="space-y-3">
            {doc.weightOptions.map((wo, i) => (
              <li key={wo.id || i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-700">
                    Option {i + 1} — {wo.label.ar || wo.label.en || wo.id || "(sans libellé)"}
                  </span>
                  <Button kind="danger" onClick={() => patchWeightOptions(doc.weightOptions.filter((_, j) => j !== i))}>
                    ✕
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Field label="ID">
                    <TextInput value={wo.id} onChange={(v) => patchWeight(i, { id: v })} />
                  </Field>
                  <Field label="Prix (SAR)">
                    <NumInput value={wo.price.amount} onChange={(n) => patchWeight(i, { price: { ...wo.price, amount: n } })} />
                  </Field>
                  <Field label="Prix au kg (optionnel)">
                    <NumInput
                      value={wo.pricePerKg?.amount ?? 0}
                      onChange={(n) =>
                        patchWeight(i, {
                          pricePerKg: n > 0 ? { amount: n, currency: "SAR" } : undefined,
                        })
                      }
                    />
                  </Field>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-emerald-700">
                    Libellés par langue…
                  </summary>
                  <div className="mt-2">
                    <LocalizedInput
                      label={`Libellé option ${i + 1}`}
                      record={wo.label}
                      onChange={(r) => patchWeight(i, { label: r })}
                      statuses={statuses}
                      kind="date"
                      slug={originalSlug}
                      source={sourceLocale}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* quality grades (qualité) — price per kg + optional tier + own photos */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Qualité (grades)</h2>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              Prix réel au kilo par qualité. Chaque grade peut porter une photo propre : sur la fiche publique,
              choisir le grade change le prix <em>et</em> l&apos;image affichée (photo du produit sinon).
            </p>
          </div>
          <Button
            kind="secondary"
            onClick={() =>
              patchGrades([
                ...grades,
                {
                  id: `g-${Date.now()}`,
                  label: makeLocalized(),
                  pricePerKg: { amount: doc.price.amount, currency: "SAR" },
                  tier: undefined,
                  images: [],
                },
              ])
            }
          >
            + Ajouter un grade
          </Button>
        </div>
        {grades.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucun grade — le produit est vendu au prix principal (un seul calibre).
          </p>
        ) : (
          <ul className="space-y-3">
            {grades.map((grade, i) => (
              <li key={grade.id || i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-700">
                    Grade {i + 1} — {grade.label.ar || grade.label.en || grade.id || "(sans libellé)"}
                  </span>
                  <span className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-neutral-600">
                      <input
                        type="radio"
                        name="default-grade"
                        checked={(doc.defaultGradeId ?? grades[0]?.id) === grade.id}
                        onChange={() => patch({ defaultGradeId: grade.id })}
                      />
                      Par défaut
                    </label>
                    <Button
                      kind="danger"
                      onClick={() => {
                        const next = grades.filter((_, j) => j !== i);
                        patch({
                          grades: next,
                          defaultGradeId:
                            doc.defaultGradeId === grade.id ? undefined : doc.defaultGradeId,
                        });
                      }}
                    >
                      ✕
                    </Button>
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Field label="ID">
                    <TextInput value={grade.id} onChange={(v) => patchGrade(i, { id: v })} />
                  </Field>
                  <Field label="Catégorie de qualité">
                    <Select
                      value={grade.tier ?? ""}
                      onChange={(v) =>
                        patchGrade(i, { tier: v ? (v as DateGrade["tier"]) : undefined })
                      }
                      options={TIER_OPTIONS}
                    />
                  </Field>
                  <Field label="Prix au kg (SAR)">
                    <NumInput
                      value={grade.pricePerKg.amount}
                      onChange={(n) => patchGrade(i, { pricePerKg: { ...grade.pricePerKg, amount: n } })}
                    />
                  </Field>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-emerald-700">
                    Libellés par langue… (nom réel du calibre)
                  </summary>
                  <div className="mt-2">
                    <LocalizedInput
                      label={`Libellé grade ${i + 1}`}
                      record={grade.label}
                      onChange={(r) => patchGrade(i, { label: r })}
                      statuses={statuses}
                      kind="date"
                      slug={originalSlug}
                      source={sourceLocale}
                    />
                  </div>
                </details>
                <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-2">
                  <ImageListEditor
                    label={`Photos du grade ${i + 1} (facultatif — sinon photos du produit)`}
                    images={grade.images ?? []}
                    onChange={(paths) => patchGrade(i, { images: paths })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}