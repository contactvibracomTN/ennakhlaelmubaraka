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

export interface LocalizableRef {
  /** e.g. "name", "teaser", "weightOptions[0].label", "sections[1].blocks[0].text" */
  path: string;
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
  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      node.forEach((child, idx) => walk(child, `${path}[${idx}]`));
      return;
    }
    if (isRecord(node)) {
      if (isLocalizableRecord(node)) {
        refs.push({ path, record: node as Record<string, string> });
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        const childPath = path ? `${path}.${k}` : k;
        if (isRecord(v) || Array.isArray(v)) walk(v, childPath);
      }
    }
  };
  walk(item, "");
  return refs;
}

export function setAtPath(root: JsonDoc, path: string, value: unknown): void {
  const parts = path.split(/[\.\[\]]+/).filter(Boolean);
  let node: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    let next: unknown;
    if (nextIdx(parts[i + 1]) !== null && Array.isArray(node)) {
      node = (node as unknown[])[nextIdx(parts[i + 1]) ?? 0];
    } else {
      if (!isRecord(node)) return;
      next = (node as Record<string, unknown>)[part];
      if (!isRecord(next) && !Array.isArray(next)) {
        const n = parts[i + 1];
        (node as Record<string, unknown>)[part] = nextIdx(n) !== null ? [] : {};
        next = (node as Record<string, unknown>)[part];
      }
      node = next;
    }
  }
  if (!isRecord(node)) return;
  node[parts[parts.length - 1]] = value;
}

function nextIdx(s: string): number | null {
  return /^\d+$/.test(s) ? Number(s) : null;
}

export function getAtPath(root: JsonDoc, path: string): unknown {
  const parts = path.split(/[\.\[\]]+/).filter(Boolean);
  let node: unknown = root;
  for (const part of parts) {
    if (Array.isArray(node)) {
      const idx = nextIdx(part);
      if (idx === null) return undefined;
      node = node[idx];
    } else if (isRecord(node)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node;
}