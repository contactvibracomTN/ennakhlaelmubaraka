/**
 * Server-only: reliable project paths for the /admin panel.
 * The panel runs under `next start` so `process.cwd()` is normally the
 * project root; a hard fallback protects against being launched from an
 * unexpected working directory.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const FALLBACK_ROOT = "C:\\Users\\BY 4\\Desktop\\nakhla-v3";

export function projectRoot(): string {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "package.json")) && existsSync(join(cwd, "src", "messages"))) {
    return cwd;
  }
  return FALLBACK_ROOT;
}

export const contentDir = () => join(projectRoot(), "src", "lib", "data", "content");
export const datesFile = () => join(contentDir(), "dates.json");
export const giftsFile = () => join(contentDir(), "gifts.json");
export const postsFile = () => join(contentDir(), "posts.json");
export const guideFile = () => join(contentDir(), "guide.json");
export const categoriesFile = () => join(contentDir(), "categories.json");
export const testimonialsFile = () => join(contentDir(), "testimonials.json");

export const messagesDir = () => join(projectRoot(), "src", "messages");
export const messagesFile = (locale: string) => join(messagesDir(), `${locale}.json`);

export const adminDir = () => join(projectRoot(), "src", "lib", "admin");
export const stateFile = () => join(adminDir(), "state.json");

export const secretsDir = () => join(projectRoot(), ".admin");
export const passwordFile = () => join(secretsDir(), "password");
export const secretFile = () => join(secretsDir(), "secret");

export const backupDir = () => join(projectRoot(), ".backup");
export const logsDir = () => join(projectRoot(), "logs");
export const auditFile = () => join(logsDir(), "admin-audit.jsonl");
export const deployStatusFile = () => join(logsDir(), "deploy.status.json");
export const deployLogFile = () => join(logsDir(), "deploy.log");

export const deployScript = () => join(projectRoot(), "scripts", "deploy", "run-deploy.mjs");

export const uploadsDir = () => join(projectRoot(), "public", "images", "uploads");
export const datesImagesDir = () => join(projectRoot(), "public", "images", "dates");
export const giftsImagesDir = () => join(projectRoot(), "public", "images", "gifts");
export const blogImagesDir = () => join(projectRoot(), "public", "images", "blog");

export const PUBLIC_IMAGE_ROOTS = ["/images/dates", "/images/gifts", "/images/blog", "/images/uploads"];