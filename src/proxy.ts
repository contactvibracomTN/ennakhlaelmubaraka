import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Proxy (Next.js 16 — replaces `middleware`).
 * - Redirects `/` and non-localized paths to the best locale (`/ar` by default,
 *   respecting the `Accept-Language` header when available).
 * - Keeps `/api/*`, static assets and metadata routes out of locale handling.
 */
export default createMiddleware(routing);

export const config = {
  // `admin` is excluded on purpose: the /admin panel lives OUTSIDE the
  // locale-prefixed site (French-only tool, never localized/indexed).
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
