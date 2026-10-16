import Link from "next/link";
import { guardAdmin } from "./guard";
import { readDates, readGifts, readPosts } from "@/lib/admin/store";
import { readAudit } from "@/lib/admin/audit";
import { checkCompleteness } from "@/lib/admin/completeness";
import { isTranslationConfigured, getConfiguredSourceLocale } from "@/lib/admin/translate";
import { readDeployStatus } from "@/lib/admin/deploy";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await guardAdmin();
  const dates = readDates();
  const gifts = readGifts();
  const posts = readPosts();
  const report = checkCompleteness();
  const audit = readAudit(12);
  const source = getConfiguredSourceLocale();
  const deploy = readDeployStatus();

  const cards = [
    { label: "Produits — dattes", count: dates.length, href: "/admin/dates" },
    { label: "Produits — cadeaux", count: gifts.length, href: "/admin/gifts" },
    { label: "Articles de blog", count: posts.length, href: "/admin/posts" },
    { label: "Langues", count: 8, href: "/admin/copy" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">Accueil</h1>
          <p className="text-sm text-neutral-500">
            Panneau de gestion du site — langue source : <b>{source.toUpperCase()}</b>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/deploy"
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              report.ok ? "bg-emerald-700 hover:bg-emerald-800" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {report.ok ? "▶ Tout est prêt — Déployer" : "⚠ Complétude incomplète — Voir"}
          </Link>
        </div>
      </div>

      {/* counts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
          >
            <p className="text-3xl font-bold text-emerald-800">{c.count}</p>
            <p className="mt-1 text-sm text-neutral-600">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* completeness */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
          État de complétude (blocage du déploiement)
        </h2>
        {report.ok ? (
          <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            ✓ Contenus complets — chaque élément actif a ses versions validées, les 8 fichiers de textes sont
            en phase.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ⚠ {report.blockedSummary || "Complétude incomplète."}
            </p>
            <details className="text-sm text-neutral-600">
              <summary className="cursor-pointer text-xs font-medium text-emerald-700">
                Détail des éléments bloquants ({report.itemIssues.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {report.itemIssues.map((i) => (
                  <li key={`${i.kind}:${i.slug}`}>
                    {i.kind} « {i.title.ar || i.slug} » → versions à valider ou manquantes :{" "}
                    {i.blockedLocales.map((b) => b.replace("machine:", "machine ").replace("missing:", "absent ")).join(", ")}
                  </li>
                ))}
                {report.messageIssues.map((m) => (
                  <li key={m.locale}>
                    Textes ({m.locale}) : {m.missingCount} clé(s) manquante(s) vs arabe
                  </li>
                ))}
                {!report.faqIssue.ok ? (
                  <li>FAQ : nombre d’items différent selon les langues {JSON.stringify(report.faqIssue.counts)}</li>
                ) : null}
              </ul>
            </details>
          </div>
        )}
        {!isTranslationConfigured() ? (
          <p className="mt-3 text-xs text-amber-700">
            ⚠️ Traduction automatique désactivée : renseignez <code>GOOGLE_TRANSLATE_API_KEY</code> dans
            <code> .env.local</code> puis redémarrez le serveur.
          </p>
        ) : (
          <p className="mt-3 text-xs text-emerald-700">✓ Traduction automatique Google Cloud configurée.</p>
        )}
      </section>

      {/* deploy status */}
      {deploy.phase !== "idle" ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Déploiement</h2>
          <p className="mt-1 text-sm">
            Phase : <b>{deploy.phase}</b>
            {deploy.phase === "done" ? " — ✅ terminé avec succès." : deploy.phase === "failed" ? " — ❌ échoué." : " — en cours…"}
          </p>
          <Link href="/admin/deploy" className="mt-1 inline-block text-xs text-emerald-700 underline">
            Suivre le déploiement →
          </Link>
        </section>
      ) : null}

      {/* recent audit */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Activité récente</h2>
          <Link href="/admin/log" className="text-xs text-emerald-700 underline">
            Journal complet →
          </Link>
        </div>
        {audit.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Aucune action enregistrée pour l’instant.</p>
        ) : (
          <ul className="mt-2 divide-y divide-neutral-100 text-sm">
            {audit.slice(0, 8).map((e, i) => (
              <li key={`${e.ts}-${i}`} className="flex gap-2 py-1.5">
                <span className="shrink-0 text-xs text-neutral-400">
                  {new Date(e.ts).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <span className="font-medium">{e.action}</span>
                <span className="truncate text-neutral-500">{e.target}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}