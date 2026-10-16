"use client";

/**
 * Shared admin form primitives (client).
 * French-only UI (tool, not part of the localized site).
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_LOCALES,
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  type ContentKind,
  type ItemLocaleState,
  type LocalizedRecord,
} from "@/lib/admin/shared";
import type { LocalizedText } from "@/types/localization";
import { setItemLocaleAction, uploadImageAction } from "@/app/admin/actions";

/* ------------------------------------------------------------------ */
/* small primitives                                                   */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? (
        <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-emerald-900">
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="mt-1 text-[11px] text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={inputCls}
      rows={rows}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumInput({
  value,
  onChange,
  step = "any",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      min={0}
      className={inputCls}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Button({
  onClick,
  children,
  kind = "secondary",
  disabled,
  busy,
  type,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  kind?: "primary" | "secondary" | "danger" | "gold";
  disabled?: boolean;
  busy?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const cls = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    secondary: "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50",
    danger: "bg-red-50 text-red-700 border border-red-300 hover:bg-red-100",
    gold: "bg-amber-500 text-white hover:bg-amber-600",
  }[kind];
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled || busy}
      title={title}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
    >
      {busy ? <Spin /> : null}
      {children}
    </button>
  );
}

export function Spin() {
  return <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function StatusBanner({ ok, message, tone }: { ok: boolean; message: string; tone?: "error" | "success" | "info" }) {
  if (!message) return null;
  const t = tone ?? (ok ? "success" : "error");
  const cls =
    t === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : t === "info"
        ? "border-sky-300 bg-sky-50 text-sky-800"
        : "border-red-300 bg-red-50 text-red-800";
  return <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>{ok ? "✓ " : "✗ "}{message}</div>;
}

/* ------------------------------------------------------------------ */
/* localization                                                       */
/* ------------------------------------------------------------------ */

export function LocaleBadge({ locale, status }: { locale: string; status?: ItemLocaleState }) {
  const s = status?.status ?? "missing";
  const map = {
    validated: { dot: "bg-emerald-500", label: "validé", text: "text-emerald-700" },
    machine: { dot: "bg-amber-400", label: "machine", text: "text-amber-700" },
    missing: { dot: "bg-neutral-300", label: "absent", text: "text-neutral-400" },
  }[s];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] ${map.text}`} title={status?.by}>
      <span className={`h-2 w-2 rounded-full ${map.dot}`} />
      {LANGUAGE_FLAGS[locale] ?? ""} {LANGUAGE_LABELS[locale] ?? locale} · {map.label}
    </span>
  );
}

/**
 * One localized field (name, teaser, origin…): 8 inputs + per-locale status
 * and one-click human validation.
 */
export function LocalizedInput<R extends LocalizedRecord | LocalizedText = LocalizedRecord>({
  label,
  hint,
  record,
  onChange,
  statuses,
  kind,
  slug,
  multiline = false,
  source = "ar",
}: {
  label: string;
  hint?: string;
  record: R | undefined;
  onChange: (r: R) => void;
  statuses?: Record<string, ItemLocaleState>;
  kind: ContentKind;
  slug: string;
  multiline?: boolean;
  source?: string;
}) {
  const router = useRouter();
  const [busyLoc, setBusyLoc] = useState<string | null>(null);
  const rec = (record ?? {}) as LocalizedRecord;

  const setVal = (loc: string, v: string) => onChange({ ...rec, [loc]: v } as R);

  const validate = async (loc: string) => {
    setBusyLoc(loc);
    await setItemLocaleAction(kind, slug, loc, "validated", "admin");
    setBusyLoc(null);
    router.refresh();
  };

  const unvalidate = async (loc: string) => {
    setBusyLoc(loc);
    await setItemLocaleAction(kind, slug, loc, "machine", "admin");
    setBusyLoc(null);
    router.refresh();
  };

  return (
    <Field label={label} hint={hint}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ADMIN_LOCALES.map((loc) => {
          const st = statuses?.[loc] ?? { status: "missing" as const };
          const isMachine = st.status === "machine";
          return (
            <div key={loc} className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[12px] font-semibold text-neutral-700">
                  {LANGUAGE_FLAGS[loc]} {LANGUAGE_LABELS[loc]}
                </span>
                {loc !== source && (
                  <span className="flex items-center gap-1">
                    {st.status === "validated" ? (
                      <button
                        title="Marquer comme à réviser (non validé)"
                        onClick={() => unvalidate(loc)}
                        className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-200"
                      >
                        ✓ {busyLoc === loc ? "…" : "validé"}
                      </button>
                    ) : (
                      <button
                        title={isMachine ? "Version machine — à valider" : "Absent — à remplir puis valider"}
                        onClick={() => validate(loc)}
                        className={isMachine ? "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 hover:bg-amber-200" : "rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600 hover:bg-neutral-300"}
                      >
                        {busyLoc === loc ? "…" : isMachine ? "⚙ valider" : "➕ valider"}
                      </button>
                    )}
                  </span>
                )}
              </div>
              {multiline ? (
                <TextArea value={rec[loc] ?? ""} onChange={(v) => setVal(loc, v)} rows={3} />
              ) : (
                <TextInput value={rec[loc] ?? ""} onChange={(v) => setVal(loc, v)} />
              )}
            </div>
          );
        })}
      </div>
    </Field>
  );
}

/** Per-locale lines editor (split/join on newline): use for list items / table rows. */
export function LocalizedLinesInput({
  label,
  hint,
  linesPerLocale,
  onChange,
  statuses,
  kind,
  slug,
}: {
  label: string;
  hint?: string;
  linesPerLocale: Record<string, string[]> | undefined;
  onChange: (lines: Record<string, string[]>) => void;
  statuses?: Record<string, ItemLocaleState>;
  kind: ContentKind;
  slug: string;
}) {
  const current: Record<string, string[]> = linesPerLocale ?? {};
  const render = (loc: string, v: string[]) => v.join("\n");
  return (
    <LocalizedInput
      label={label}
      hint={hint ?? "Une ligne par élément."}
      record={Object.fromEntries(
        ADMIN_LOCALES.map((l) => [l, render(l, current[l] ?? [])]),
      )}
      onChange={(rec) => {
        const next: Record<string, string[]> = {};
        for (const l of ADMIN_LOCALES) {
          next[l] = (rec[l] ?? "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        onChange(next);
      }}
      statuses={statuses}
      kind={kind}
      slug={slug}
      multiline
    />
  );
}

/* ------------------------------------------------------------------ */
/* image list + upload                                                */
/* ------------------------------------------------------------------ */

export function ImageListEditor({
  label,
  images,
  onChange,
  single = false,
}: {
  label: string;
  images: string[];
  onChange: (paths: string[]) => void;
  single?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const list = single ? images.slice(0, 1) : images;

  const upload = async (file: File) => {
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadImageAction(fd);
      if (res.ok) {
        const next = single ? [res.path] : [...list, res.path];
        onChange(next);
        router.refresh();
      } else {
        setError(res.error);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Field label={label}>
      <ul className="space-y-2">
        {list.map((p, i) => (
          <li key={`${p}-${i}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-12 w-12 rounded border border-neutral-200 bg-white object-cover" />
            <input className={inputCls} value={p} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button
              kind="danger"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <Button kind="secondary" onClick={() => fileRef.current?.click()} busy={busy}>
          📤 Téléverser
        </Button>
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    </Field>
  );
}