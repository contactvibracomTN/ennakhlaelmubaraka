import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin/auth";
import { countPendingTestimonials } from "@/lib/testimonials/store";
import { logoutAction } from "./actions";
import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin shell — French-only, LTR, outside next-intl ([locale] tree).
 * Pages gate themselves with `guardAdmin()`; this layout only renders the
 * navigation for authenticated admins (so /admin/login stays usable).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  const pendingTestimonials = admin ? await countPendingTestimonials() : 0;

  const nav = [
    { href: "/admin", label: "Accueil" },
    { href: "/admin/dates", label: "Dattes" },
    { href: "/admin/gifts", label: "Cadeaux" },
    { href: "/admin/categories", label: "Catégories" },
    { href: "/admin/posts", label: "Articles" },
    {
      href: "/admin/testimonials",
      label: pendingTestimonials > 0 ? `Témoignages (${pendingTestimonials})` : "Témoignages",
    },
    { href: "/admin/guide", label: "Guide des dattes" },
    { href: "/admin/faq", label: "FAQ" },
    { href: "/admin/copy", label: "Textes" },
    { href: "/admin/images", label: "Images" },
    { href: "/admin/deploy", label: "Déploiement" },
    { href: "/admin/backups", label: "Sauvegardes" },
    { href: "/admin/log", label: "Journal" },
    { href: "/admin/help", label: "Aide" },
  ];

  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-dvh bg-stone-100 text-neutral-900 antialiased">
        {admin ? (
          <header className="sticky top-0 z-20 border-b border-emerald-900/20 bg-emerald-950 text-white shadow-sm">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
              <Link href="/admin" className="text-sm font-bold tracking-wide">
                🌴 <span className="uppercase">Panneau Nakhla</span>
              </Link>
              <nav className="flex flex-1 flex-wrap items-center gap-1 text-[13px]">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-md px-2 py-1 text-emerald-100/90 transition hover:bg-emerald-900 hover:text-white"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-2">
                <a
                  href="/ar"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-emerald-500/60 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-900"
                >
                  Voir le site ↗
                </a>
                <form action={logoutAction}>
                  <button className="rounded-md bg-red-800/80 px-2 py-1 text-xs text-white hover:bg-red-700">
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          </header>
        ) : null}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}