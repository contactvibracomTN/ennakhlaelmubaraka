import { guardAdmin } from "../guard";
import { readAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  save: "Enregistrement",
  delete: "Suppression",
  translate: "Traduction",
  validate: "Validation",
  unvalidate: "Révocation de validation",
  upload: "Image importée",
  "deploy-start": "Déploiement lancé",
  "restore-backup": "Restauration de sauvegarde",
  "reset-languages": "Réinitialisation des langues",
  "set-source-locale": "Langue source changée",
  "reindex-state": "Reconstruction de l'état",
  "force-deploy": "Déploiement forcé",
};

export default async function AdminLogPage() {
  await guardAdmin();
  const entries = readAudit(400);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Journal d’audit</h1>
      <p className="text-sm text-neutral-500">
        Historique append-only (<code>logs/admin-audit.jsonl</code>) — qui a fait quoi, et quand. Les
        enregistrements, suppressions, traductions, validations et déploiements y figurent.
      </p>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Aucune entrée pour l’instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] uppercase text-neutral-400">
                <th className="px-4 py-2">Quand</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Cible</th>
                <th className="px-4 py-2">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {entries.map((e, i) => (
                <tr key={`${e.ts}-${i}`} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2 text-[12px] text-neutral-500">
                    {new Date(e.ts).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      {ACTION_LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2 font-mono text-[12px] text-neutral-700">
                    {e.target}
                  </td>
                  <td className="max-w-[320px] truncate px-4 py-2 text-[11px] text-neutral-400">
                    {e.detail ? JSON.stringify(e.detail) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}