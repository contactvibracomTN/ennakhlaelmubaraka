import { readAdminState, resolveItemStatus, itemKey } from "./state";
import {
  ADMIN_LOCALES,
  type AnyLocalized,
  type ContentKind,
  type ItemLocaleState,
  type LocalizedRecord,
} from "./shared";

/** Merge saved admin state + content presence for a given item. */
export function computeItemStatuses(
  kind: ContentKind,
  slug: string,
  name: AnyLocalized | undefined,
): Record<string, ItemLocaleState> {
  const rec = (name ?? {}) as LocalizedRecord;
  const present = Object.keys(rec).filter((l) => (ADMIN_LOCALES as readonly string[]).includes(l));
  const state = readAdminState();
  const machine = Object.entries(state.items[itemKey(kind, slug)] ?? {})
    .filter(([, s]) => s.status === "machine")
    .map(([l]) => l);
  return resolveItemStatus(kind, slug, present, machine);
}