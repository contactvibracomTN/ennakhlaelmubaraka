/**
 * Admin session — HMAC-signed cookie (no external dependency).
 * `cookies()` is async in Next.js 16 (per the framework docs).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminSecret } from "./secrets";

export const ADMIN_COOKIE = "__nakhla_admin";

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Issue a fresh signed session token. */
export function createSessionToken(): string {
  const payload = `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  return `${payload}.${sign(payload, getAdminSecret())}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(payload, getAdminSecret()));
  const actual = Buffer.from(parts[2] ?? "");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}