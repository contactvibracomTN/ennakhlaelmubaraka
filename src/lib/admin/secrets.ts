/**
 * Admin secrets bootstrap.
 *
 * Real values come from `.env.local` (ADMIN_PASSWORD / ADMIN_SECRET /
 * GOOGLE_TRANSLATE_API_KEY / ADMIN_SOURCE_LOCALE). When a value is missing we
 * AUTO-GENERATE it and store it in `.admin/` (git-ignored) so the panel works
 * out of the box on the shop machine. The generated password is surfaced once
 * on the login page ("first run" mode).
 */
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { passwordFile, secretFile, secretsDir } from "./paths";

export interface PasswordResult {
  password: string;
  /** true when it was just generated (show it to the admin on first run). */
  generated: boolean;
}

export function getAdminPassword(): PasswordResult {
  const env = process.env.ADMIN_PASSWORD?.trim();
  if (env) return { password: env, generated: false };
  mkdirSync(secretsDir(), { recursive: true });
  if (existsSync(passwordFile())) {
    return { password: readFileSync(passwordFile(), "utf8").trim(), generated: false };
  }
  const generated = randomBytes(9).toString("base64url"); // 12 chars, URL-safe
  writeFileSync(passwordFile(), generated, "utf8");
  return { password: generated, generated: true };
}

export function getAdminSecret(): string {
  const env = process.env.ADMIN_SECRET?.trim();
  if (env) return env;
  mkdirSync(secretsDir(), { recursive: true });
  if (existsSync(secretFile())) return readFileSync(secretFile(), "utf8").trim();
  const generated = randomBytes(24).toString("hex");
  writeFileSync(secretFile(), generated, "utf8");
  return generated;
}

/** Google Cloud Translation API key (empty = auto-translate disabled). */
export function getTranslateApiKey(): string {
  return process.env.GOOGLE_TRANSLATE_API_KEY?.trim() ?? "";
}

/** The locale used as the authoring/translation source. */
export function getSourceLocale(): string {
  return process.env.ADMIN_SOURCE_LOCALE?.trim() || "ar";
}