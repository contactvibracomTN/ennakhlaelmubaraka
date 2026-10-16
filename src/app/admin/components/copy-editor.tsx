"use client";

/** Copy/text editor — leaf keys per section across the 8 locale files. */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveCopyKeysAction,
  saveCopySectionAction,
  translateCopySectionAction,
} from "@/app/admin/actions";
import { ADMIN_LOCALES, LANGUAGE_FLAGS, LANGUAGE_LABELS } from "@/lib/admin/shared";
import { getAtPath, stringLeafPaths } from "@/lib/utils/path";
import { Button, Field, StatusBanner, TextArea } from "./fields";

export function CopyEditor({
  messagesByLocale,
  sourceLocale,
  translationAvailable,
}: {
  messagesByLocale: Record<string, Record<string, unknown>>;
  sourceLocale: string;
  translationAvailable: boolean;
}) {
  const router = useRouter();
  const sections = useMemo(() => {
    const base = Object.keys(messagesByLocale[sourceLocale] ?? {});
    return base.filter((s) => s !== "faq").sort();
  }, [messagesByLocale, sourceLocale]);

  const initialSection = sections.includes("home") ? "home" : sections[0] ?? "";
  const [section, setSection] = useState(initialSection);
  const [search, setSearch] = useState("");
  const [consoleLocale, setConsoleLocale] = useState(sourceLocale);
  const [consoleMode, setConsoleMode] = useState(false);
  const [consoleText, setConsoleText] = useState("");
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ ok: boolean; message: string; tone?: "info" } | null>(null);
  const [busy, setBusy] = useState<"save" | "translate" | "console" | null>(null);
  const [limit, setLimit] = useState(40);

  const sectionNode = (messagesByLocale[sourceLocale] ?? {})[section];
  const paths = useMemo(() => {
    if (typeof sectionNode !== "object" || sectionNode === null) return [];
    return stringLeafPaths(sectionNode);
  }, [sectionNode]);

  const filtered = search
    ? paths.filter((p) => p.toLowerCase().includes(search.toLowerCase()))
    : paths;

  const value = (p: string, loc: string): string => {
    if (dirty[`${p}|${loc}`] !== undefined) return dirty[`${p}|${loc}`];
    const node = (messagesByLocale[loc] ?? {})[section];
    const v = getAtPath(node, p);
    return typeof v === "string" ? v : "";
  };

  const setValue = (p: string, loc: string, v: string) => {
    setDirty((d) => ({ ...d, [`${p}|${loc}`]: v }));
  };

  const save = async () => {
    setBanner(null);
    setBusy("save");
    try {
      const changes = Object.entries(dirty).map(([key, value]) => {
        const sep = key.lastIndexOf("|");
        // action applies paths on the whole message tree → prefix the section
        return { path: `${section}.${key.slice(0, sep)}`, locale: key.slice(sep + 1), value };
      });
      if (changes.length === 0) {
        setBanner({ ok: true, message: "Aucune modification à enregistrer.", tone: "info" });
        return;
      }
      const res = await saveCopyKeysAction(changes);
      setBanner(
        res.ok
          ? { ok: true, message: `${changes.length} texte(s) enregistré(s). Déployez pour publier.` }
          : { ok: false, message: res.message ?? "Erreur" },
      );
      if (res.ok) setDirty({});
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const translate = async () => {
    setBanner(null);
    setBusy("translate");
    try {
      const res = await translateCopySectionAction(section);
      setBanner(
        res.ok
          ? { ok: true, message: `Section « ${section} » traduite (${res.translatedLocales.join(", ")}).` }
          : { ok: false, message: `Traduction partielle : ${res.errors.join(" · ")}` },
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const saveConsole = async () => {
    setBanner(null);
    setBusy("console");
    try {
      const res = await saveCopySectionAction(consoleLocale, section, consoleText);
      setBanner(
        res.ok
          ? { ok: true, message: `Section « ${section} » (${consoleLocale}) remplacée via la console JSON.` }
          : { ok: false, message: res.message ?? "Erreur" },
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const openConsole = (loc: string) => {
    const node = (messagesByLocale[loc] ?? {})[section];
    setConsoleLocale(loc);
    setConsoleText(JSON.stringify(node, null, 2));
    setConsoleMode(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Field className="w-auto" label="Section">
          <select
            className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setDirty({});
              setLimit(40);
            }}
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <div className="ml-auto flex items-center gap-2">
          <Button kind="primary" busy={busy === "save"} onClick={() => void save()}>
            💾 Enregistrer
          </Button>
          <Button kind="gold" busy={busy === "translate"} disabled={!translationAvailable} onClick={() => void translate()}>
            ✨ Traduire la section
          </Button>
          <Button kind="secondary" onClick={() => setConsoleMode((m) => !m)}>
            {consoleMode ? "Édition simple" : "Console JSON"}
          </Button>
        </div>
      </div>

      {banner ? <StatusBanner ok={banner.ok} message={banner.message} tone={banner.tone} /> : null}

      {consoleMode ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Console JSON — section « {section} »</span>
            <select
              className="ml-auto rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm"
              value={consoleLocale}
              onChange={(e) => openConsole(e.target.value)}
            >
              {ADMIN_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
          <pre className="mb-2 max-h-80 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-[11px] text-neutral-500">
            {paths.length} clé(s) dans la version {sourceLocale.toUpperCase()}
          </pre>
          <TextArea value={consoleText} onChange={setConsoleText} rows={16} />
          <div className="mt-2">
            <Button kind="primary" busy={busy === "console"} onClick={() => void saveConsole()}>
              Valider le JSON &amp; enregistrer
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <input
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Rechercher une clé… (ex: title, cta)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filtered.slice(0, limit).map((p) => (
              <section key={p} className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <code className="text-[12px] font-semibold text-emerald-900">{section}.{p}</code>
                  <span className="text-[11px] text-neutral-400">clé de page</span>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {ADMIN_LOCALES.map((l) => (
                    <label key={l} className="block">
                      <span className="mb-0.5 block text-[10px] font-medium uppercase text-neutral-500">
                        {LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}
                      </span>
                      <textarea
                        rows={2}
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-[13px] outline-none focus:border-emerald-500"
                        value={value(p, l)}
                        onChange={(e) => setValue(p, l, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))}
            {filtered.length > limit ? (
              <Button kind="secondary" onClick={() => setLimit((n) => n + 60)}>
                Afficher plus ({filtered.length - limit} restantes)
              </Button>
            ) : null}
            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-500">Aucune clé pour cette recherche.</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}