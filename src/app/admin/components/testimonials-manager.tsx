"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { ADMIN_LOCALES, LANGUAGE_FLAGS, LANGUAGE_LABELS } from "@/lib/admin/shared";
import {
  deleteTestimonialsAction,
  saveTestimonialAction,
  setTestimonialStatusAction,
} from "@/app/admin/actions";
import { Button, Field, Select, StatusBanner, TextArea, TextInput, inputCls } from "./fields";
import type {
  Testimonial,
  TestimonialAdminInput,
  TestimonialSource,
  TestimonialStatus,
} from "@/types/testimonial";

type Filter = "all" | TestimonialStatus;
type EditorState = { mode: "new" } | { mode: "edit"; item: Testimonial } | null;

const STATUS_LABEL: Record<TestimonialStatus, string> = {
  pending: "En attente",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_STYLE: Record<TestimonialStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-neutral-200 text-neutral-700",
};

const SOURCE_LABEL: Record<TestimonialSource, string> = {
  website: "Site web",
  "in-store": "Boutique",
  import: "Import",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente (non publié)" },
  { value: "published", label: "Publié sur le site" },
  { value: "archived", label: "Archivé" },
];

const SOURCE_OPTIONS = [
  { value: "website", label: "Formulaire du site" },
  { value: "in-store", label: "Client en boutique" },
  { value: "import", label: "Import / autre" },
];

const RATING_OPTIONS = [
  { value: "1", label: "1 — Faible" },
  { value: "2", label: "2 — Passable" },
  { value: "3", label: "3 — Bien" },
  { value: "4", label: "4 — Très bien" },
  { value: "5", label: "5 — Excellent" },
];

