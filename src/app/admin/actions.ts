"use server";

/**
 * Server actions for the /admin panel (Next.js 16 — cookies() is async).
 * Every mutation is buffered by backups (store) and recorded in the audit log.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ADMIN_COOKIE, createSessionToken, verifySessionToken } from "@/lib/admin/auth";
import { getAdminPassword } from "@/lib/admin/secrets";
import { audit } from "@/lib/admin/audit";
import {
  readDates,
  saveDates,
  readGifts,
  saveGifts,
  readPosts,
  savePosts,
  readGuide,
  saveGuide,
  readMessages,
  saveMessages,
  readCategoriesData,
  saveCategoriesData,
  snapshotAll,
  restoreBackupFiles,
} from "@/lib/admin/store";
import { uploadsDir } from "@/lib/admin/paths";
import {
  ensureItemState,
  setItemLocaleState,
  deleteItemState,
  itemKey,
  readAdminState,
  saveAdminState,
  type ContentKind,
  type ItemLocaleStatus,
} from "@/lib/admin/state";
import { validateDateProduct, validateGiftProduct, validateBlogPost, validateGuideVariety } from "@/lib/data/content-schema";
import {
  collectLocalizable,
  getConfiguredSourceLocale,
  setAtPath,
  translateTextsWithGlossary,
  resetGlossaryCache,
  type JsonDoc,
} from "@/lib/admin/translate";
import { startDeploy, isDeployRunning } from "@/lib/admin/deploy";
import { checkCompleteness } from "@/lib/admin/completeness";
import { getAtPath, setAtPath as setPathInTree } from "@/lib/utils/path";
import { ADMIN_LOCALES as SAFE_LOCALES, type AnyLocalized, type LocalizedRecord } from "@/lib/admin/shared";
import type { DateCategoryInfo, GiftCategoryInfo } from "@/types/product";

/* ------------------------------------------------------------------ */
/* guards + helpers                                                   */
/* ------------------------------------------------------------------ */

async function requireAdmin(): Promise<void> {
  const store = await cookies();
  if (!verifySessionToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }
}

function isLocalizedRecord(x: unknown): x is LocalizedRecord {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function presentLocales(name: unknown): string[] {
  if (!isLocalizedRecord(name)) return [];
  return (SAFE_LOCALES as readonly string[]).filter((l) => typeof name[l] === "string" && name[l].length > 0);
}

function upsert<T extends { slug: string }>(list: T[], oldSlug: string, item: T): T[] {
  let idx = list.findIndex((p) => p.slug === oldSlug);
  if (idx < 0) idx = list.findIndex((p) => p.slug === item.slug);
  if (idx < 0) return [...list, item];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

/* ------------------------------------------------------------------ */
/* auth                                                               */
/* ------------------------------------------------------------------ */

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const { password } = getAdminPassword();
  const attempt = String(formData.get("password") ?? "");
  if (attempt !== password) {
    audit("inconnu", "login-fail", "session");
    return { error: "Mot de passe incorrect." };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  audit("admin", "login", "session");
  redirect("/admin");
  return {};
}

export async function logoutAction(): Promise<never> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* items (dates / gifts / posts)                                      */
/* ------------------------------------------------------------------ */

async function saveItem(kind: ContentKind, oldSlug: string, rawItem: unknown): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    if (kind === "date") {
      const item = validateDateProduct(rawItem);
      saveDates(upsert(readDates(), oldSlug, item));
      ensureItemState(kind, item.slug, presentLocales(item.name), []);
    } else if (kind === "gift") {
      const item = validateGiftProduct(rawItem);
      saveGifts(upsert(readGifts(), oldSlug, item));
      ensureItemState(kind, item.slug, presentLocales(item.name), []);
    } else if (kind === "post") {
      const item = validateBlogPost(rawItem);
      savePosts(upsert(readPosts(), oldSlug, item));
      ensureItemState(kind, item.slug, presentLocales(item.title), []);
    } else {
      const item = validateGuideVariety(rawItem);
      saveGuide(upsert(readGuide(), oldSlug, item));
      ensureItemState(kind, item.slug, presentLocales(item.title), []);
    }

    resetGlossaryCache();
    audit("admin", "save", `${kind}:${oldSlug || "(nouveau)"}`, { oldSlug });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Données invalides.";
    return { ok: false, message };
  }
}

