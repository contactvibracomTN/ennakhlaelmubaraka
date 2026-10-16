"use client";

/** Blog post editor (client) — sections/blocks/FAQ. French-only admin UI. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogBlock, BlogPost, BlogSection } from "@/types/blog";
import type { LocalizedText } from "@/types/localization";
import type { ItemLocaleState, LocalizedRecord } from "@/lib/admin/shared";
import { ADMIN_LOCALES, makeLocalized } from "@/lib/admin/shared";
import { deleteItemAction, savePostAction, translateItemAction } from "@/app/admin/actions";
import {
  Button,
  Field,
  ImageListEditor,
  LocalizedInput,
  Select,
  StatusBanner,
  TextInput,
  LocaleBadge,
} from "./fields";

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function newBlock(kind: string): BlogBlock {
  switch (kind) {
    case "list":
      return { kind: "list", items: [] };
    case "table":
      return { kind: "table", caption: makeLocalized(), columns: [makeLocalized()], rows: [[makeLocalized()]] };
    case "cta":
      return {
        kind: "cta",
        text: makeLocalized(),
        whatsappLabel: makeLocalized(),
        whatsappMessage: makeLocalized(),
        links: [{ label: makeLocalized(), href: "/dates" }],
      };
    case "quote":
      return { kind: "quote", text: makeLocalized() };
    default:
      return { kind: "paragraph", text: makeLocalized() };
  }
}

const BLOCK_KINDS = ["paragraph", "list", "quote", "table", "cta"] as const;

function linesToRecords(lines: Record<string, string[]>): LocalizedText[] {
  const n = Math.max(0, ...ADMIN_LOCALES.map((l) => lines[l]?.length ?? 0));
  return Array.from({ length: n }, (_, i) =>
    makeLocalized(Object.fromEntries(ADMIN_LOCALES.map((l) => [l, lines[l]?.[i] ?? ""] as [string, string]))),
  );
}

function recordsToLines(records: readonly LocalizedText[] | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const loc of ADMIN_LOCALES) out[loc] = (records ?? []).map((r) => (r as unknown as LocalizedRecord)[loc] ?? "");
  return out;
}

function rowsToText(rows: readonly LocalizedText[][] | undefined, loc: string): string {
  return (rows ?? []).map((row) => row.map((c) => (c as unknown as LocalizedRecord)[loc] ?? "").join(" | ")).join("\n");
}

/* ------------------------------------------------------------------ */
/* block editors                                                      */
/* ------------------------------------------------------------------ */

