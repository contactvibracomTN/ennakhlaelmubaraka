"use client";

/**
 * Guide variety editor (client) — French-only admin UI.
 * Deliberately simple: one card per topic, plain-French labels, no JSON.
 * Content is written in Arabic (source), machine-translated, then validated
 * locale by locale, like the blog editor.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GuideRegion, GuideTexture, GuideVariety } from "@/types/guide";
import type { ItemLocaleState } from "@/lib/admin/shared";
import { makeLocalized } from "@/lib/admin/shared";
import {
  deleteItemAction,
  saveGuideAction,
  translateItemAction,
} from "@/app/admin/actions";
import {
  Button,
  Field,
  ImageListEditor,
  LocalizedInput,
  LocaleBadge,
  Select,
  StatusBanner,
  TextInput,
} from "./fields";

const REGION_OPTIONS: Array<{ value: GuideRegion; label: string }> = [
  { value: "maghreb", label: "Maghreb (Maroc, Algérie, Tunisie)" },
  { value: "mashriq", label: "Mashriq (Irak, Levant)" },
  { value: "gulf", label: "Golfe (Arabie saoudite, CCG)" },
  { value: "oman", label: "Oman" },
  { value: "egypt", label: "Égypte" },
];

const TEXTURE_OPTIONS: Array<{ value: GuideTexture; label: string }> = [
  { value: "soft", label: "Moelleuse (soft)" },
  { value: "semi-soft", label: "Semi-moelleuse (semi-soft)" },
  { value: "dry", label: "Sèche (dry)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon — hors sitemap" },
  { value: "demo", label: "Démo — visible, à compléter" },
  { value: "validated", label: "Validé — prêt à publier" },
  { value: "published", label: "Publié" },
];

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(j, 0, item);
  return copy;
}

function ListRowShell({
  title,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-700">
          {title} {index + 1}
        </span>
        <div className="flex gap-1">
          <Button kind="secondary" disabled={index === 0} onClick={() => onMove(-1)}>
            ↑
          </Button>
          <Button kind="secondary" disabled={index === count - 1} onClick={() => onMove(1)}>
            ↓
          </Button>
          <Button kind="danger" onClick={onRemove}>
            ✕
          </Button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function GuideItemEditor({
  item,
  statuses,
  sourceLocale,
  translationAvailable,
  productOptions,
  existingSlugs,
}: {
  item: GuideVariety;
  statuses: Record<string, ItemLocaleState>;
  sourceLocale: string;
  translationAvailable: boolean;
  productOptions: Array<{ value: string; label: string }>;
  existingSlugs: string[];
}) {
  const router = useRouter();
  const originalSlug = item.slug;
  const [doc, setDoc] = useState<GuideVariety>(structuredClone(item));
  const [persistedSlug, setPersistedSlug] = useState(originalSlug);
  const [busy, setBusy] = useState<"save" | "translate" | "delete" | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const patch = (p: Partial<GuideVariety>) => setDoc((d) => ({ ...d, ...p }));

  const run = async (kind: "save" | "translate" | "delete") => {
    setBanner(null);
    const nextSlug = doc.slug.trim();
    if (kind !== "delete") {
      if (!nextSlug) {
        setBanner({ ok: false, message: "Le champ « Adresse de la fiche » (slug) est obligatoire." });
        return;
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug)) {
        setBanner({
          ok: false,
          message:
            "Adresse invalide : minuscules, chiffres et tirets uniquement (exemple : medjool, khadrawi-24).",
        });
        return;
      }
      if (nextSlug !== persistedSlug && existingSlugs.includes(nextSlug)) {
        setBanner({
          ok: false,
          message: `L’adresse « ${nextSlug} » est déjà utilisée par une autre fiche. Choisissez-en une autre.`,
        });
        return;
      }
    }
    setBusy(kind);
    try {
      if (kind === "delete") {
        if (!confirm(`Supprimer définitivement « ${doc.title.ar || doc.slug} » du guide ?`)) {
          return;
        }
        await deleteItemAction("guide", persistedSlug || doc.slug);
        router.push("/admin/guide");
        router.refresh();
        return;
      }
      if (kind === "save") {
        const res = await saveGuideAction(persistedSlug, doc as unknown);
        if (res.ok) {
          setPersistedSlug(nextSlug);
          if (nextSlug !== persistedSlug) {
            // Slug changed: move the editor to the new URL so the server
            // finds the saved item (and the address bar stays correct).
            router.replace(`/admin/guide/${encodeURIComponent(nextSlug)}`);
            router.refresh();
            return;
          }
        }
        setBanner(
          res.ok
            ? { ok: true, message: "Fiche enregistrée. Elle sera rebuildée au prochain déploiement." }
            : { ok: false, message: res.message ?? "Erreur d'enregistrement." },
        );
      } else {
        const res = await translateItemAction("guide", persistedSlug, doc as unknown);
        if (res.item) {
          const saved = structuredClone(res.item as GuideVariety);
          setDoc(saved);
          if (!persistedSlug && saved.slug) {
            // A brand-new fiche was just persisted by the translation:
            // move to its editor URL so a refresh keeps showing it.
            setPersistedSlug(saved.slug);
            router.replace(`/admin/guide/${encodeURIComponent(saved.slug)}`);
            return;
          }
        }
        setBanner(
          res.ok
            ? {
                ok: true,
                message: `Traduit automatiquement (${res.translatedLocales.join(", ")}) — versions machine à relire et valider.`,
              }
            : { ok: false, message: `Traduction partielle : ${res.errors.join(" · ")}` },
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

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
        {doc.slug ? (
          <a
            href={`/ar/guide/${doc.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
          >
            👁 Voir sur le site
          </a>
        ) : null}
        <Button kind="danger" busy={busy === "delete"} onClick={() => void run("delete")}>
          🗑 Supprimer
        </Button>
        {!translationAvailable ? (
          <span className="text-xs text-amber-700">
            ⚠️ Traduction auto indisponible : configurez GOOGLE_TRANSLATE_API_KEY.
          </span>
        ) : null}
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      {/* how-to */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-semibold">Comment remplir une fiche (simple)</p>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-[13px] leading-relaxed">
          <li>Écrivez le texte en <b>arabe</b> (langue source) dans chaque champ.</li>
          <li>Cliquez <b>✨ Traduire automatiquement</b> : les 7 autres langues se remplissent.</li>
          <li>Relisez le <b>français</b> et l’<b>anglais</b>, corrigez si besoin.</li>
          <li>Cliquez sur <b>⚙ valider</b> pour chaque langue relue.</li>
          <li>Cliquez <b>💾 Enregistrer</b>. Le site public se met à jour au déploiement.</li>
        </ol>
        <p className="mt-2 text-[12px] text-sky-800">
          Astuce : laissez vide un champ facultatif plutôt que d’écrire du texte provisoire.
          Le guide ne montre <b>aucun prix</b>.
        </p>
      </div>

      {/* locale strip */}
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
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-800">
          1. La fiche
        </h2>
        <p className="mb-3 text-[12px] text-neutral-500">
          Informations techniques : adresse de la page, numéro d’ordre, photo, classement.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Adresse de la fiche (slug)"
            hint="Minuscules, tirets, sans espaces ni accents. Exemple : medjool. Ne la changez pas sans raison."
          >
            <TextInput value={doc.slug} onChange={(v) => patch({ slug: v })} />
          </Field>
          <Field label="Numéro d’ordre" hint="Nombre à deux chiffres (01, 02…). Sert à l’affichage.">
            <TextInput value={doc.number} onChange={(v) => patch({ number: v })} />
          </Field>
          <Field label="Statut de la fiche">
            <Select
              value={doc.contentStatus}
              onChange={(v) => patch({ contentStatus: v as GuideVariety["contentStatus"] })}
              options={STATUS_OPTIONS}
            />
          </Field>
          <Field label="Région">
            <Select
              value={doc.region}
              onChange={(v) => patch({ region: v as GuideRegion })}
              options={REGION_OPTIONS}
            />
          </Field>
          <Field label="Texture">
            <Select
              value={doc.texture}
              onChange={(v) => patch({ texture: v as GuideTexture })}
              options={TEXTURE_OPTIONS}
            />
          </Field>
          <Field
            label="Mots de recherche (facultatif)"
            hint="Autres noms et orthographes, séparés par des espaces. Exemple : medjool mejhoul majhoul مجدول"
          >
            <TextInput value={doc.nameSearch} onChange={(v) => patch({ nameSearch: v })} />
          </Field>
        </div>
        <div className="mt-4">
          <ImageListEditor
            label="Photo de la fiche"
            images={doc.image ? [doc.image] : []}
            onChange={(paths) => patch({ image: paths[0] ?? "" })}
            single
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Format conseillé : photo carrée ou paysage, au moins 1 000 px de large, prise par
            vous. Elle s’affiche dans le guide et sur la page de la variété.
          </p>
        </div>
      </section>

      {/* titles */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-800">
          2. Titre et présentation
        </h2>
        <p className="mb-3 text-[12px] text-neutral-500">
          Ce que le visiteur lit en premier : le titre, la phrase d’accroche et l’origine.
        </p>
        <div className="space-y-5">
          <LocalizedInput
            label="Titre de la fiche"
            hint="Exemple : « Medjool — la reine des dattes ». Vous pouvez garder le nom seul."
            record={doc.title}
            onChange={(r) => patch({ title: r })}
            statuses={statuses}
            kind="guide"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Phrase d’accroche"
            hint="Une seule phrase courte, affichée sous le titre."
            record={doc.caption}
            onChange={(r) => patch({ caption: r })}
            statuses={statuses}
            kind="guide"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Origine"
            hint="Pays d’origine séparés par « · ». Exemple : Maroc · USA · Tunisie. N’indiquez que des origines vérifiées."
            record={doc.origin}
            onChange={(r) => patch({ origin: r })}
            statuses={statuses}
            kind="guide"
            slug={originalSlug}
            source={sourceLocale}
          />
        </div>
      </section>

      {/* article */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-800">
          3. L’article
        </h2>
        <p className="mb-3 text-[12px] text-neutral-500">
          Le texte de fond et la description du goût. Écrivez simplement, en phrases courtes.
        </p>
        <div className="space-y-5">
          <LocalizedInput
            label="Introduction"
            hint="2 à 5 phrases : histoire, région, ce qui rend cette variété unique."
            record={doc.intro}
            onChange={(r) => patch({ intro: r })}
            statuses={statuses}
            kind="guide"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
          <LocalizedInput
            label="Goût"
            hint="Comment elle se déguste : texture, notes, accord (café, fromage…)."
            record={doc.taste}
            onChange={(r) => patch({ taste: r })}
            kind="guide"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
        </div>
      </section>

      {/* strengths */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
            4. Points forts
          </h2>
          <Button
            kind="secondary"
            onClick={() => patch({ strengths: [...doc.strengths, makeLocalized()] })}
          >
            + Point fort
          </Button>
        </div>
        <p className="mb-3 text-[12px] text-neutral-500">
          Une phrase par point fort (3 à 5 points suffisent). Utilisez ↑ ↓ pour changer l’ordre.
        </p>
        {doc.strengths.map((strength, i) => (
          <ListRowShell
            key={i}
            title="Point fort"
            index={i}
            count={doc.strengths.length}
            onMove={(dir) => patch({ strengths: moveItem(doc.strengths, i, dir) })}
            onRemove={() => patch({ strengths: doc.strengths.filter((_, j) => j !== i) })}
          >
            <LocalizedInput
              label={`Texte du point fort ${i + 1}`}
              record={strength}
              onChange={(r) =>
                patch({ strengths: doc.strengths.map((x, j) => (j === i ? r : x)) })
              }
              kind="guide"
              slug={originalSlug}
              source={sourceLocale}
              multiline
            />
          </ListRowShell>
        ))}
      </section>

      {/* timeline */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
            5. Histoire (frise)
          </h2>
          <Button
            kind="secondary"
            onClick={() =>
              patch({
                timeline: [...doc.timeline, { label: makeLocalized(), text: makeLocalized() }],
              })
            }
          >
            + Étape
          </Button>
        </div>
        <p className="mb-3 text-[12px] text-neutral-500">
          Les grandes étapes de la variété. « Repère » = une date ou un lieu court ;
          « Texte » = une phrase d’explication.
        </p>
        {doc.timeline.map((event, i) => (
          <ListRowShell
            key={i}
            title="Étape"
            index={i}
            count={doc.timeline.length}
            onMove={(dir) => patch({ timeline: moveItem(doc.timeline, i, dir) })}
            onRemove={() => patch({ timeline: doc.timeline.filter((_, j) => j !== i) })}
          >
            <LocalizedInput
              label="Repère (date, lieu…)"
              record={event.label}
              onChange={(label) =>
                patch({
                  timeline: doc.timeline.map((x, j) => (j === i ? { ...x, label } : x)),
                })
              }
              kind="guide"
              slug={originalSlug}
              source={sourceLocale}
            />
            <LocalizedInput
              label="Explication"
              record={event.text}
              onChange={(text) =>
                patch({
                  timeline: doc.timeline.map((x, j) => (j === i ? { ...x, text } : x)),
                })
              }
              kind="guide"
              slug={originalSlug}
              source={sourceLocale}
              multiline
            />
          </ListRowShell>
        ))}
      </section>

      {/* nutrition */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
            6. Nutrition (pour 100 g)
          </h2>
          <Button
            kind="secondary"
            onClick={() =>
              patch({
                nutrition: [...doc.nutrition, { label: makeLocalized(), value: makeLocalized() }],
              })
            }
          >
            + Information
          </Button>
        </div>
        <p className="mb-3 text-[12px] text-neutral-500">
          N’inscrivez que des valeurs que vous pouvez justifier (étiquette, fiche fournisseur).
          Sinon, laissez cette section vide.
        </p>
        {doc.nutrition.map((fact, i) => (
          <ListRowShell
            key={i}
            title="Information"
            index={i}
            count={doc.nutrition.length}
            onMove={(dir) => patch({ nutrition: moveItem(doc.nutrition, i, dir) })}
            onRemove={() => patch({ nutrition: doc.nutrition.filter((_, j) => j !== i) })}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LocalizedInput
                label="Nom (ex. Calories)"
                record={fact.label}
                onChange={(label) =>
                  patch({
                    nutrition: doc.nutrition.map((x, j) => (j === i ? { ...x, label } : x)),
                  })
                }
                kind="guide"
                slug={originalSlug}
                source={sourceLocale}
              />
              <LocalizedInput
                label="Valeur (ex. 277 kcal)"
                record={fact.value}
                onChange={(value) =>
                  patch({
                    nutrition: doc.nutrition.map((x, j) => (j === i ? { ...x, value } : x)),
                  })
                }
                kind="guide"
                slug={originalSlug}
                source={sourceLocale}
              />
            </div>
          </ListRowShell>
        ))}
      </section>

      {/* resources */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
            7. Pour aller plus loin (facultatif)
          </h2>
          <Button
            kind="secondary"
            onClick={() =>
              patch({
                resources: [...doc.resources, { label: makeLocalized(), href: "" }],
              })
            }
          >
            + Lien
          </Button>
        </div>
        <p className="mb-3 text-[12px] text-neutral-500">
          Liens externes de confiance (article, vidéo, encyclopédie). Laissez vide si vous n’en
          avez pas.
        </p>
        {doc.resources.map((resource, i) => (
          <ListRowShell
            key={i}
            title="Lien"
            index={i}
            count={doc.resources.length}
            onMove={(dir) => patch({ resources: moveItem(doc.resources, i, dir) })}
            onRemove={() => patch({ resources: doc.resources.filter((_, j) => j !== i) })}
          >
            <LocalizedInput
              label="Texte du lien"
              record={resource.label}
              onChange={(label) =>
                patch({
                  resources: doc.resources.map((x, j) => (j === i ? { ...x, label } : x)),
                })
              }
              kind="guide"
              slug={originalSlug}
              source={sourceLocale}
            />
            <Field label="Adresse du lien (https://…)" hint="Le lien doit commencer par https://">
              <TextInput
                value={resource.href}
                onChange={(href) =>
                  patch({
                    resources: doc.resources.map((x, j) => (j === i ? { ...x, href } : x)),
                  })
                }
              />
            </Field>
          </ListRowShell>
        ))}
      </section>

      {/* boutique CTA */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-800">
          8. Boutique (facultatif)
        </h2>
        <p className="mb-3 text-[12px] text-neutral-600">
          Si cette variété est <b>vendue sur le site</b>, choisissez le produit : un bouton vers
          la boutique et un bouton WhatsApp s’afficheront en bas de la fiche. Sinon, laissez
          « Pas vendu sur le site ».
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Produit lié au catalogue">
            <Select
              value={doc.productSlug}
              onChange={(v) => patch({ productSlug: v })}
              options={[{ value: "", label: "— Pas vendu sur le site —" }, ...productOptions]}
            />
          </Field>
        </div>
        {doc.productSlug ? (
          <div className="mt-4">
            <LocalizedInput
              label="Texte du bouton boutique"
              hint="Adaptez le verbe au produit : « اطلبها الآن » (commandez), « تذوّقها الآن » (goûtez), « احصل عليها الآن » (procurez-vous). Laissez vide pour le texte par défaut."
              record={doc.ctaLabel ?? makeLocalized()}
              onChange={(r) => patch({ ctaLabel: r })}
              kind="guide"
              slug={originalSlug}
              source={sourceLocale}
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Le bouton WhatsApp ouvre une conversation avec votre numéro
              (+966&nbsp;59&nbsp;610&nbsp;1097) et pré-remplit un message avec le nom du produit.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
