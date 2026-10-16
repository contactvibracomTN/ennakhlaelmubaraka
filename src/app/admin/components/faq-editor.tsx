"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveFaqAction, translateFaqAction } from "@/app/admin/actions";
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, ADMIN_LOCALES } from "@/lib/admin/shared";
import { Button, Field, StatusBanner, TextArea } from "./fields";

export interface FaqEntry {
  q: string;
  a: string;
}

export function FaqEditor({
  itemsByLocale,
  sourceLocale,
  translationAvailable,
}: {
  itemsByLocale: Record<string, FaqEntry[]>;
  sourceLocale: string;
  translationAvailable: boolean;
}) {
  const [items, setItems] = useState<Record<string, FaqEntry[]>>(itemsByLocale);
  const [locale, setLocale] = useState<string>(sourceLocale);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState<"save" | "translate" | null>(null);
  const router = useRouter();

  const arCount = (items[sourceLocale] ?? []).length;
  const parityOk = ADMIN_LOCALES.every((l) => (items[l] ?? []).length === arCount);

  const patchEntry = (loc: string, i: number, p: Partial<FaqEntry>) =>
    setItems((prev) => ({
      ...prev,
      [loc]: (prev[loc] ?? []).map((e, j) => (j === i ? { ...e, ...p } : e)),
    }));

  const addRow = () =>
    setItems((prev) => {
      const next: Record<string, FaqEntry[]> = {};
      for (const l of ADMIN_LOCALES) next[l] = [...(prev[l] ?? []), { q: "", a: "" }];
      return next;
    });

  const removeRow = (i: number) =>
    setItems((prev) => {
      const next: Record<string, FaqEntry[]> = {};
      for (const l of ADMIN_LOCALES) next[l] = (prev[l] ?? []).filter((_, j) => j !== i);
      return next;
    });

  const run = async (kind: "save" | "translate") => {
    setBanner(null);
    setBusy(kind);
    try {
      if (kind === "save") {
        const res = await saveFaqAction(items);
        setBanner(
          res.ok
            ? { ok: true, message: "FAQ enregistrée (8 langues). Déployez pour publier." }
            : { ok: false, message: res.message ?? "Erreur" },
        );
      } else {
        const res = await translateFaqAction();
        setBanner(
          res.ok
            ? { ok: true, message: `FAQ traduite depuis ${sourceLocale.toUpperCase()} (${res.translatedLocales.join(", ")}). Relisez et enregistrez si besoin.` }
            : { ok: false, message: `Traduction partielle : ${res.errors.join(" · ")}` },
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const current = items[locale] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {ADMIN_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded-lg px-2.5 py-1.5 text-sm ${
                locale === l ? "bg-emerald-700 text-white" : "bg-white border border-neutral-300 text-neutral-700"
              }`}
            >
              {LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-2">
          <Button kind="primary" busy={busy === "save"} onClick={() => void run("save")}>
            💾 Enregistrer
          </Button>
          <Button kind="gold" busy={busy === "translate"} disabled={!translationAvailable} onClick={() => void run("translate")}>
            ✨ Traduire (depuis {sourceLocale.toUpperCase()})
          </Button>
          <Button kind="secondary" onClick={addRow}>
            + Question
          </Button>
        </span>
      </div>

      {!parityOk ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠ Le nombre de questions diffère entre les langues — le déploiement sera bloqué.
        </p>
      ) : null}
      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <div className="space-y-3">
        {current.map((entry, i) => (
          <section key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-800">
                {LANGUAGE_FLAGS[locale]} Question {i + 1}
              </span>
              <Button kind="danger" onClick={() => removeRow(i)}>
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <Field label="Question">
                <TextArea value={entry.q} onChange={(q) => patchEntry(locale, i, { q })} rows={2} />
              </Field>
              <Field label="Réponse">
                <TextArea value={entry.a} onChange={(a) => patchEntry(locale, i, { a })} rows={4} />
              </Field>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}