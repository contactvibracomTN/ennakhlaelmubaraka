/**
 * Environment detection (Next.js 16 — `process.env` is inlined at build time).
 * Centralised so components never touch `process.env` directly.
 */

const isServer = typeof window === "undefined";

/** True when running `next build` / `next start` (production). */
export const isProduction = process.env.NODE_ENV === "production";

/** True during `next dev`. */
export const isDevelopment = process.env.NODE_ENV === "development";

/** True in `next build` (static generation / server only). */
export const isServerSide = isServer;

/** Verbatim Site URL from `next.config`-independent env (fallback: site.config). */
export function getSiteUrlFromEnv(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}
