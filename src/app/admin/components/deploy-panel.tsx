"use client";

/** Deploy panel — local pipeline, or dev-branch publication when online. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startDeployAction } from "@/app/admin/actions";
import type { CompletenessReport } from "@/lib/admin/completeness";
import type { DeployStatus } from "@/lib/admin/deploy";
import type { LastCommit } from "@/lib/admin/github-writes";
import { Button, StatusBanner } from "./fields";

const RUNNING = ["starting", "check", "snapshot", "build", "restart"];

interface DeployPanelProps {
  report: CompletenessReport;
  initialStatus: DeployStatus;
  initialLog: string;
  githubMode?: boolean;
  branch?: string;
  lastCommit?: LastCommit | null;
  previewUrl?: string;
  hookReady?: boolean;
}

export function DeployPanel({
  report,
  initialStatus,
  initialLog,
  githubMode = false,
  branch = "dev",
  lastCommit = null,
  previewUrl = "",
  hookReady = true,
}: DeployPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [log, setLog] = useState(initialLog);
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const running = !githubMode && RUNNING.includes(status.phase);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/deploy-status", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: DeployStatus;
          log: string;
        };
        setStatus(data.status);
        setLog(data.log);
        if (!RUNNING.includes(data.status.phase)) router.refresh();
      } catch {
        /* server may be down mid-deploy — keep polling */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [running, router]);

  const deploy = async () => {
    setBanner(null);
    setBusy(true);
    try {
      const res = await startDeployAction(force);
      setBanner(
        res.ok
          ? {
              ok: true,
              message:
                res.message ??
                (githubMode ? "Preview lancée." : "Déploiement lancé."),
            }
          : { ok: false, message: res.message ?? "Lancement impossible." },
      );
      if (!githubMode) {
        const poll = await fetch("/api/admin/deploy-status", {
          cache: "no-store",
        });
        if (poll.ok) {
          const data = (await poll.json()) as {
            status: DeployStatus;
            log: string;
          };
          setStatus(data.status);
          setLog(data.log);
        }
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const gate = (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
        Porte de complétude{" "}
        {report.ok ? "— ✓ tout est validé" : "— ⚠ incomplète"}
      </h2>
      {report.ok ? (
        <p className="text-sm text-emerald-800">
          Chaque élément actif a ses versions validées et les 8 fichiers de
          textes sont en phase. Vous pouvez publier.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-amber-800">{report.blockedSummary}</p>
          <ul className="list-inside list-disc space-y-1 text-neutral-600">
            {report.itemIssues.map((i) => (
              <li key={`${i.kind}:${i.slug}`}>
                {i.kind} « {i.title.ar || i.slug} » →{" "}
                {i.blockedLocales.map((b) => b).join(", ")} (à valider ou à
                traduire)
              </li>
            ))}
            {report.messageIssues.map((m) => (
              <li key={m.locale}>
                Textes ({m.locale}) : {m.missingCount} clé(s) manquante(s) vs
                arabe — {m.keys.join(", ")}
              </li>
            ))}
            {!report.faqIssue.ok ? (
              <li>
                FAQ : comptes inégaux {JSON.stringify(report.faqIssue.counts)}
              </li>
            ) : null}
          </ul>
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
            />
            Forcer la publication malgré les blocages (action journalisée)
          </label>
        </div>
      )}
    </section>
  );

  if (githubMode) {
    return (
      <div className="space-y-5">
        {banner ? (
          <StatusBanner ok={banner.ok} message={banner.message} />
        ) : null}

        <section className="rounded-xl border border-emerald-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-900">
            Publication sur la branche <code>{branch}</code>
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Chaque « Enregistrer » crée déjà un commit sur <code>{branch}</code>
            . Ce bouton déclenche le déploiement de la preview Vercel pour que
            vous puissiez vérifier le rendu. La mise en production se fait
            ensuite à la main :{" "}
            <code>
              git checkout main &amp;&amp; git merge {branch} &amp;&amp; git
              push
            </code>
            .
          </p>
        </section>

        {gate}

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
            État de la preview
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <dt className="text-neutral-500">Branche :</dt>
              <dd className="font-mono font-semibold text-emerald-800">
                {branch}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-neutral-500">Dernier commit :</dt>
              <dd className="break-all">
                {lastCommit ? (
                  <a
                    className="text-emerald-700 underline"
                    href={lastCommit.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lastCommit.sha} — {lastCommit.message}
                  </a>
                ) : (
                  <span className="text-neutral-400">
                    Indisponible (vérifiez le token GitHub).
                  </span>
                )}
              </dd>
            </div>
            {previewUrl ? (
              <div className="flex flex-wrap gap-2">
                <dt className="text-neutral-500">Preview :</dt>
                <dd>
                  <a
                    className="text-emerald-700 underline"
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir la preview {branch}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {!hookReady ? (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ⚠️ <code>VERCEL_DEPLOY_HOOK_URL_DEV</code> n’est pas défini : le
              bouton affichera un avertissement. Les commits sur{" "}
              <code>{branch}</code> déclenchent déjà un déploiement Vercel si la
              branche est configurée dans le projet.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <Button
            kind="primary"
            busy={busy}
            disabled={busy}
            onClick={() => void deploy()}
          >
            {busy ? "Publication en cours…" : "▶ Déployer la preview dev"}
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
          État du déploiement
        </h2>
        <p className="text-sm">
          Phase : <b className="text-emerald-800">{status.phase}</b>
          {status.phase === "done" ? " — ✅ terminé avec succès." : null}
          {status.phase === "failed"
            ? ` — ❌ échoué${status.message ? ` : ${status.message}` : ""}.`
            : null}
          {running
            ? " — en cours… le panneau peut devenir indisponible pendant la recompilation."
            : null}
        </p>
        {status.startedAt ? (
          <p className="mt-1 text-xs text-neutral-400">
            Lancé le{" "}
            {new Date(status.startedAt).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            {status.finishedAt
              ? ` · terminé le ${new Date(status.finishedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`
              : ""}
          </p>
        ) : null}
      </section>

      {gate}

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            kind="primary"
            busy={busy || running}
            disabled={running}
            onClick={() => void deploy()}
          >
            {running
              ? "Déploiement en cours…"
              : "▶ Déployer (check + build + redémarrage)"}
          </Button>
          <span className="text-xs text-neutral-500">
            Pipeline : <code>npm run check</code> → snapshot{" "}
            <code>.backup/before-deploy-…</code> → build → redémarrage du
            serveur. Durée type : 1 à 3 minutes.
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Journal du déploiement
        </h2>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-900 p-3 text-[11px] leading-relaxed text-emerald-100">
          {log}
        </pre>
      </section>
    </div>
  );
}
