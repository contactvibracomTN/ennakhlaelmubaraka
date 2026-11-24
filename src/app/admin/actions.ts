"use server";

/**
 * Server actions for the /admin panel (Next.js 16 — cookies() is async).
 * Every mutation is buffered by backups (store) and recorded in the audit log.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ADMIN_COOKIE,
  createSessionToken,
  verifySessionToken,
} from "@/lib/admin/auth";
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
import {
  deleteTestimonials,
  getTestimonialById,
  setTestimonialStatus,
  upsertTestimonial,
} from "@/lib/testimonials/store";
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
import {
  validateDateProduct,
  validateGiftProduct,
  validateBlogPost,
  validateGuideVariety,
  validateTestimonial,
} from "@/lib/data/content-schema";
import {
  isSupportedCountry,
  normalizeCountryCode,
} from "@/lib/config/countries";
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
import {
  isGithubMode,
  queueWrite,
  triggerDevDeploy,
  withGithubCommit,
} from "@/lib/admin/github-writes";
import {
  ADMIN_LOCALES as SAFE_LOCALES,
  type AnyLocalized,
  type LocalizedRecord,
} from "@/lib/admin/shared";
import type { DateCategoryInfo, GiftCategoryInfo } from "@/types/product";
import type {
  Testimonial,
  TestimonialAdminInput,
  TestimonialRating,
  TestimonialSource,
  TestimonialStatus,
} from "@/types/testimonial";

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
  return (SAFE_LOCALES as readonly string[]).filter(
    (l) => typeof name[l] === "string" && name[l].length > 0,
  );
}

/** URL-safe slug: keep ASCII words, drop diacritics, use `-` as separator. */
function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function localizedCandidate(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const locale of ["fr", "en", "ar", "tr", "ur", "ms", "bn", "id"]) {
    const text = record[locale];
    if (typeof text === "string" && slugify(text)) return text;
  }
  return "";
}

/**
 * A saved item always has a non-empty, unique slug. New items arrive from the
 * admin with `slug: ""`; deriving one here prevents every new item from
 * overwriting the previous one (all of them shared the same empty slug).
 */
function withSafeSlug<T extends { slug: string; id?: string }>(
  item: T,
  list: T[],
  fallback: string,
): T {
  const label =
    localizedCandidate((item as { name?: unknown }).name) ||
    localizedCandidate((item as { title?: unknown }).title);
  const base =
    slugify(item.slug) ||
    slugify(label) ||
    slugify(item.id ?? "") ||
    slugify(fallback) ||
    `item-${crypto.randomUUID().slice(0, 8)}`;
  let candidate = base;
  let suffix = 2;
  while (
    list.some(
      (p) => p.slug === candidate && !(item.id && p.id === item.id),
    )
  ) {
    candidate = `${base}-${suffix++}`;
  }
  return { ...item, slug: candidate };
}

function upsert<T extends { slug: string; id?: string }>(
  list: T[],
  oldSlug: string,
  item: T,
): T[] {
  let idx = -1;
  if (oldSlug) {
    idx = list.findIndex(
      (p) => p.slug === oldSlug || (!!p.id && p.id === oldSlug),
    );
  }
  if (idx < 0 && item.slug) idx = list.findIndex((p) => p.slug === item.slug);
  if (idx < 0 && item.id) idx = list.findIndex((p) => p.id === item.id);
  if (idx < 0) return [...list, item];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

/* ------------------------------------------------------------------ */
/* auth                                                               */
/* ------------------------------------------------------------------ */

export async function loginAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  if (
    isGithubMode() &&
    (!process.env.ADMIN_PASSWORD?.trim() || !process.env.ADMIN_SECRET?.trim())
  ) {
    return {
      error:
        "Configuration manquante : ADMIN_PASSWORD et ADMIN_SECRET doivent être définis dans Vercel.",
    };
  }
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

async function saveItem(
  kind: ContentKind,
  oldSlug: string,
  rawItem: unknown,
): Promise<{ ok: boolean; message?: string; slug?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      let savedSlug = "";
      if (kind === "date") {
        const list = readDates();
        const item = withSafeSlug(validateDateProduct(rawItem), list, oldSlug);
        savedSlug = item.slug;
        saveDates(upsert(list, oldSlug, item));
        ensureItemState(kind, item.slug, presentLocales(item.name), []);
      } else if (kind === "gift") {
        const list = readGifts();
        const item = withSafeSlug(validateGiftProduct(rawItem), list, oldSlug);
        savedSlug = item.slug;
        saveGifts(upsert(list, oldSlug, item));
        ensureItemState(kind, item.slug, presentLocales(item.name), []);
      } else if (kind === "post") {
        const list = readPosts();
        const item = withSafeSlug(validateBlogPost(rawItem), list, oldSlug);
        savedSlug = item.slug;
        savePosts(upsert(list, oldSlug, item));
        ensureItemState(kind, item.slug, presentLocales(item.title), []);
      } else {
        const list = readGuide();
        const item = withSafeSlug(validateGuideVariety(rawItem), list, oldSlug);
        savedSlug = item.slug;
        saveGuide(upsert(list, oldSlug, item));
        ensureItemState(kind, item.slug, presentLocales(item.title), []);
      }

      resetGlossaryCache();
      audit("admin", "save", `${kind}:${oldSlug || "(nouveau)"}`, { oldSlug });
      revalidatePath("/admin", "layout");
      return { ok: true, slug: savedSlug };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Données invalides.";
      return { ok: false, message };
    }
  });
}

