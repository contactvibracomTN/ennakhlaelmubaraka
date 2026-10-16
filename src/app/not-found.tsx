import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site.config";

/**
 * Global 404 for fully unmatched paths (no locale segment, no layout —
 * this page renders outside the `[locale]` tree). In-segment 404s
 * (unknown slugs, etc.) are handled by `[locale]/not-found.tsx`, which
 * keeps the header/footer. Bilingual by design since no locale context
 * exists at this level.
 *
 * It also renders outside BOTH root layouts, so no ancestor sets
 * `metadataBase`: without it Next resolves the app-root `opengraph-image`
 * file against `http://localhost:3000`, warns during the build, and ships
 * `og:image`/`twitter:image` URLs pointing at a dev server. The page itself
 * stays `noindex` (Next's default here); only the image URLs are fixed.
 *
 * The previous version offered only "home" in two languages, which left a
 * visitor who followed a stale link with nowhere to go. The catalogue routes
 * and the WhatsApp channel — the way this shop actually sells — are reachable
 * from here.
 *
 * The number is configured once and reused: the shop's WhatsApp line is a
 * business fact, not a per-locale string.
 */
export const metadata: Metadata = {
  ...(siteConfig.siteUrl
    ? { metadataBase: new URL(siteConfig.siteUrl) }
    : {}),
};

const WHATSAPP_NUMBER = "966596101097";

export default function NotFound() {
  const helpHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello, I could not find the page I was looking for.",
  )}`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-4 py-24 text-center">
      <p
        aria-hidden="true"
        className="font-display text-8xl font-bold text-gold-deep"
      >
        404
      </p>
      <h1 className="mt-6 font-arabic-display text-3xl font-bold text-forest">
        الصفحة غير موجودة
      </h1>
      <p className="mt-2 font-latin text-sm text-muted">Page not found</p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        عذرًا، لم نعثر على ما تبحث عنه. يمكنك العودة إلى الصفحة الرئيسية أو
        تصفّح التشكيلات مباشرة.
      </p>

      <nav aria-label="Browse the sections" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-2">
          {[
            { href: "/ar/dates", label: "التمور — Dates" },
            { href: "/ar/gifts", label: "الهدايا — Gifts" },
            { href: "/ar/guide", label: "دليل الأصناف — Guide" },
            { href: "/ar/contact", label: "تواصل معنا — Contact" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-block rounded-full border border-forest/30 px-4 py-2 text-sm font-semibold text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/ar"
          className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft"
        >
          الرئيسية — العربية
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-forest/30 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest/5"
        >
          Home — English
        </Link>
        <a
          href={helpHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-success px-6 py-3 text-sm font-semibold text-success transition-colors hover:bg-success/10"
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}