export async function saveDateAction(oldSlug: string, item: unknown): Promise<{ ok: boolean; message?: string }> {
  return saveItem("date", oldSlug, item);
}
export async function saveGiftAction(oldSlug: string, item: unknown): Promise<{ ok: boolean; message?: string }> {
  return saveItem("gift", oldSlug, item);
}
export async function savePostAction(oldSlug: string, item: unknown): Promise<{ ok: boolean; message?: string }> {
  return saveItem("post", oldSlug, item);
}
export async function saveGuideAction(oldSlug: string, item: unknown): Promise<{ ok: boolean; message?: string }> {
  return saveItem("guide", oldSlug, item);
}

export async function deleteItemAction(kind: ContentKind, slug: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    if (kind === "date") saveDates(readDates().filter((p) => p.slug !== slug));
    else if (kind === "gift") saveGifts(readGifts().filter((p) => p.slug !== slug));
    else if (kind === "post") savePosts(readPosts().filter((p) => p.slug !== slug));
    else saveGuide(readGuide().filter((p) => p.slug !== slug));
    deleteItemState(kind, slug);
    audit("admin", "delete", `${kind}:${slug}`);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur lors de la suppression." };
  }
}

export async function setItemLocaleAction(
  kind: ContentKind,
  slug: string,
  locale: string,
  status: ItemLocaleStatus,
  by: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    setItemLocaleState(kind, slug, locale, status, by || "admin");
    audit("admin", "validate-locale", `${kind}:${slug}`, { locale, status, by });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export type TranslateResult = { ok: boolean; translatedLocales: string[]; errors: string[]; item?: unknown };

export async function translateItemAction(kind: ContentKind, slug: string, item: unknown): Promise<TranslateResult> {
  await requireAdmin();
  const doc = item as JsonDoc;
  const source = getConfiguredSourceLocale();
  const refs = collectLocalizable(doc);
  const targets = (SAFE_LOCALES as readonly string[]).filter((l) => l !== source);
  const errors: string[] = [];
  const translatedLocales: string[] = [];

  for (const target of targets) {
    const pairs = refs
      .map((r, idx) => ({ idx, src: r.record[source]?.trim() ?? "" }))
      .filter((p) => p.src.length > 0);
    if (pairs.length === 0) continue;
    try {
      const tr = await translateTextsWithGlossary(
        pairs.map((p) => p.src),
        target,
        source,
      );
      for (let k = 0; k < pairs.length; k++) {
        const ref = refs[pairs[k].idx];
        // Mutate the collected record itself, then re-attach it: each target
        // must build on the previous ones (a fresh spread from the original
        // record would silently drop the targets translated before it).
        ref.record[target] = tr[k] ?? "";
        setAtPath(doc, ref.path, ref.record);
      }
      translatedLocales.push(target);
    } catch (err) {
      errors.push(`${target}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // persist the translated document + machine flags
  const saved = await saveItem(kind, slug, doc);
  if (!saved.ok) {
    return { ok: false, translatedLocales: [], errors: [saved.message ?? "Sauvegarde impossible"].concat(errors) };
  }
  for (const loc of translatedLocales) {
    setItemLocaleState(kind, slug, loc, "machine", "traduction Google");
  }
  audit("admin", "translate", `${kind}:${slug}`, { translatedLocales, errors });
  revalidatePath("/admin", "layout");
  return { ok: errors.length === 0, translatedLocales, errors, item: doc };
}

/* ------------------------------------------------------------------ */
/* categories                                                         */
/* ------------------------------------------------------------------ */

async function validateCategoryList(raw: unknown): Promise<{ dates?: DateCategoryInfo[]; gifts?: GiftCategoryInfo[] } | null> {
  if (!Array.isArray(raw)) return null;
  const ok = raw.every(
    (c) =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as { slug?: unknown }).slug === "string" &&
      isLocalizedRecord((c as { name?: unknown }).name),
  );
  return ok ? {} : null;
}

export async function saveDateCategoriesAction(raw: unknown): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const guard = await validateCategoryList(raw);
  if (!guard) return { ok: false, message: "Liste de catégories invalide." };
  try {
    const data = readCategoriesData();
    data.dates = raw as DateCategoryInfo[];
    saveCategoriesData(data);
    audit("admin", "save", "categories:dates");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export async function saveGiftCategoriesAction(raw: unknown): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const guard = await validateCategoryList(raw);
  if (!guard) return { ok: false, message: "Liste de catégories invalide." };
  try {
    const data = readCategoriesData();
    data.gifts = raw as GiftCategoryInfo[];
    saveCategoriesData(data);
    audit("admin", "save", "categories:gifts");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

/* ------------------------------------------------------------------ */
/* FAQ (messages.faq.items per locale)                                */
/* ------------------------------------------------------------------ */

export async function saveFaqAction(itemsByLocale: Record<string, Array<{ q: string; a: string }>>): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    for (const locale of SAFE_LOCALES) {
      const list = itemsByLocale[locale];
      if (!Array.isArray(list)) continue;
      const messages = readMessages(locale);
      setPathInTree(messages, "faq.items", list);
      saveMessages(locale, messages);
    }
    audit("admin", "save", "faq");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export async function translateFaqAction(): Promise<TranslateResult> {
  await requireAdmin();
  const source = getConfiguredSourceLocale();
  const srcItems = getAtPath(readMessages(source), "faq.items") as Array<{ q: string; a: string }> | null;
  if (!Array.isArray(srcItems) || srcItems.length === 0) return { ok: false, translatedLocales: [], errors: ["Aucun item FAQ en langue source."] };
  const errors: string[] = [];
  const translatedLocales: string[] = [];
  for (const target of (SAFE_LOCALES as readonly string[]).filter((l) => l !== source)) {
    try {
      const qs = srcItems.map((i) => i.q);
      const as = srcItems.map((i) => i.a);
      const [tq, ta] = await Promise.all([
        translateTextsWithGlossary(qs, target, source),
        translateTextsWithGlossary(as, target, source),
      ]);
      const items = srcItems.map((_, idx) => ({ q: tq[idx] ?? "", a: ta[idx] ?? "" }));
      const messages = readMessages(target);
      setPathInTree(messages, "faq.items", items);
      saveMessages(target, messages);
      translatedLocales.push(target);
    } catch (err) {
      errors.push(`${target}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  audit("admin", "translate", "faq", { translatedLocales, errors });
  revalidatePath("/admin", "layout");
  return { ok: errors.length === 0, translatedLocales, errors };
}

/* ------------------------------------------------------------------ */
/* copy (message leaves)                                              */
/* ------------------------------------------------------------------ */

export async function saveCopyKeysAction(changes: Array<{ path: string; locale: string; value: string }>): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    for (const locale of SAFE_LOCALES) {
      const scoped = changes.filter((c) => c.locale === locale);
      if (scoped.length === 0) continue;
      const messages = readMessages(locale);
      for (const c of scoped) setPathInTree(messages, c.path, c.value);
      saveMessages(locale, messages);
    }
    audit("admin", "save", `copy:${changes.length} clés`);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export async function saveCopySectionAction(locale: string, section: string, jsonText: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    const parsed: unknown = JSON.parse(jsonText);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, message: "Le contenu doit être un objet JSON." };
    }
    const messages = readMessages(locale);
    messages[section] = parsed;
    saveMessages(locale, messages);
    audit("admin", "save", `copy:${locale}.${section} (console JSON)`);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: `JSON invalide : ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function translateCopySectionAction(section: string): Promise<TranslateResult> {
  await requireAdmin();
  if (section === "faq") return translateFaqAction();
  const source = getConfiguredSourceLocale();
  const srcMessages = readMessages(source);
  const sectionNode = getAtPath(srcMessages, section);
  if (typeof sectionNode !== "object" || sectionNode === null) {
    return { ok: false, translatedLocales: [], errors: [`Section « ${section} » introuvable en ${source}.`] };
  }
  const leaves = collectTranslateLeaves(sectionNode as Record<string, unknown>, "").filter((l) => l.path);
  const errors: string[] = [];
  const translatedLocales: string[] = [];
  for (const target of (SAFE_LOCALES as readonly string[]).filter((l) => l !== source)) {
    try {
      const textToTranslate = leaves.filter((l) => l.value.trim().length > 0).map((l) => l.value);
      if (textToTranslate.length === 0) continue;
      const tr = await translateTextsWithGlossary(textToTranslate, target, source);
      const targetMessages = readMessages(target);
      let k = 0;
      for (const leaf of leaves) {
        if (leaf.value.trim().length === 0) continue;
        setPathInTree(targetMessages, `${section}.${leaf.path}`, tr[k++] ?? "");
      }
      saveMessages(target, targetMessages);
      translatedLocales.push(target);
    } catch (err) {
      errors.push(`${target}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  audit("admin", "translate", `copy:${section}`, { translatedLocales, errors });
  revalidatePath("/admin", "layout");
  return { ok: errors.length === 0, translatedLocales, errors };
}

function collectTranslateLeaves(node: Record<string, unknown>, prefix: string): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = [];
  for (const [k, v] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push({ path: p, value: v });
    else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out.push(...collectTranslateLeaves(v as Record<string, unknown>, p));
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* images                                                             */
/* ------------------------------------------------------------------ */

export async function uploadImageAction(formData: FormData): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Aucun fichier sélectionné." };
  const MAX = 10 * 1024 * 1024;
  if (file.size > MAX) return { ok: false, error: "Image trop lourde (10 Mo max)." };
  try {
    const clean = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
    const extMatch = /\.(jpe?g|png|webp|gif|svg)$/i.exec(clean);
    const ext = extMatch ? extMatch[1] : "jpg";
    const base = clean.replace(/\.(jpe?g|png|webp|gif|svg)$/i, "").slice(0, 60) || "image";
    const name = `${Date.now()}-${base}.${ext}`;
    mkdirSync(uploadsDir(), { recursive: true });
    writeFileSync(join(uploadsDir(), name), Buffer.from(await file.arrayBuffer()));
    const publicPath = `/images/uploads/${name}`;
    audit("admin", "upload", publicPath, { bytes: file.size });
    revalidatePath("/admin", "layout");
    return { ok: true, path: publicPath };
  } catch (err) {
    const code = err && typeof err === "object" ? (err as { code?: string }).code : "";
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      return {
        ok: false,
        error:
          "Upload impossible : environnement en lecture seule (ex. Vercel). Ajoute l'image en local dans public/images/, commit + push, puis sélectionne-la depuis l'admin.",
      };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Erreur lors de l'upload." };
  }
}

/* ------------------------------------------------------------------ */
/* deploy + backups                                                   */
/* ------------------------------------------------------------------ */

export async function startDeployAction(force = false): Promise<{ ok: boolean; message?: string; report?: ReturnType<typeof checkCompleteness> }> {
  await requireAdmin();
  const report = checkCompleteness();
  if (!report.ok && !force) {
    return { ok: false, message: "Complétude incomplète — déploiement bloqué.", report };
  }
  if (isDeployRunning()) return { ok: false, message: "Un déploiement est déjà en cours." };
  try {
    const backfill = snapshotAll("before-deploy");
    const res = startDeploy();
    audit("admin", "deploy-start", "site", { force, snapshot: backfill, reportOk: report.ok });
    return { ok: res.ok, message: res.message };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur lors du lancement du déploiement." };
  }
}

export async function restoreBackupAction(names: string[]): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!Array.isArray(names) || names.length === 0) return { ok: false, message: "Aucun fichier de sauvegarde sélectionné." };
  try {
    const n = restoreBackupFiles(names);
    audit("admin", "restore-backup", n.toString(), { names });
    revalidatePath("/admin", "layout");
    return { ok: n > 0, message: n > 0 ? `${n} fichier(s) restauré(s). Redéployez pour appliquer.` : "Aucun fichier restauré." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur lors de la restauration." };
  }
}

export async function resetItemLanguagesAction(kind: ContentKind, slug: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    const state = readAdminState();
    delete state.items[itemKey(kind, slug)];
    saveAdminState(state);
    audit("admin", "reset-languages", `${kind}:${slug}`);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export async function setSourceLocaleAction(locale: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!(SAFE_LOCALES as readonly string[]).includes(locale)) return { ok: false, message: "Locale invalide." };
  try {
    const state = readAdminState();
    state.sourceLocale = locale;
    saveAdminState(state);
    audit("admin", "set-source-locale", locale);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Erreur d'enregistrement." };
  }
}

export async function reindexStateAction(): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  try {
    const collections: Array<{
      kind: ContentKind;
      items: Array<{ slug: string; name?: AnyLocalized; title?: AnyLocalized }>;
    }> = [
      { kind: "date", items: readDates() },
      { kind: "gift", items: readGifts() },
      { kind: "post", items: readPosts() },
      { kind: "guide", items: readGuide() },
    ];
    for (const { kind, items } of collections) {
      for (const item of items) {
        const name = item.title ?? item.name;
        ensureItemState(kind, item.slug, name ? presentLocales(name) : [], []);
      }
    }
    audit("admin", "reindex-state", "all items");
    return { ok: true, message: "État de validation recalculé à partir du contenu existant." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}