export async function saveDateAction(
  oldSlug: string,
  item: unknown,
): Promise<{ ok: boolean; message?: string }> {
  return saveItem("date", oldSlug, item);
}
export async function saveGiftAction(
  oldSlug: string,
  item: unknown,
): Promise<{ ok: boolean; message?: string; slug?: string }> {
  return saveItem("gift", oldSlug, item);
}
export async function savePostAction(
  oldSlug: string,
  item: unknown,
): Promise<{ ok: boolean; message?: string }> {
  return saveItem("post", oldSlug, item);
}
export async function saveGuideAction(
  oldSlug: string,
  item: unknown,
): Promise<{ ok: boolean; message?: string }> {
  return saveItem("guide", oldSlug, item);
}

export async function deleteItemAction(
  kind: ContentKind,
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      if (kind === "date")
        saveDates(readDates().filter((p) => p.slug !== slug));
      else if (kind === "gift")
        saveGifts(readGifts().filter((p) => p.slug !== slug));
      else if (kind === "post")
        savePosts(readPosts().filter((p) => p.slug !== slug));
      else saveGuide(readGuide().filter((p) => p.slug !== slug));
      deleteItemState(kind, slug);
      audit("admin", "delete", `${kind}:${slug}`);
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur lors de la suppression.",
      };
    }
  });
}

