"use client";

/** Deploy panel — shows gate status, launches the pipeline, polls the status. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startDeployAction } from "@/app/admin/actions";
import type { CompletenessReport } from "@/lib/admin/completeness";
import type { DeployStatus } from "@/lib/admin/deploy";
import { Button, StatusBanner } from "./fields";

const RUNNING = ["starting", "check", "snapshot", "build", "restart"];

export function DeployPanel({
  report,
  initialStatus,
  initialLog,
}: {
  report: CompletenessReport;
  initialStatus: DeployStatus;
  initialLog: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DeployStatus>(initialStatus);
  const [log, setLog] = useState(initialLog);
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const running = RUNNING.includes(status.phase);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/deploy-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status: DeployStatus; log: string };
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
          ? { ok: true, message: res.message ?? "Déploiement lancé." }
          : { ok: false, message: res.message ?? "Lancement impossible." },
      );
      // poll from the new state
      const poll = await fetch("/api/admin/deploy-status", { cache: "no-store" });
      if (poll.ok) {
        const data = (await poll.json()) as { status: DeployStatus; log: string };
        setStatus(data.status);
        setLog(data.log);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      {/* status strip */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">État du déploiement</h2>
        <p className="text-sm">
          Phase : <b className="text-emerald-800">{status.phase}</b>
          {status.phase === "done" ? " — ✅ terminé avec succès." : null}
          {status.phase === "failed" ? ` — ❌ échoué${status.message ? ` : ${status.message}` : ""}.` : null}
          {running ? " — en cours… le panneau peut devenir indisponible pendant la recompilation." : null}
        </p>
        {status.startedAt ? (
          <p className="mt-1 text-xs text-neutral-400">
            Lancé le {new Date(status.startedAt).toLocaleString("fr-FR")}
            {status.finishedAt ? ` · terminé le ${new Date(status.finishedAt).toLocaleString("fr-FR")}` : ""}
          </p>
        ) : null}
      </section>

      {/* gate */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Porte de complétude {report.ok ? "— ✓ tout est validé" : "— ⚠ incomplète"}
        </h2>
        {report.ok ? (
          <p className="text-sm text-emerald-800">
            Chaque élément actif a ses versions validées et les 8 fichiers de textes sont en phase. Vous pouvez
            publier.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="text-amber-800">{report.blockedSummary}</p>
            <ul className="list-inside list-disc space-y-1 text-neutral-600">
              {report.itemIssues.map((i) => (
                <li key={`${i.kind}:${i.slug}`}>
                  {i.kind} « {i.title.ar || i.slug} » →{" "}
                  {i.blockedLocales.map((b) => b).join(", ")} (à valider ou à traduire)
                </li>
              ))}
              {report.messageIssues.map((m) => (
                <li key={m.locale}>
                  Textes ({m.locale}) : {m.missingCount} clé(s) manquante(s) vs arabe —{" "}
                  {m.keys.join(", ")}
                </li>
              ))}
              {!report.faqIssue.ok ? (
                <li>FAQ : comptes inégaux {JSON.stringify(report.faqIssue.counts)}</li>
              ) : null}
            </ul>
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
              Forcer le déploiement malgré les blocages (action journalisée)
            </label>
          </div>
        )}
      </section>

      {/* actions */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button kind="primary" busy={busy || running} disabled={running} onClick={() => void deploy()}>
            {running ? "Déploiement en cours…" : "▶ Déployer (check + build + redémarrage)"}
          </Button>
          <span className="text-xs text-neutral-500">
            Pipeline : <code>npm run check</code> → snapshot <code>.backup/before-deploy-…</code> → build →
            redémarrage du serveur. Durée type : 1 à 3 minutes.
          </span>
        </div>
      </section>

      {/* log */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-800">Journal du déploiement</h2>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-neutral-200 bg-neutral-900 p-3 text-[11px] leading-relaxed text-emerald-100">
          {log}
        </pre>
      </section>
    </div>
  );
}