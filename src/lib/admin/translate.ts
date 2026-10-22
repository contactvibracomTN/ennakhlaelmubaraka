/**
 * Machine translation — Google Cloud Translation API v2 (REST, API-key only).
 *
 * Safeguards:
 *  - Placeholders like {price} or {count} are masked before translation and
 *    restored afterwards (Google would otherwise mangle or lose them).
 *  - A locked GLOSSARY (the real product names, taken from the catalog) is
 *    re-applied over the machine output so « عجوة المدينة » never becomes a
 *    mistranslated brand name.
 *
 * The API key lives in GOOGLE_TRANSLATE_API_KEY (`.env.local`). Without a key
 * the panel works in manual mode: the "Traduire" buttons are disabled.
 */
import { getTranslateApiKey, getSourceLocale } from "./secrets";
import { readDates, readGifts } from "./store";
import { ADMIN_LOCALES } from "./store";
import { type AnyLocalized, type LocalizedRecord } from "./shared";

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

export function isTranslationConfigured(): boolean {
  return getTranslateApiKey().length > 0;
}

export function getConfiguredSourceLocale(): string {
  const s = getSourceLocale();
  return (ADMIN_LOCALES as readonly string[]).includes(s) ? s : "ar";
}

function stripEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/* ------------------------------------------------------------------ */
/* glossary (product names, never machine-them)                       */
/* ------------------------------------------------------------------ */

interface GlossaryEntry {
  /** term in the source locale */
  src: string;
  /** localized name per locale */
  names: Partial<Record<string, string>>;
}

let glossaryCache: { at: number; entries: GlossaryEntry[] } | null = null;

function buildGlossaryEntries(): GlossaryEntry[] {
  const entries: GlossaryEntry[] = [];
  const source = getConfiguredSourceLocale();
  const collect = (products: Array<{ name: AnyLocalized }>) => {
    for (const p of products) {
      const rec = p.name as LocalizedRecord;
      const src = rec[source];
      if (!src) continue;
      const names: Partial<Record<string, string>> = {};
      for (const loc of ADMIN_LOCALES) if (rec[loc]) names[loc] = rec[loc];
      entries.push({ src, names });
    }
  };
  collect(readDates());
  collect(readGifts());
  return entries;
}

function glossary(): GlossaryEntry[] {
  const now = Date.now();
  if (!glossaryCache || now - glossaryCache.at > 60_000) {
    glossaryCache = { at: now, entries: buildGlossaryEntries() };
  }
  return glossaryCache.entries;
}

export function applyGlossary(text: string, target: string): string {
  if (!text) return text;
  let out = text;
  for (const entry of glossary()) {
    const replacement = entry.names[target];
    if (replacement && replacement !== entry.src && out.includes(entry.src)) {
      out = out.split(entry.src).join(replacement);
    }
  }
  return out;
}

export function resetGlossaryCache(): void {
  glossaryCache = null;
}

/* ------------------------------------------------------------------ */
/* placeholder masking                                                */
/* ------------------------------------------------------------------ */

function mask(texts: string[]): { masked: string[]; restore: (s: string) => string } {
  const map = new Map<string, string>();
  let i = 0;
  const masked = texts.map((t) =>
    t.replace(/\{([a-zA-Z0-9_]+)\}/g, (_m, key) => {
      const token = `__M${i++}__`;
      map.set(token, `{${key}}`);
      return token;
    }),
  );
  return {
    masked,
    restore: (s: string) => {
      let out = s;
      for (const [token, value] of map) out = out.split(token).join(value);
      return out;
    },
  };
}

/* ------------------------------------------------------------------ */
/* Google v2 calls                                                    */
/* ------------------------------------------------------------------ */

