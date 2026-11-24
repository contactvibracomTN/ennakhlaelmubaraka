/**
 * GitHub-backed writes for the admin panel.
 *
 * On Vercel the filesystem is read-only, so the admin cannot write JSON/images
 * to disk. When GITHUB_TOKEN + GITHUB_REPO are set, every admin mutation is
 * buffered and flushed as ONE atomic commit on GITHUB_BRANCH (default: `dev`).
 * Vercel then builds the preview from that branch. Promotion to `main` stays a
 * manual git operation done by the shop owner.
 *
 * Without these env vars the panel keeps its original behaviour (local files),
 * so `npm run dev` works exactly as before.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { writeFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { projectRoot } from "./paths";

export type WriteEncoding = "utf-8" | "base64";

export interface PendingWrite {
  /** Repo-relative path, forward slashes (e.g. `src/lib/data/content/dates.json`). */
  path: string;
  content: string;
  encoding: WriteEncoding;
}

interface WriteContext {
  files: PendingWrite[];
  audit?: { action: string; target: string };
}

const context = new AsyncLocalStorage<WriteContext>();

/* ------------------------------------------------------------------ */
/* configuration                                                      */
/* ------------------------------------------------------------------ */

export function isGithubMode(): boolean {
  return Boolean(
    process.env.GITHUB_TOKEN?.trim() && process.env.GITHUB_REPO?.trim(),
  );
}

export function githubBranch(): string {
  return process.env.GITHUB_BRANCH?.trim() || "dev";
}

export function hasDevDeployHook(): boolean {
  return Boolean(process.env.VERCEL_DEPLOY_HOOK_URL_DEV?.trim());
}

function config(): { token: string; repo: string; api: string } {
  const token = process.env.GITHUB_TOKEN?.trim() ?? "";
  const repo = process.env.GITHUB_REPO?.trim() ?? "";
  if (!token || !repo) {
    throw new Error(
      " écriture GitHub non configurée (GITHUB_TOKEN / GITHUB_REPO absents).",
    );
  }
  return {
    token,
    repo,
    api: (
      process.env.GITHUB_API_URL?.trim() || "https://api.github.com"
    ).replace(/\/$/, ""),
  };
}

/* ------------------------------------------------------------------ */
/* per-action buffer                                                  */
/* ------------------------------------------------------------------ */

function repoPath(absolutePath: string): string {
  const rel = relative(projectRoot(), absolutePath).split(sep).join("/");
  if (!rel || rel.startsWith("..")) {
    throw new Error(
      `Chemin hors du projet, écriture refusée : ${absolutePath}`,
    );
  }
  return rel;
}

/**
 * Run a mutation with a fresh write buffer. Nested calls reuse the outer
 * buffer, so one admin action always produces exactly one commit.
 */
export async function withGithubCommit<T>(fn: () => Promise<T>): Promise<T> {
  if (context.getStore() || !isGithubMode()) return fn();

  const store: WriteContext = { files: [] };
  return context.run(store, async () => {
    const result = await fn();
    if (store.files.length > 0) {
      await commitFiles(store.files, store.audit);
    }
    return result;
  });
}

/** Queue a file write, or write it directly when GitHub mode is off. */
export function queueWrite(
  absolutePath: string,
  content: string,
  encoding: WriteEncoding = "utf-8",
): void {
  const store = context.getStore();
  if (!isGithubMode()) {
    writeFileSync(absolutePath, content, encoding);
    return;
  }
  if (!store) {
    // Fail loudly: silently writing to a read-only FS (or to nowhere) would
    // make the admin look successful while losing the change.
    throw new Error(
      "Écriture GitHub hors contexte d'action — réessayez depuis l'admin.",
    );
  }
  const path = repoPath(absolutePath);
  const entry: PendingWrite = { path, content, encoding };
  const existing = store.files.findIndex((f) => f.path === path);
  if (existing >= 0) store.files[existing] = entry;
  else store.files.push(entry);
}

/** Read-through: sees files written earlier in the SAME admin action. */
export function bufferedText(absolutePath: string): string | null {
  const store = context.getStore();
  if (!store || !isGithubMode()) return null;
  const path = repoPath(absolutePath);
  const found = store.files.find((f) => f.path === path);
  return found && found.encoding === "utf-8" ? found.content : null;
}

export function isBuffered(absolutePath: string): boolean {
  const store = context.getStore();
  if (!store || !isGithubMode()) return false;
  const path = repoPath(absolutePath);
  return store.files.some((f) => f.path === path);
}

/** Attach the audit label to the commit message without writing a log file. */
export function noteAudit(action: string, target: string): void {
  const store = context.getStore();
  if (store) store.audit = { action, target };
}