function ListBlockEditor({
  items,
  onChange,
  slug,
  source,
}: {
  items: LocalizedText[];
  onChange: (items: LocalizedText[]) => void;
  slug: string;
  source: string;
}) {
  const [lines, setLines] = useState<Record<string, string[]>>(() =>
    recordsToLines(items.length ? items : [makeLocalized()]),
  );
  const apply = (next: Record<string, string[]>) => {
    setLines(next);
    onChange(linesToRecords(next));
  };
  return (
    <LocalizedInput
      label="Éléments de la liste"
      hint="Une ligne par élément."
      record={Object.fromEntries(ADMIN_LOCALES.map((l) => [l, (lines[l] ?? []).join("\n")] as [string, string]))}
      onChange={(rec) =>
        apply(
          Object.fromEntries(
            ADMIN_LOCALES.map((l) => [
              l,
              (rec[l] ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
            ] as [string, string[]]),
          ),
        )
      }
      kind="post"
      slug={slug}
      multiline
      source={source}
    />
  );
}

function TableBlockEditor({
  block,
  onChange,
  slug,
  source,
}: {
  block: Extract<BlogBlock, { kind: "table" }>;
  onChange: (b: BlogBlock) => void;
  slug: string;
  source: string;
}) {
  const cols = block.columns ?? [makeLocalized()];
  const rows = block.rows ?? [[]];

  const patchCols = (rec: LocalizedRecord) => {
    const perLoc = ADMIN_LOCALES.map((l) =>
      (rec[l] ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    );
    const n = Math.max(1, ...perLoc.map((a) => a.length));
    const columns = Array.from({ length: n }, (_, i) =>
      makeLocalized(Object.fromEntries(ADMIN_LOCALES.map((l, li) => [l, perLoc[li][i] ?? ""] as [string, string]))),
    );
    onChange({ ...block, columns });
  };

  const patchRows = (rec: LocalizedRecord) => {
    const perLoc = ADMIN_LOCALES.map((l) =>
      (rec[l] ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    );
    const rowCount = Math.max(1, ...perLoc.map((a) => a.length));
    const grid: LocalizedRecord[][] = Array.from({ length: rowCount }, () => []);
    perLoc.forEach((lines, li) => {
      lines.forEach((line, r) => {
        const cells = line.split("|").map((s) => s.trim());
        cells.forEach((cell, c) => {
          while (grid.length <= r) grid.push([]);
          while ((grid[r] ?? []).length <= c) grid[r].push(makeLocalized() as unknown as LocalizedRecord);
          grid[r][c][ADMIN_LOCALES[li]] = cell;
        });
      });
    });
    const maxCols = Math.max(1, ...grid.map((r) => r.length));
    const rowsNormalized = grid.map((r) =>
      Array.from({ length: maxCols }, (_, c) => r[c] ?? makeLocalized()),
    ) as unknown as LocalizedText[][];
    onChange({ ...block, rows: rowsNormalized });
  };

  return (
    <div className="space-y-3">
      {block.caption ? (
        <LocalizedInput
          label="Légende du tableau"
          record={block.caption}
          onChange={(r) => onChange({ ...block, caption: r })}
          kind="post"
          slug={slug}
          source={source}
        />
      ) : null}
      <LocalizedInput
        label="En-têtes de colonnes"
        hint="Une ligne par colonne."
        record={Object.fromEntries(ADMIN_LOCALES.map((l) => [l, cols.map((c) => (c as unknown as LocalizedRecord)[l] ?? "").join("\n")] as [string, string]))}
        onChange={patchCols}
        kind="post"
        slug={slug}
        multiline
        source={source}
      />
      <LocalizedInput
        label="Lignes du tableau"
        hint="Une ligne = une rangée ; cellules séparées par « | »."
        record={Object.fromEntries(ADMIN_LOCALES.map((l) => [l, rowsToText(rows, l)] as [string, string]))}
        onChange={patchRows}
        kind="post"
        slug={slug}
        multiline
        source={source}
      />
    </div>
  );
}

function CtaBlockEditor({
  block,
  onChange,
  slug,
  source,
}: {
  block: Extract<BlogBlock, { kind: "cta" }>;
  onChange: (b: BlogBlock) => void;
  slug: string;
  source: string;
}) {
  const links = block.links ?? [];
  const setLink = (i: number, p: Partial<{ label: LocalizedText; href: string }>) =>
    onChange({ ...block, links: links.map((l, j) => (j === i ? { ...l, ...p } : l)) });
  return (
    <div className="space-y-3">
      <LocalizedInput
        label="Texte d'appel"
        record={block.text}
        onChange={(r) => onChange({ ...block, text: r })}
        kind="post"
        slug={slug}
        source={source}
        multiline
      />
      <LocalizedInput
        label="Libellé WhatsApp"
        record={block.whatsappLabel}
        onChange={(r) => onChange({ ...block, whatsappLabel: r })}
        kind="post"
        slug={slug}
        source={source}
      />
      <LocalizedInput
        label="Message WhatsApp"
        record={block.whatsappMessage}
        onChange={(r) => onChange({ ...block, whatsappMessage: r })}
        kind="post"
        slug={slug}
        source={source}
        multiline
      />
      <div>
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-emerald-900">Liens</p>
        {links.map((link, i) => (
          <div
            key={`${link.href}-${i}`}
            className="mb-2 grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 sm:grid-cols-2"
          >
            <LocalizedInput
              label={`Libellé lien ${i + 1}`}
              record={link.label}
              onChange={(r) => setLink(i, { label: r })}
              kind="post"
              slug={slug}
              source={source}
            />
            <div className="flex items-end gap-2">
              <Field label="URL (href)">
                <TextInput value={link.href} onChange={(href) => setLink(i, { href })} />
              </Field>
              <Button
                kind="danger"
                onClick={() => onChange({ ...block, links: links.filter((_, j) => j !== i) })}
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
        <Button kind="secondary" onClick={() => onChange({ ...block, links: [...links, { label: makeLocalized(), href: "/dates" }] })}>
          + Lien
        </Button>
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onRemove,
  slug,
  source,
}: {
  block: BlogBlock;
  onChange: (b: BlogBlock) => void;
  onRemove: () => void;
  slug: string;
  source: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Select
          value={block.kind}
          onChange={(k) => onChange(newBlock(k))}
          options={[...BLOCK_KINDS].map((k) => ({ value: k, label: `Bloc : ${k}` }))}
        />
        <span className="ml-auto" />
        <Button kind="danger" onClick={onRemove}>
          ✕
        </Button>
      </div>
      {block.kind === "paragraph" ? (
        <LocalizedInput
          label="Paragraphe"
          record={block.text}
          onChange={(r) => onChange({ kind: "paragraph", text: r })}
          kind="post"
          slug={slug}
          source={source}
          multiline
        />
      ) : null}
      {block.kind === "quote" ? (
        <LocalizedInput
          label="Citation"
          record={block.text}
          onChange={(r) => onChange({ kind: "quote", text: r })}
          kind="post"
          slug={slug}
          source={source}
          multiline
        />
      ) : null}
      {block.kind === "list" ? (
        <ListBlockEditor
          items={block.items ?? []}
          onChange={(items) => onChange({ kind: "list", items })}
          slug={slug}
          source={source}
        />
      ) : null}
      {block.kind === "table" ? (
        <TableBlockEditor block={block} onChange={onChange} slug={slug} source={source} />
      ) : null}
      {block.kind === "cta" ? (
        <CtaBlockEditor block={block} onChange={onChange} slug={slug} source={source} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* main editor                                                        */
/* ------------------------------------------------------------------ */

export function PostItemEditor({
  item,
  statuses,
  sourceLocale,
  translationAvailable,
}: {
  item: BlogPost;
  statuses: Record<string, ItemLocaleState>;
  sourceLocale: string;
  translationAvailable: boolean;
}) {
  const router = useRouter();
  const originalSlug = item.slug;
  const [doc, setDoc] = useState<BlogPost>(structuredClone(item));
  const [busy, setBusy] = useState<"save" | "translate" | "delete" | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const patch = (p: Partial<BlogPost>) => setDoc((d) => ({ ...d, ...p }));
  const patchSection = (i: number, s: BlogSection) =>
    setDoc((d) => ({ ...d, sections: d.sections.map((x, j) => (j === i ? s : x)) }));
  const patchFaq = (items: BlogPost["faq"]) => patch({ faq: items });

  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= doc.sections.length) return;
    setDoc((d) => {
      const sections = [...d.sections];
      const [it] = sections.splice(i, 1);
      sections.splice(j, 0, it);
      return { ...d, sections };
    });
  };

  const run = async (kind: "save" | "translate" | "delete") => {
    setBanner(null);
    setBusy(kind);
    try {
      if (kind === "delete") {
        if (!confirm(`Supprimer définitivement « ${doc.title.ar || doc.slug} » ?`)) return;
        await deleteItemAction("post", doc.slug);
        router.push("/admin/posts");
        router.refresh();
        return;
      }
      if (kind === "save") {
        const res = await savePostAction(originalSlug, doc as unknown);
        setBanner(
          res.ok
            ? { ok: true, message: "Enregistré. Déployez pour publier." }
            : { ok: false, message: res.message ?? "Erreur" },
        );
      } else {
        const res = await translateItemAction("post", originalSlug, doc as unknown);
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

  const productSlugsText = (doc.productSlugs ?? []).join(", ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button kind="primary" busy={busy === "save"} onClick={() => void run("save")}>
          💾 Enregistrer
        </Button>
        <Button kind="gold" busy={busy === "translate"} disabled={!translationAvailable} onClick={() => void run("translate")}>
          ✨ Traduire automatiquement
        </Button>
        <Button kind="danger" busy={busy === "delete"} onClick={() => void run("delete")}>
          🗑 Supprimer
        </Button>
        {!translationAvailable ? (
          <span className="text-xs text-amber-700">⚠️ Traduction auto indisponible : configurez GOOGLE_TRANSLATE_API_KEY.</span>
        ) : null}
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
        {Object.entries(statuses).map(([loc, st]) => (
          <LocaleBadge key={loc} locale={loc} status={st} />
        ))}
        <span className="ml-auto text-[11px] text-neutral-500">Langue source : {sourceLocale.toUpperCase()}</span>
      </div>

      {/* identity */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Article</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Slug (URL)">
            <TextInput value={doc.slug} onChange={(v) => patch({ slug: v })} />
          </Field>
          <Field label="Catégorie">
            <Select
              value={doc.category}
              onChange={(v) => patch({ category: v as BlogPost["category"] })}
              options={["ramadan", "nutrition", "recipes", "story"].map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Date de publication">
            <TextInput value={doc.date} onChange={(v) => patch({ date: v })} />
          </Field>
          <Field label="Statut de contenu">
            <Select
              value={doc.contentStatus}
              onChange={(v) => patch({ contentStatus: v as BlogPost["contentStatus"] })}
              options={["draft", "demo", "validated", "published"].map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Produits liés (slugs, virgules)">
            <TextInput
              value={productSlugsText}
              onChange={(v) => patch({ productSlugs: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </Field>
        </div>
      </section>

      {/* texts */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Titre & résumé</h2>
        <div className="space-y-5">
          <LocalizedInput
            label="Titre"
            record={doc.title}
            onChange={(r) => patch({ title: r })}
            statuses={statuses}
            kind="post"
            slug={originalSlug}
            source={sourceLocale}
          />
          <LocalizedInput
            label="Résumé (excerpt)"
            record={doc.excerpt}
            onChange={(r) => patch({ excerpt: r })}
            statuses={statuses}
            kind="post"
            slug={originalSlug}
            source={sourceLocale}
            multiline
          />
        </div>
      </section>

      {/* cover */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">Couverture</h2>
        <ImageListEditor
          label="Image de couverture"
          images={doc.coverImage ? [doc.coverImage] : []}
          onChange={(paths) => patch({ coverImage: paths[0] ?? undefined })}
          single
        />
      </section>

      {/* sections / blocks */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Sections</h2>
          <Button
            kind="secondary"
            onClick={() => patchSection(doc.sections.length, { heading: makeLocalized(), blocks: [] })}
          >
            + Section
          </Button>
        </div>
        {doc.sections.map((sec, si) => (
          <div key={si} className="mb-4 rounded-lg border border-neutral-300 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-neutral-700">Section {si + 1}</span>
              <div className="flex gap-1">
                <Button kind="secondary" disabled={si === 0} onClick={() => moveSection(si, -1)}>
                  ↑
                </Button>
                <Button kind="secondary" disabled={si === doc.sections.length - 1} onClick={() => moveSection(si, 1)}>
                  ↓
                </Button>
                <Button
                  kind="danger"
                  onClick={() => setDoc((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== si) }))}
                >
                  ✕
                </Button>
              </div>
            </div>
            <details className="mb-2">
              <summary className="cursor-pointer text-xs font-medium text-emerald-700">
                {sec.heading?.ar || sec.heading?.en || "Titre de section (optionnel)…"}
              </summary>
              <div className="mt-2">
                <LocalizedInput
                  label={`Titre de la section ${si + 1}`}
                  record={sec.heading}
                  onChange={(r) => patchSection(si, { ...sec, heading: r })}
                  kind="post"
                  slug={originalSlug}
                  source={sourceLocale}
                />
              </div>
            </details>
            <div className="space-y-3">
              {sec.blocks.map((block, bi) => (
                <BlockEditor
                  key={bi}
                  block={block}
                  onChange={(b) =>
                    patchSection(si, {
                      ...sec,
                      blocks: sec.blocks.map((x, j) => (j === bi ? b : x)),
                    })
                  }
                  onRemove={() =>
                    patchSection(si, { ...sec, blocks: sec.blocks.filter((_, j) => j !== bi) })
                  }
                  slug={originalSlug}
                  source={sourceLocale}
                />
              ))}
              <Button
                kind="secondary"
                onClick={() =>
                  patchSection(si, {
                    ...sec,
                    blocks: [...sec.blocks, newBlock("paragraph")],
                  })
                }
              >
                + Bloc
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
            FAQ de l’article {doc.faq && doc.faq.length > 0 ? `(${doc.faq.length})` : ""}
          </h2>
          <Button
            kind="secondary"
            onClick={() => patchFaq([...(doc.faq ?? []), { q: makeLocalized(), a: makeLocalized() }])}
          >
            + Question
          </Button>
        </div>
        {(doc.faq ?? []).map((entry, i) => (
          <div key={i} className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700">Question {i + 1}</span>
              <Button kind="danger" onClick={() => patchFaq((doc.faq ?? []).filter((_, j) => j !== i))}>
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <LocalizedInput
                label="Question"
                record={entry.q}
                onChange={(q) => patchFaq((doc.faq ?? []).map((e, j) => (j === i ? { ...e, q } : e)))}
                kind="post"
                slug={originalSlug}
                source={sourceLocale}
              />
              <LocalizedInput
                label="Réponse"
                record={entry.a}
                onChange={(a) => patchFaq((doc.faq ?? []).map((e, j) => (j === i ? { ...e, a } : e)))}
                kind="post"
                slug={originalSlug}
                source={sourceLocale}
                multiline
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}