export async function setItemLocaleAction(
  kind: ContentKind,
  slug: string,
  locale: string,
  status: ItemLocaleStatus,
  by: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      setItemLocaleState(kind, slug, locale, status, by || "admin");
      audit("admin", "validate-locale", `${kind}:${slug}`, {
        locale,
        status,
        by,
      });
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export type TranslateResult = {
  ok: boolean;
  translatedLocales: string[];
  errors: string[];
  item?: unknown;
};

export async function translateItemAction(
  kind: ContentKind,
  slug: string,
  item: unknown,
): Promise<TranslateResult> {
  await requireAdmin();
  return withGithubCommit(async () => {
    const doc = item as JsonDoc;
    const source = getConfiguredSourceLocale();
    const refs = collectLocalizable(doc);
    const targets = (SAFE_LOCALES as readonly string[]).filter(
      (l) => l !== source,
    );
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
        errors.push(
          `${target}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // persist the translated document + machine flags
    const saved = await saveItem(kind, slug, doc);
    if (!saved.ok) {
      return {
        ok: false,
        translatedLocales: [],
        errors: [saved.message ?? "Sauvegarde impossible"].concat(errors),
      };
    }
    const savedSlug = saved.slug ?? slug;
    (doc as { slug?: string }).slug = savedSlug;
    for (const loc of translatedLocales) {
      setItemLocaleState(kind, savedSlug, loc, "machine", "traduction Google");
    }
    audit("admin", "translate", `${kind}:${savedSlug}`, {
      translatedLocales,
      errors,
    });
    revalidatePath("/admin", "layout");
    return { ok: errors.length === 0, translatedLocales, errors, item: doc };
  });
}

/* ------------------------------------------------------------------ */
/* categories                                                         */
/* ------------------------------------------------------------------ */

async function validateCategoryList(
  raw: unknown,
): Promise<{ dates?: DateCategoryInfo[]; gifts?: GiftCategoryInfo[] } | null> {
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

export async function saveDateCategoriesAction(
  raw: unknown,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const guard = await validateCategoryList(raw);
  if (!guard) return { ok: false, message: "Liste de catégories invalide." };
  return withGithubCommit(async () => {
    try {
      const data = readCategoriesData();
      data.dates = raw as DateCategoryInfo[];
      saveCategoriesData(data);
      audit("admin", "save", "categories:dates");
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export async function saveGiftCategoriesAction(
  raw: unknown,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const guard = await validateCategoryList(raw);
  if (!guard) return { ok: false, message: "Liste de catégories invalide." };
  return withGithubCommit(async () => {
    try {
      const data = readCategoriesData();
      data.gifts = raw as GiftCategoryInfo[];
      saveCategoriesData(data);
      audit("admin", "save", "categories:gifts");
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

/* ------------------------------------------------------------------ */
/* FAQ (messages.faq.items per locale)                                */
/* ------------------------------------------------------------------ */

export async function saveFaqAction(
  itemsByLocale: Record<string, Array<{ q: string; a: string }>>,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
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
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export async function translateFaqAction(): Promise<TranslateResult> {
  await requireAdmin();
  return withGithubCommit(async () => {
    const source = getConfiguredSourceLocale();
    const srcItems = getAtPath(readMessages(source), "faq.items") as Array<{
      q: string;
      a: string;
    }> | null;
    if (!Array.isArray(srcItems) || srcItems.length === 0)
      return {
        ok: false,
        translatedLocales: [],
        errors: ["Aucun item FAQ en langue source."],
      };
    const errors: string[] = [];
    const translatedLocales: string[] = [];
    for (const target of (SAFE_LOCALES as readonly string[]).filter(
      (l) => l !== source,
    )) {
      try {
        const qs = srcItems.map((i) => i.q);
        const as = srcItems.map((i) => i.a);
        const [tq, ta] = await Promise.all([
          translateTextsWithGlossary(qs, target, source),
          translateTextsWithGlossary(as, target, source),
        ]);
        const items = srcItems.map((_, idx) => ({
          q: tq[idx] ?? "",
          a: ta[idx] ?? "",
        }));
        const messages = readMessages(target);
        setPathInTree(messages, "faq.items", items);
        saveMessages(target, messages);
        translatedLocales.push(target);
      } catch (err) {
        errors.push(
          `${target}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    audit("admin", "translate", "faq", { translatedLocales, errors });
    revalidatePath("/admin", "layout");
    return { ok: errors.length === 0, translatedLocales, errors };
  });
}

/* ------------------------------------------------------------------ */
/* copy (message leaves)                                              */
/* ------------------------------------------------------------------ */

export async function saveCopyKeysAction(
  changes: Array<{ path: string; locale: string; value: string }>,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
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
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export async function saveCopySectionAction(
  locale: string,
  section: string,
  jsonText: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return { ok: false, message: "Le contenu doit être un objet JSON." };
      }
      const messages = readMessages(locale);
      messages[section] = parsed;
      saveMessages(locale, messages);
      audit("admin", "save", `copy:${locale}.${section} (console JSON)`);
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: `JSON invalide : ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  });
}

export async function translateCopySectionAction(
  section: string,
): Promise<TranslateResult> {
  await requireAdmin();
  if (section === "faq") return translateFaqAction();
  const source = getConfiguredSourceLocale();
  const srcMessages = readMessages(source);
  const sectionNode = getAtPath(srcMessages, section);
  if (typeof sectionNode !== "object" || sectionNode === null) {
    return {
      ok: false,
      translatedLocales: [],
      errors: [`Section « ${section} » introuvable en ${source}.`],
    };
  }
  return withGithubCommit(async () => {
    const leaves = collectTranslateLeaves(
      sectionNode as Record<string, unknown>,
      "",
    ).filter((l) => l.path);
    const errors: string[] = [];
    const translatedLocales: string[] = [];
    for (const target of (SAFE_LOCALES as readonly string[]).filter(
      (l) => l !== source,
    )) {
      try {
        const textToTranslate = leaves
          .filter((l) => l.value.trim().length > 0)
          .map((l) => l.value);
        if (textToTranslate.length === 0) continue;
        const tr = await translateTextsWithGlossary(
          textToTranslate,
          target,
          source,
        );
        const targetMessages = readMessages(target);
        let k = 0;
        for (const leaf of leaves) {
          if (leaf.value.trim().length === 0) continue;
          setPathInTree(
            targetMessages,
            `${section}.${leaf.path}`,
            tr[k++] ?? "",
          );
        }
        saveMessages(target, targetMessages);
        translatedLocales.push(target);
      } catch (err) {
        errors.push(
          `${target}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    audit("admin", "translate", `copy:${section}`, {
      translatedLocales,
      errors,
    });
    revalidatePath("/admin", "layout");
    return { ok: errors.length === 0, translatedLocales, errors };
  });
}