function emptyInput(): TestimonialAdminInput {
  return {
    name: "",
    whatsapp: "",
    job: "",
    nationality: "",
    message: "",
    rating: 5,
    locale: "ar",
    status: "pending",
    source: "in-store",
    publishedText: {},
    adminNote: "",
    order: 0,
  };
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function whatsappHref(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            star <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-neutral-300"
          }`}
        />
      ))}
    </span>
  );
}

export function TestimonialsManager({ items }: { items: Testimonial[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      published: items.filter((item) => item.status === "published").length,
      archived: items.filter((item) => item.status === "archived").length,
    }),
    [items],
  );

  const average = useMemo(() => {
    const published = items.filter((item) => item.status === "published");
    if (published.length === 0) return 0;
    return published.reduce((sum, item) => sum + item.rating, 0) / published.length;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items
      .filter((item) => (filter === "all" ? true : item.status === filter))
      .filter((item) => {
        if (!needle) return true;
        return [item.name, item.job, item.nationality, item.message, item.whatsapp]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, filter, query]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((item) => selected.includes(item.id));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((item) => item.id));

  const run = (action: () => Promise<{ ok: boolean; message?: string }>, success: string) => {
    startTransition(async () => {
      const result = await action();
      setBanner({ ok: result.ok, message: result.ok ? success : result.message ?? "Erreur." });
      if (result.ok) {
        setSelected([]);
        router.refresh();
      }
    });
  };

  const confirmDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    const label = ids.length === 1 ? "ce témoignage" : `${ids.length} témoignages`;
    if (!window.confirm(`Supprimer ${label} ? Cette action est définitive.`)) return;
    run(() => deleteTestimonialsAction(ids), ids.length === 1 ? "Témoignage supprimé." : "Témoignages supprimés.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">Témoignages clients</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Modérez les avis reçus via le formulaire du site ou saisis en boutique. Seuls les
            témoignages <strong>publiés</strong> apparaissent sur la page d&apos;accueil. Le numéro
            WhatsApp reste privé et n&apos;est jamais affiché publiquement.
          </p>
        </div>
        <Button kind="primary" onClick={() => setEditor({ mode: "new" })}>
          <Plus className="h-4 w-4" /> Nouveau témoignage
        </Button>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] leading-relaxed text-emerald-900">
        <strong>Stockage Neon :</strong> les avis envoyés depuis le formulaire du site arrivent
        directement ici. Publiez-les pour les afficher sur la page d&apos;accueil.
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="En attente" value={counts.pending} tone="amber" />
        <StatCard label="Publiés" value={counts.published} tone="emerald" />
        <StatCard label="Archivés" value={counts.archived} tone="neutral" />
        <StatCard
          label="Note moyenne publiée"
          value={counts.published > 0 ? `${average.toFixed(1)}/5` : "—"}
          tone="gold"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "published", "archived"] as Filter[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === value
                ? "bg-emerald-700 text-white"
                : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            {value === "all" ? "Tous" : STATUS_LABEL[value]}{" "}
            <span className="opacity-70">({counts[value]})</span>
          </button>
        ))}
        <div className="relative ms-auto">
          <Search className="pointer-events-none absolute start-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un nom, un métier…"
            className={`${inputCls} w-64 ps-8`}
          />
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="text-sm font-medium text-emerald-900">
            {selected.length} sélectionné(s)
          </span>
          <Button
            kind="primary"
            disabled={pending}
            onClick={() =>
              run(() => setTestimonialStatusAction(selected, "published"), "Témoignages publiés.")
            }
          >
            Publier
          </Button>
          <Button
            kind="secondary"
            disabled={pending}
            onClick={() =>
              run(() => setTestimonialStatusAction(selected, "pending"), "Témoignages remis en attente.")
            }
          >
            Dépublier
          </Button>
          <Button
            kind="secondary"
            disabled={pending}
            onClick={() =>
              run(() => setTestimonialStatusAction(selected, "archived"), "Témoignages archivés.")
            }
          >
            Archiver
          </Button>
          <Button kind="danger" disabled={pending} onClick={() => confirmDelete(selected)}>
            Supprimer
          </Button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ms-auto text-sm text-emerald-700 underline"
          >
            Tout désélectionner
          </button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-10 text-center text-sm text-neutral-500">
          Aucun témoignage pour ce filtre.
        </p>
      ) : (
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} />
            Tout sélectionner ({filtered.length})
          </label>

          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="mt-1"
                  aria-label={`Sélectionner le témoignage de ${item.name}`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                      {SOURCE_LABEL[item.source]}
                    </span>
                    <Stars value={item.rating} />
                    <span className="text-[11px] text-neutral-400">
                      Créé le {formatDate(item.createdAt)}
                    </span>
                    {item.publishedAt ? (
                      <span className="text-[11px] text-emerald-600">
                        Publié le {formatDate(item.publishedAt)}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-emerald-950">
                    {item.name}{" "}
                    <span className="font-normal text-neutral-500">
                      {[item.job, item.nationality].filter(Boolean).join(" · ")}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                    {item.message}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-neutral-500">
                    {item.whatsapp ? (
                      <a
                        href={whatsappHref(item.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                        title="Ouvrir WhatsApp (visible uniquement dans l'admin)"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> {item.whatsapp}
                      </a>
                    ) : (
                      <span className="text-neutral-400">Sans WhatsApp</span>
                    )}
                    {item.adminNote ? (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">
                        Note interne : {item.adminNote}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button kind="secondary" onClick={() => setEditor({ mode: "edit", item })}>
                      <Pencil className="h-4 w-4" /> Voir / Modifier
                    </Button>

                    {item.status !== "published" ? (
                      <Button
                        kind="primary"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => setTestimonialStatusAction([item.id], "published"),
                            "Témoignage publié.",
                          )
                        }
                      >
                        <CheckCircle2 className="h-4 w-4" /> Publier
                      </Button>
                    ) : (
                      <Button
                        kind="secondary"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => setTestimonialStatusAction([item.id], "pending"),
                            "Témoignage dépublié.",
                          )
                        }
                      >
                        Dépublier
                      </Button>
                    )}

                    {item.status !== "archived" ? (
                      <Button
                        kind="secondary"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => setTestimonialStatusAction([item.id], "archived"),
                            "Témoignage archivé.",
                          )
                        }
                      >
                        <Archive className="h-4 w-4" /> Archiver
                      </Button>
                    ) : (
                      <Button
                        kind="secondary"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => setTestimonialStatusAction([item.id], "pending"),
                            "Témoignage restauré.",
                          )
                        }
                      >
                        <ArchiveRestore className="h-4 w-4" /> Restaurer
                      </Button>
                    )}

                    <Button kind="danger" disabled={pending} onClick={() => confirmDelete([item.id])}>
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editor ? (
        <TestimonialEditor
          key={editor.mode === "edit" ? editor.item.id : "new"}
          initial={editor.mode === "edit" ? editor.item : null}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null);
            setBanner({ ok: true, message });
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "amber" | "emerald" | "neutral" | "gold";
}) {
  const cls = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
    gold: "border-amber-300 bg-amber-100 text-amber-900",
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 ${cls}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function TestimonialEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Testimonial | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState<TestimonialAdminInput>(() =>
    initial
      ? {
          id: initial.id,
          name: initial.name,
          whatsapp: initial.whatsapp,
          job: initial.job ?? "",
          nationality: initial.nationality ?? "",
          message: initial.message,
          rating: initial.rating,
          locale: initial.locale,
          status: initial.status,
          source: initial.source,
          publishedText: initial.publishedText ?? {},
          adminNote: initial.adminNote ?? "",
          order: initial.order ?? 0,
        }
      : emptyInput(),
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch: Partial<TestimonialAdminInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const setText = (locale: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      publishedText: { ...(prev.publishedText ?? {}), [locale]: value },
    }));

  const save = () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError("Le nom et le message sont obligatoires.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await saveTestimonialAction(form);
      if (result.ok) {
        onSaved(initial ? "Témoignage mis à jour." : "Témoignage créé.");
      } else {
        setError(result.message ?? "Erreur lors de l'enregistrement.");
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="testimonial-editor-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 id="testimonial-editor-title" className="text-lg font-bold text-emerald-950">
            {initial ? "Modifier le témoignage" : "Nouveau témoignage"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
          {error ? <StatusBanner ok={false} message={error} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom *">
              <TextInput value={form.name} onChange={(value) => set({ name: value })} />
            </Field>
            <Field label="WhatsApp" hint="Privé — jamais affiché sur le site.">
              <TextInput
                value={form.whatsapp}
                onChange={(value) => set({ whatsapp: value })}
                placeholder="+966 5X XXX XXXX"
              />
            </Field>
            <Field label="Profession">
              <TextInput value={form.job ?? ""} onChange={(value) => set({ job: value })} />
            </Field>
            <Field label="Nationalité">
              <TextInput
                value={form.nationality ?? ""}
                onChange={(value) => set({ nationality: value })}
              />
            </Field>
          </div>

          <Field label="Message *">
            <TextArea
              value={form.message}
              onChange={(value) => set({ message: value })}
              rows={4}
              placeholder="Texte original du client…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Note">
              <Select
                value={String(form.rating)}
                onChange={(value) => set({ rating: Number(value) })}
                options={RATING_OPTIONS}
              />
            </Field>
            <Field label="Langue d'origine">
              <Select
                value={form.locale ?? "ar"}
                onChange={(value) => set({ locale: value })}
                options={ADMIN_LOCALES.map((locale) => ({
                  value: locale,
                  label: `${LANGUAGE_FLAGS[locale] ?? ""} ${LANGUAGE_LABELS[locale] ?? locale}`,
                }))}
              />
            </Field>
            <Field label="Statut">
              <Select
                value={form.status ?? "pending"}
                onChange={(value) => set({ status: value as TestimonialStatus })}
                options={STATUS_OPTIONS}
              />
            </Field>
            <Field label="Source">
              <Select
                value={form.source ?? "in-store"}
                onChange={(value) => set({ source: value as TestimonialSource })}
                options={SOURCE_OPTIONS}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ordre d'affichage" hint="Plus petit = affiché en premier.">
              <input
                type="number"
                className={inputCls}
                value={Number.isFinite(form.order) ? form.order : 0}
                onChange={(event) => set({ order: Number(event.target.value) || 0 })}
              />
            </Field>
            <Field label="Note interne (admin)" hint="Jamais affichée sur le site.">
              <TextInput
                value={form.adminNote ?? ""}
                onChange={(value) => set({ adminNote: value })}
                placeholder="Vérifié par WhatsApp, client régulier…"
              />
            </Field>
          </div>

          <details className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-emerald-900">
              Texte public par langue (optionnel)
            </summary>
            <p className="mt-2 text-[12px] text-neutral-500">
              Laissez vide pour afficher le message original. Utile pour reformuler ou traduire un
              avis avant publication.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ADMIN_LOCALES.map((locale) => (
                <label key={locale} className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-emerald-900">
                    {LANGUAGE_FLAGS[locale] ?? ""} {LANGUAGE_LABELS[locale] ?? locale}
                  </span>
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={form.publishedText?.[locale] ?? ""}
                    placeholder={form.message || "Texte original"}
                    onChange={(event) => setText(locale, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <Button kind="secondary" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button kind="primary" onClick={save} busy={pending}>
            {initial ? "Enregistrer les modifications" : "Créer le témoignage"}
          </Button>
        </div>
      </div>
    </div>
  );
}
