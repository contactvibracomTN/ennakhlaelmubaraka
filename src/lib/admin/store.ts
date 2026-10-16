/**
 * Store — read/write for the JSON content layer with:
 *  - atomic writes (tmp + rename) so a crash never leaves a half-written file,
 *  - timestamped backups under `.backup/` before EVERY write (git-less rollback),
 *  - pruning so backups don't grow unbounded.
 *
 * These functions read the FILES on disk (the app pages read the same files,
 * baked at build time) — admin saves become visible after a deploy.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { DateProduct, GiftProduct, DateCategoryInfo, GiftCategoryInfo } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import {
  backupDir,
  categoriesFile,
  datesFile,
  giftsFile,
  messagesFile,
  postsFile,
  stateFile,
} from "./paths";

/* ------------------------------------------------------------------ */
/* low-level                                                          */
/* ------------------------------------------------------------------ */

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function mkdirFor(file: string): void {
  mkdirSync(file.slice(0, Math.max(file.lastIndexOf("/"), file.lastIndexOf("\\"))), { recursive: true });
}

/** Copy `file` into `.backup/<basename>-<ts>.json`, keep the newest 40 per basename. */
function backupFile(file: string): void {
  try {
    if (!existsSync(file)) return;
    const dir = backupDir();
    mkdirSync(dir, { recursive: true });
    const base = file.split(/[\\/]/).pop()?.replace(/\.json$/i, "") ?? "file";
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    copyFileSync(file, join(dir, `${base}-${ts}.json`));
    // prune
    const siblings = readdirSync(dir)
      .filter((f) => f.startsWith(`${base}-`) && f.endsWith(".json"))
      .sort();
    for (const old of siblings.slice(0, Math.max(0, siblings.length - 40))) {
      try {
        rmQuiet(join(dir, old));
      } catch {
        /* best effort */
      }
    }
  } catch {
    /* backups must never break a save */
  }
}

function rmQuiet(file: string): void {
  rmSync(file, { force: true });
}

/** Atomic writer: tmp + rename (keeps the previous file until replace). */
function atomicWrite(file: string, data: unknown): void {
  mkdirFor(file);
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  backupFile(file);
  renameSync(tmp, file);
}

/* ------------------------------------------------------------------ */
/* content files                                                      */
/* ------------------------------------------------------------------ */

export function readDates(): DateProduct[] {
  return readJson<DateProduct[]>(datesFile());
}
export function saveDates(products: DateProduct[]): void {
  atomicWrite(datesFile(), products);
}

export function readGifts(): GiftProduct[] {
  return readJson<GiftProduct[]>(giftsFile());
}
export function saveGifts(products: GiftProduct[]): void {
  atomicWrite(giftsFile(), products);
}

export function readPosts(): BlogPost[] {
  return readJson<BlogPost[]>(postsFile());
}
export function savePosts(posts: BlogPost[]): void {
  atomicWrite(postsFile(), posts);
}

export function readCategoriesData(): { dates: DateCategoryInfo[]; gifts: GiftCategoryInfo[] } {
  return readJson<{ dates: DateCategoryInfo[]; gifts: GiftCategoryInfo[] }>(categoriesFile());
}
export function saveCategoriesData(data: { dates: DateCategoryInfo[]; gifts: GiftCategoryInfo[] }): void {
  atomicWrite(categoriesFile(), data);
}

/* ------------------------------------------------------------------ */
/* messages (per locale)                                              */
/* ------------------------------------------------------------------ */

export const ADMIN_LOCALES: readonly string[] = ["ar", "en", "fr", "tr", "ur", "ms", "bn", "id"];

export function readMessages(locale: string): Record<string, unknown> {
  return readJson<Record<string, unknown>>(messagesFile(locale));
}

export function saveMessages(locale: string, data: Record<string, unknown>): void {
  atomicWrite(messagesFile(locale), data);
}

export function readAllMessages(): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const loc of ADMIN_LOCALES) {
    const file = messagesFile(loc);
    if (existsSync(file)) out[loc] = readJson<Record<string, unknown>>(file);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* admin state                                                        */
/* ------------------------------------------------------------------ */

export function readJsonFile<T>(file: string): T | null {
  try {
    if (!existsSync(file)) return null;
    return readJson<T>(file);
  } catch {
    return null;
  }
}

export function saveJsonFile(file: string, data: unknown): void {
  atomicWrite(file, data);
}

export function pathExists(file: string): boolean {
  return existsSync(file);
}

export function listBackupFiles(): string[] {
  const dir = backupDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .slice(0, 200);
}

export function restoreBackupFiles(names: string[]): number {
  let restored = 0;
  const dir = backupDir();
  for (const name of names) {
    const target = joinContentTarget(name);
    if (!target) continue;
    const src = join(dir, name);
    if (existsSync(src)) {
      copyFileSync(src, target);
      restored += 1;
    }
  }
  return restored;
}

/** Map a backup basename back to its source file. */
function joinContentTarget(name: string): string | null {
  // Snapshots live in subfolders (e.g. `deploy-2026-…Z/dates.json`) — map by
  // basename only, then strip the timestamp suffix added by atomicWrite.
  const bare = name.split(/[\\/]/).pop() ?? name;
  const base = bare
    .replace(/-\d{4}-\d{2}-\d{2}T[\d-]+Z?\.json$/i, "")
    .replace(/-\d{4}-\d{2}-\d{2}T[\d-]+$/i, "");
  switch (base) {
    case "dates":
    case "dates.json":
      return datesFile();
    case "gifts":
    case "gifts.json":
      return giftsFile();
    case "posts":
    case "posts.json":
      return postsFile();
    case "categories":
    case "categories.json":
      return categoriesFile();
    default:
      if (ADMIN_LOCALES.some((l) => base === l)) return messagesFile(base as string);
      return null;
  }
}

export function snapshotAll(prefix: string): string {
  const dir = backupDir();
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const folder = join(dir, `${prefix}-${stamp}`);
  mkdirSync(folder, { recursive: true });
  const sources = [datesFile(), giftsFile(), postsFile(), categoriesFile(), stateFile()].concat(
    ADMIN_LOCALES.map((l) => messagesFile(l)),
  );
  for (const src of sources) {
    if (existsSync(src)) {
      const name = src.split(/[\\/]/).pop();
      copyFileSync(src, join(folder, name ?? "unknown"));
    }
  }
  return folder;
}

export function fileSize(file: string): number {
  try {
    return statSync(file).size;
  } catch {
    return 0;
  }
}