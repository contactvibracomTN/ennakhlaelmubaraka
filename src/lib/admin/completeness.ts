/**
 * Completeness gate — runs on the dashboard, before every deploy, and after
 * saves. Verifies:
 *  1. message key parity across the 8 locale files (vs `ar` baseline),
 *  2. FAQ item-count parity across locales,
 *  3. every catalog/blog item has each locale "validated" (no "machine"
 *     awaiting review, no "missing" translation) — the source locale is always
 *     considered authored.
 */
import { readAllMessages, readDates, readGifts, readPosts } from "./store";
import { getAtPath, stringLeafPaths } from "@/lib/utils/path";
import { readAdminState, resolveItemStatus } from "./state";
import { ADMIN_LOCALES, type AnyLocalized, type ContentKind, type LocalizedRecord } from "./shared";
import { getSourceLocale } from "./secrets";

export interface LocaleBlock {
  status: string;
  by?: string;
}

export interface ItemCheck {
  kind: ContentKind;
  slug: string;
  title: Record<string, string>;
  ok: boolean;
  blockedLocales: string[];
  locales: Record<string, LocaleBlock>;
}

export interface CompletenessReport {
  ok: boolean;
  sourceLocale: string;
  messageIssues: Array<{ locale: string; missingCount: number; keys: string[] }>;
  faqIssue: { ok: boolean; counts: Record<string, number> };
  itemIssues: ItemCheck[];
  blockedSummary: string;
}

export function checkCompleteness(): CompletenessReport {
  const source = getSourceLocale();
  const messages = readAllMessages();
  const baseline = messages["ar"] ?? {};

  const messageIssues: CompletenessReport["messageIssues"] = [];
  const baselinePaths = stringLeafPaths(baseline);
  for (const locale of ADMIN_LOCALES) {
    if (locale === "ar") continue;
    const file = messages[locale];
    const missing = baselinePaths.filter((p) => {
      const v = file ? getAtPath(file, p) : undefined;
      return typeof v !== "string";
    });
    if (missing.length > 0) {
      messageIssues.push({ locale, missingCount: missing.length, keys: missing.slice(0, 15) });
    }
  }

  const faqCounts: Record<string, number> = {};
  for (const locale of ADMIN_LOCALES) {
    const items = getAtPath(messages[locale], "faq.items");
    faqCounts[locale] = Array.isArray(items) ? items.length : 0;
  }
  const arFaqCount = faqCounts["ar"] ?? 0;
  const faqIssue = {
    ok: Object.values(faqCounts).every((n) => n === arFaqCount),
    counts: faqCounts,
  };

  const state = readAdminState();
  const itemChecks: ItemCheck[] = [];
  const pushItems = (kind: ContentKind, items: Array<{ slug: string; name: AnyLocalized }>) => {
    for (const item of items) {
      const present = Object.keys(item.name).filter((l) => (ADMIN_LOCALES as readonly string[]).includes(l));
      const machineLocales = Object.entries(state.items[`${kind}:${item.slug}`] ?? {})
        .filter(([, s]) => s.status === "machine")
        .map(([l]) => l);
      const resolved = resolveItemStatus(kind, item.slug, present, machineLocales);
      const blocked = Object.entries(resolved)
        .filter(([l, s]) => (s.status === "machine" || s.status === "missing") && l !== source)
        .map(([l, s]) => `${s.status}:${l}`);
      itemChecks.push({
        kind,
        slug: item.slug,
        title: item.name as unknown as LocalizedRecord,
        ok: blocked.length === 0,
        blockedLocales: blocked,
        locales: Object.fromEntries(Object.entries(resolved).map(([l, s]) => [l, { status: s.status, by: s.by }])),
      });
    }
  };
  pushItems("date", readDates());
  pushItems("gift", readGifts());
  pushItems("post", readPosts().map((p) => ({ slug: p.slug, name: p.title })));

  const itemIssues = itemChecks.filter((i) => !i.ok);
  const ok = messageIssues.length === 0 && faqIssue.ok && itemIssues.length === 0;

  let blockedSummary = "";
  if (!ok) {
    const parts: string[] = [];
    for (const m of messageIssues) parts.push(`${m.locale}: ${m.missingCount} clé(s) manquante(s)`);
    if (!faqIssue.ok) parts.push("FAQ: comptes d'items inégaux entre langues");
    for (const i of itemIssues) parts.push(`${i.kind}:${i.slug} → ${i.blockedLocales.join(", ")}`);
    blockedSummary = parts.join(" · ");
  }

  return { ok, sourceLocale: source, messageIssues, faqIssue, itemIssues, blockedSummary };
}