export async function translateTexts(texts: string[], target: string, source: string): Promise<string[]> {
  const key = getTranslateApiKey();
  if (!key) throw new Error("Clé API Google Translate non configurée (GOOGLE_TRANSLATE_API_KEY).");
  const { masked, restore } = mask(texts);
  const chunks: string[][] = [];
  for (let k = 0; k < masked.length; k += 100) chunks.push(masked.slice(k, k + 100));

  const out: string[] = [];
  for (const chunk of chunks) {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: chunk, target, source, format: "text" }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Translate HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      data: { translations: Array<{ translatedText: string }> };
    };
    for (const t of data.data.translations) {
      out.push(restore(stripEntities(t.translatedText)));
    }
  }
  return out;
}

/** Translate a batch with glossary protection applied per result. */
export async function translateTextsWithGlossary(
  texts: string[],
  target: string,
  source: string,
): Promise<string[]> {
  const raw = await translateTexts(texts, target, source);
  return raw.map((t) => applyGlossary(t, target));
}

/* ------------------------------------------------------------------ */
/* walking localized records inside an item doc                       */
/* ------------------------------------------------------------------ */

export type JsonDoc = Record<string, unknown>;

/** One step in a document path: an object key or an array index. */
export type PathSegment = string | number;
export type PathRef = PathSegment[];

export interface LocalizableRef {
  /**
   * Key/index segments — e.g. ["name"], ["weightOptions", 0, "label"],
   * ["imageAlts", "/images/dates/ajwa.jpg"].
   *
   * Segments (not a dotted string): image-alt keys are file paths that CONTAIN
   * a dot (".jpg"), so a dotted path would be split in the wrong place and
   * corrupt the document (the original cause of the "Traduction partielle …
   * imageAlts … expected string, received object" error).
   */
  path: PathRef;
  record: Record<string, string>;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isLocalizableRecord(x: unknown): x is Record<string, string> {
  if (!isRecord(x)) return false;
  const keys = Object.keys(x);
  if (keys.length === 0) return false;
  return keys.every((k) => (ADMIN_LOCALES as readonly string[]).includes(k) && typeof x[k] === "string");
}

/** Depth-first walk collecting every localized (locale→string) record. */
export function collectLocalizable(item: JsonDoc): LocalizableRef[] {
  const refs: LocalizableRef[] = [];
  const walk = (node: unknown, path: PathRef): void => {
    if (Array.isArray(node)) {
      node.forEach((child, idx) => walk(child, [...path, idx]));
      return;
    }
    if (isRecord(node)) {
      if (isLocalizableRecord(node)) {
        refs.push({ path, record: node as Record<string, string> });
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        if (isRecord(v) || Array.isArray(v)) walk(v, [...path, k]);
      }
    }
  };
  walk(item, []);
  return refs;
}

/** Accept a segment array, or a legacy dotted path ("weightOptions[0].label"). */
function toPathSegments(path: string | PathRef): PathRef {
  if (Array.isArray(path)) return path;
  return path
    .split(/[\.\[\]]+/)
    .filter(Boolean)
    .map((part) => (nextIdx(part) !== null ? Number(part) : part));
}

function nextIdx(s: string): number | null {
  return /^\d+$/.test(s) ? Number(s) : null;
}

/** Write `value` at `path` in an existing document tree. */
export function setAtPath(root: JsonDoc, path: string | PathRef, value: unknown): void {
  const parts = toPathSegments(path);
  if (parts.length === 0) return;
  let node: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (Array.isArray(node)) {
      const idx = nextIdx(String(part));
      if (idx === null) return;
      node = node[idx];
    } else if (isRecord(node)) {
      node = node[String(part)];
    } else {
      return;
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(node)) {
    const idx = nextIdx(String(last));
    if (idx === null) return;
    node[idx] = value;
  } else if (isRecord(node)) {
    node[String(last)] = value;
  }
}

export function getAtPath(root: JsonDoc, path: string | PathRef): unknown {
  const parts = toPathSegments(path);
  let node: unknown = root;
  for (const part of parts) {
    if (Array.isArray(node)) {
      const idx = nextIdx(String(part));
      if (idx === null) return undefined;
      node = node[idx];
    } else if (isRecord(node)) {
      node = node[String(part)];
    } else {
      return undefined;
    }
  }
  return node;
}