function collectTranslateLeaves(
  node: Record<string, unknown>,
  prefix: string,
): Array<{ path: string; value: string }> {
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

export async function uploadImageAction(
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Aucun fichier sélectionné." };
  const MAX = 10 * 1024 * 1024;
  if (file.size > MAX)
    return { ok: false, error: "Image trop lourde (10 Mo max)." };
  return withGithubCommit(async () => {
    try {
      const clean = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-");
      const extMatch = /\.(jpe?g|png|webp|gif|svg)$/i.exec(clean);
      if (!extMatch) {
        return {
          ok: false,
          error:
            "Format non pris en charge. Utilisez JPG, PNG, WebP, GIF ou SVG.",
        };
      }
      const ext = extMatch[1];
      const base =
        clean.replace(/\.(jpe?g|png|webp|gif|svg)$/i, "").slice(0, 60) ||
        "image";
      const name = `${Date.now()}-${base}.${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      if (isGithubMode()) {
        // Committed with the content change as one atomic commit on dev.
        queueWrite(
          join(uploadsDir(), name),
          bytes.toString("base64"),
          "base64",
        );
      } else {
        mkdirSync(uploadsDir(), { recursive: true });
        writeFileSync(join(uploadsDir(), name), bytes);
      }
      // Served by `src/app/media/uploads/[name]/route.ts`, which reads the file
      // from disk. `/images/uploads/...` would 404 until the next build because
      // `next start` only serves the public files known at build time.
      const publicPath = `/media/uploads/${name}`;
      audit("admin", "upload", publicPath, { bytes: file.size });
      revalidatePath("/admin", "layout");
      return { ok: true, path: publicPath };
    } catch (err) {
      const code =
        err && typeof err === "object" ? (err as { code?: string }).code : "";
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        return {
          ok: false,
          error:
            "Upload impossible : environnement en lecture seule et écriture GitHub non configurée. Définissez GITHUB_TOKEN et GITHUB_REPO dans Vercel.",
        };
      }
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erreur lors de l'upload.",
      };
    }
  });
}

/* ------------------------------------------------------------------ */
/* deploy + backups                                                   */
/* ------------------------------------------------------------------ */

export async function startDeployAction(
  force = false,
): Promise<{
  ok: boolean;
  message?: string;
  report?: ReturnType<typeof checkCompleteness>;
}> {
  await requireAdmin();
  const report = checkCompleteness();
  if (!report.ok && !force) {
    return {
      ok: false,
      message: "Complétude incomplète — déploiement bloqué.",
      report,
    };
  }
  if (isDeployRunning())
    return { ok: false, message: "Un déploiement est déjà en cours." };
  try {
    if (isGithubMode()) {
      // The dev commit was already created by each save. Vercel builds the
      // preview from it; the hook only forces a fresh preview deployment.
      const res = await triggerDevDeploy();
      audit("admin", "deploy-dev", "dev", {
        force,
        reportOk: report.ok,
        ok: res.ok,
      });
      return { ok: res.ok, message: res.message };
    }
    const backfill = snapshotAll("before-deploy");
    const res = startDeploy();
    audit("admin", "deploy-start", "site", {
      force,
      snapshot: backfill,
      reportOk: report.ok,
    });
    return { ok: res.ok, message: res.message };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Erreur lors du lancement du déploiement.",
    };
  }
}

export async function restoreBackupAction(
  names: string[],
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!Array.isArray(names) || names.length === 0)
    return { ok: false, message: "Aucun fichier de sauvegarde sélectionné." };
  return withGithubCommit(async () => {
    try {
      const n = restoreBackupFiles(names);
      audit("admin", "restore-backup", n.toString(), { names });
      revalidatePath("/admin", "layout");
      return {
        ok: n > 0,
        message:
          n > 0
            ? `${n} fichier(s) restauré(s). Redéployez pour appliquer.`
            : "Aucun fichier restauré.",
      };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Erreur lors de la restauration.",
      };
    }
  });
}

export async function resetItemLanguagesAction(
  kind: ContentKind,
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      const state = readAdminState();
      delete state.items[itemKey(kind, slug)];
      saveAdminState(state);
      audit("admin", "reset-languages", `${kind}:${slug}`);
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export async function setSourceLocaleAction(
  locale: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!(SAFE_LOCALES as readonly string[]).includes(locale))
    return { ok: false, message: "Locale invalide." };
  return withGithubCommit(async () => {
    try {
      const state = readAdminState();
      state.sourceLocale = locale;
      saveAdminState(state);
      audit("admin", "set-source-locale", locale);
      revalidatePath("/admin", "layout");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur d'enregistrement.",
      };
    }
  });
}

export async function reindexStateAction(): Promise<{
  ok: boolean;
  message?: string;
}> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      const collections: Array<{
        kind: ContentKind;
        items: Array<{
          slug: string;
          name?: AnyLocalized;
          title?: AnyLocalized;
        }>;
      }> = [
        { kind: "date", items: readDates() },
        { kind: "gift", items: readGifts() },
        { kind: "post", items: readPosts() },
        { kind: "guide", items: readGuide() },
      ];
      for (const { kind, items } of collections) {
        for (const item of items) {
          const name = item.title ?? item.name;
          ensureItemState(
            kind,
            item.slug,
            name ? presentLocales(name) : [],
            [],
          );
        }
      }
      audit("admin", "reindex-state", "all items");
      return {
        ok: true,
        message: "État de validation recalculé à partir du contenu existant.",
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  });
}

/* ------------------------------------------------------------------ */
/* testimonials                                                       */
/* ------------------------------------------------------------------ */

function cleanPublishedText(
  raw: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!raw) return undefined;
  const out: Record<string, string> = {};
  for (const [locale, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim().length > 0)
      out[locale] = value.trim();
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function clampRating(value: number): TestimonialRating {
  const rounded = Math.round(Number(value));
  if (!Number.isFinite(rounded) || rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded as TestimonialRating;
}

/**
 * Create or update a testimonial from the admin editor. Used both for
 * moderation edits and for manually entering an in-store customer's review.
 */
export async function saveTestimonialAction(
  input: TestimonialAdminInput,
): Promise<{ ok: boolean; message?: string; id?: string }> {
  await requireAdmin();
  return withGithubCommit(async () => {
    try {
      const existing = input.id ? await getTestimonialById(input.id) : null;
      const now = new Date().toISOString();
      const status: TestimonialStatus =
        input.status ?? existing?.status ?? "pending";
      const source: TestimonialSource =
        input.source ?? existing?.source ?? "in-store";

      const record: Testimonial = {
        id: existing?.id ?? randomUUID(),
        name: input.name.trim(),
        whatsapp: input.whatsapp.trim(),
        job: input.job?.trim() || undefined,
        nationality: input.nationality?.trim() || undefined,
        countryCode: isSupportedCountry(input.countryCode)
          ? normalizeCountryCode(input.countryCode)
          : undefined,
        message: input.message.trim(),
        rating: clampRating(input.rating),
        locale: input.locale || existing?.locale || "ar",
        status,
        source,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        publishedAt:
          status === "published"
            ? (existing?.publishedAt ?? now)
            : existing?.publishedAt,
        publishedText: cleanPublishedText(input.publishedText),
        adminNote: input.adminNote?.trim() || undefined,
        order:
          typeof input.order === "number" && Number.isFinite(input.order)
            ? input.order
            : existing?.order,
      };

      const validated = validateTestimonial(record);
      await upsertTestimonial(validated);

      audit(
        "admin",
        existing ? "testimonial-update" : "testimonial-create",
        validated.id,
      );
      revalidatePath("/admin", "layout");
      revalidatePath("/", "layout");
      revalidatePath("/[locale]", "page");
      return { ok: true, id: validated.id };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Témoignage invalide.",
      };
    }
  });
}

/** Publish, unpublish (back to pending) or archive one or many records. */
export async function setTestimonialStatusAction(
  ids: string[],
  status: TestimonialStatus,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Aucun témoignage sélectionné." };
  }
  return withGithubCommit(async () => {
    try {
      await setTestimonialStatus(ids, status);
      audit("admin", `testimonial-${status}`, ids.join(","));
      revalidatePath("/admin", "layout");
      revalidatePath("/", "layout");
      revalidatePath("/[locale]", "page");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur lors de la mise à jour.",
      };
    }
  });
}

/** Delete one or many records (irreversible; backups are kept by the store). */
export async function deleteTestimonialsAction(
  ids: string[],
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Aucun témoignage sélectionné." };
  }
  return withGithubCommit(async () => {
    try {
      await deleteTestimonials(ids);
      audit("admin", "testimonial-delete", ids.join(","), {
        deleted: ids.length,
      });
      revalidatePath("/admin", "layout");
      revalidatePath("/", "layout");
      revalidatePath("/[locale]", "page");
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Erreur lors de la suppression.",
      };
    }
  });
}
