"use client";

/** Backups manager — restore single files or whole snapshots. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreBackupAction } from "@/app/admin/actions";
import { Button, StatusBanner } from "./fields";

export interface BackupFile {
  /** path relative to the .backup directory */
  name: string;
  size: number;
  display: string;
}

export interface SnapshotGroup {
  folder: string;
  files: BackupFile[];
}

export function BackupsManager({
  snapshots,
  files,
}: {
  snapshots: SnapshotGroup[];
  files: BackupFile[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null);

  const restore = async (label: string, names: string[]) => {
    setBanner(null);
    setBusy(label);
    try {
      const res = await restoreBackupAction(names);
      setBanner(
        res.ok
          ? { ok: true, message: res.message ?? "Restauration effectuée." }
          : { ok: false, message: res.message ?? "Restauration impossible." },
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const human = (n: number) => (n > 0 ? `${(n / 1024).toFixed(0)} Ko` : "—");

  return (
    <div className="space-y-6">
      {banner ? <StatusBanner ok={banner.ok} message={banner.message} /> : null}

      <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          <b>Comment restaurer :</b> choisissez un instantané (avant chaque déploiement) ou un fichier
          horodaté, puis « Restaurer ». Les fichiers <code>dates.json</code>, <code>gifts.json</code>,{" "}
          <code>posts.json</code>, <code>categories.json</code> et les 8 fichiers de textes sont remis à la
          place de leur version courante. <b>Puis relancez un déploiement</b> pour appliquer au site public.
          L’état de validation est reconstruit automatiquement (écran « Accueil » → reprise d’état).
        </p>
      </section>

      {/* snapshots */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Instantanés (snapshots) — {snapshots.length}
        </h2>
        {snapshots.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Aucun instantané pour l’instant. Ils sont créés automatiquement avant chaque déploiement
            (<code>before-deploy-…</code>).
          </p>
        ) : (
          <ul className="space-y-3">
            {snapshots.map((s) => (
              <li key={s.folder} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] text-neutral-800">{s.folder}</span>
                  <span className="text-[11px] text-neutral-400">{s.files.length} fichier(s)</span>
                  <span className="ml-auto">
                    <Button
                      kind="primary"
                      busy={busy === s.folder}
                      onClick={() => void restore(s.folder, s.files.map((f) => f.name))}
                    >
                      ↔ Restaurer tout ce snapshot
                    </Button>
                  </span>
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-neutral-500 sm:grid-cols-3">
                  {s.files.map((f) => (
                    <li key={f.name} className="truncate" title={f.name}>
                      {f.display} · {human(f.size)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* individual files */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">
          Fichiers de sauvegarde individuels — {files.length}
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Aucune sauvegarde horodatée pour l’instant. Elles sont créées à chaque enregistrement.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] uppercase text-neutral-400">
                <th className="py-1.5 pr-2">Nom</th>
                <th className="py-1.5 pr-2">Taille</th>
                <th className="py-1.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {files.map((f) => (
                <tr key={f.name}>
                  <td className="py-1.5 pr-2 font-mono text-[12px] text-neutral-700">{f.display}</td>
                  <td className="py-1.5 pr-2 text-[12px] text-neutral-500">{human(f.size)}</td>
                  <td className="py-1.5 text-right">
                    <Button kind="secondary" busy={busy === f.name} onClick={() => void restore(f.name, [f.name])}>
                      ↔ Restaurer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}