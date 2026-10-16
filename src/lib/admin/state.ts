/**
 * Admin state — tracks the translation/validation status per item and locale.
 *
 * Statuses:
 *  - "validated" : human-approved (or pre-existing catalogue text — "héritage").
 *  - "machine"   : auto-translated draft — REQUIRES human validation.
 *  - "missing"   : not present in content yet.
 *
 * The source locale (ADMIN_SOURCE_LOCALE, default "ar") is treated as authored
 * and never needs validation. The deploy completeness gate blocks publication
 * while a locale of any enabled item is "machine" or "missing".
 */
import { getSourceLocale } from "./secrets";
import { readJsonFile, saveJsonFile } from "./store";
import { stateFile } from "./paths";
import type { ContentKind, ItemLocaleState, ItemLocaleStatus } from "./shared";

export type { ContentKind, ItemLocaleState, ItemLocaleStatus }; // re-export for server pages

export interface AdminState {
  sourceLocale: string;
  items: Record<string, Record<string, ItemLocaleState>>;
}

export const itemKey = (kind: ContentKind, slug: string): string => `${kind}:${slug}`;

export function readAdminState(): AdminState {
  const raw = readJsonFile<Partial<AdminState>>(stateFile());
  return {
    sourceLocale: raw?.sourceLocale ?? getSourceLocale(),
    items: raw?.items ?? {},
  };
}

export function saveAdminState(state: AdminState): void {
  saveJsonFile(stateFile(), state);
}

export function writeState(): AdminState {
  const state = readAdminState();
  state.sourceLocale = getSourceLocale();
  return state;
}

/** Get the saved state for one item/locale (undefined = not tracked → derive). */
export function getItemLocaleState(
  kind: ContentKind,
  slug: string,
  locale: string,
): ItemLocaleState | undefined {
  const state = readAdminState();
  return state.items[itemKey(kind, slug)]?.[locale];
}

/**
 * Seed state for an item from its CONTENT: every locale already carrying text
 * is marked "validated" (with provenance), machine-only locales stay
 * "machine", the source locale is "validated (source)". Locales without text
 * are left untracked (= missing).
 */
export function ensureItemState(
  kind: ContentKind,
  slug: string,
  presentLocales: string[],
  machineOnlyLocales: string[] = [],
): void {
  const state = writeState();
  const key = itemKey(kind, slug);
  state.items[key] ??= {};
  const source = state.sourceLocale;
  const now = new Date().toISOString();
  for (const loc of presentLocales) {
    if (state.items[key][loc]) continue; // keep existing decisions
    if (machineOnlyLocales.includes(loc)) {
      state.items[key][loc] = { status: "machine", by: "traduction machine", at: now, machine: true };
    } else if (loc === source) {
      state.items[key][loc] = { status: "validated", by: "rédaction (langue source)", at: now };
    } else {
      state.items[key][loc] = { status: "validated", by: "catalogue existant", at: now };
    }
  }
  saveAdminState(state);
}

/** Human decision on one locale version. */
export function setItemLocaleState(
  kind: ContentKind,
  slug: string,
  locale: string,
  status: ItemLocaleStatus,
  by: string,
): void {
  const state = writeState();
  const key = itemKey(kind, slug);
  state.items[key] ??= {};
  state.items[key][locale] = {
    status,
    by: by || "—",
    at: new Date().toISOString(),
    machine: status === "machine",
  };
  saveAdminState(state);
}

export function deleteItemState(kind: ContentKind, slug: string): void {
  const state = writeState();
  delete state.items[itemKey(kind, slug)];
  saveAdminState(state);
}

/** Live status for one item: merges tracked state with content presence. */
export function resolveItemStatus(
  kind: ContentKind,
  slug: string,
  presentLocales: string[],
  machineLocales: string[],
): Record<string, ItemLocaleState> {
  const state = readAdminState();
  const key = itemKey(kind, slug);
  const source = state.sourceLocale;
  const tracked = state.items[key] ?? {};
  const out: Record<string, ItemLocaleState> = {};
  const all = Array.from(new Set([...presentLocales, ...Object.keys(tracked), source]));
  for (const loc of all) {
    const t = tracked[loc];
    if (t) {
      out[loc] = t;
      continue;
    }
    if (loc === source) {
      out[loc] = { status: "validated", by: "langue source", at: undefined };
    } else if (presentLocales.includes(loc)) {
      out[loc] = machineLocales.includes(loc)
        ? { status: "machine", by: "traduction machine", machine: true }
        : { status: "validated", by: "catalogue existant", at: undefined };
    } else {
      out[loc] = { status: "missing" };
    }
  }
  return out;
}