/* ------------------------------------------------------------------ */
/* GitHub Git Data API                                                */
/* ------------------------------------------------------------------ */

interface GithubRefResponse {
  object: { sha: string };
}
interface GithubCommitResponse {
  sha: string;
}
interface GithubTreeResponse {
  sha: string;
}
interface GithubBlobResponse {
  sha: string;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, api: base } = config();
  const res = await fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "nakhla-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    throw new Error(`GitHub API ${res.status} sur ${path} : ${detail}`);
  }
  return (await res.json()) as T;
}

function commitMessage(
  files: PendingWrite[],
  audit?: { action: string; target: string },
): string {
  const label = audit
    ? `${audit.action} — ${audit.target}`
    : `${files.length} fichier(s)`;
  const short = label.length > 140 ? `${label.slice(0, 137)}…` : label;
  return `admin: ${short}\n\nBranche: ${githubBranch()}\nFichiers: ${files.map((f) => f.path).join(", ")}`;
}

async function commitOnce(
  files: PendingWrite[],
  message: string,
): Promise<string> {
  const { repo } = config();
  const branch = githubBranch();
  const ref = await api<GithubRefResponse>(
    `/repos/${repo}/git/ref/heads/${branch}`,
  );
  const parentSha = ref.object.sha;

  const baseCommit = await api<{ tree: { sha: string } }>(
    `/repos/${repo}/git/commits/${parentSha}`,
  );

  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await api<GithubBlobResponse>(`/repos/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content:
            file.encoding === "base64"
              ? file.content
              : Buffer.from(file.content, "utf8").toString("base64"),
          encoding: "base64",
        }),
      });
      return { path: file.path, sha: blob.sha };
    }),
  );

  const tree = await api<GithubTreeResponse>(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: blobs.map((b) => ({
        path: b.path,
        mode: "100644",
        type: "blob",
        sha: b.sha,
      })),
    }),
  });

  const identity = {
    name: process.env.GIT_ADMIN_NAME?.trim() || "Nakhla Admin",
    email:
      process.env.GIT_ADMIN_EMAIL?.trim() || "admin@ennakhlaelmubaraka.com",
  };
  const commit = await api<GithubCommitResponse>(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [parentSha],
      author: identity,
      committer: identity,
    }),
  });

  await api(`/repos/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

/** One commit per admin action; retries once if another commit landed first. */
export async function commitFiles(
  files: PendingWrite[],
  audit?: { action: string; target: string },
): Promise<string> {
  const message = commitMessage(files, audit);
  try {
    return await commitOnce(files, message);
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    if (!/40[49]|422/.test(text)) throw err;
    // Concurrent save: refresh the ref and replay once.
    return commitOnce(files, message);
  }
}

export interface LastCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

export async function getLastCommit(): Promise<LastCommit | null> {
  if (!isGithubMode()) return null;
  const { repo } = config();
  type Entry = {
    sha: string;
    html_url: string;
    commit: { message: string; author: { date: string; name: string } };
  };
  const entries = await api<Entry[]>(
    `/repos/${repo}/commits?sha=${encodeURIComponent(githubBranch())}&per_page=1`,
  );
  const last = entries[0];
  if (!last) return null;
  return {
    sha: last.sha.slice(0, 7),
    message: last.commit.message.split("\n")[0] ?? "",
    date: last.commit.author.date,
    author: last.commit.author.name,
    url: last.html_url,
  };
}

/** Trigger the Vercel deploy hook bound to the dev branch. */
export async function triggerDevDeploy(): Promise<{
  ok: boolean;
  message: string;
}> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL_DEV?.trim();
  if (!hook) {
    return {
      ok: false,
      message:
        "Déploiement dev non déclenché : VERCEL_DEPLOY_HOOK_URL_DEV n'est pas configuré dans Vercel.",
    };
  }
  if (!hook.startsWith("https://")) {
    return {
      ok: false,
      message: "VERCEL_DEPLOY_HOOK_URL_DEV doit être une URL HTTPS.",
    };
  }
  try {
    const res = await fetch(hook, { method: "POST", cache: "no-store" });
    return res.ok
      ? {
          ok: true,
          message:
            "Déploiement de la preview dev lancé. Ouvrez le lien de preview pour vérifier.",
        }
      : { ok: false, message: `Hook Vercel : réponse ${res.status}.` };
  } catch (err) {
    return {
      ok: false,
      message: `Hook Vercel injoignable : ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export function devPreviewUrl(): string {
  return process.env.VERCEL_DEV_PREVIEW_URL?.trim() || "";
}
