import { guardAdmin } from "../guard";
import { checkCompleteness } from "@/lib/admin/completeness";
import { readDeployStatus, readDeployLogTail } from "@/lib/admin/deploy";
import { DeployPanel } from "../components/deploy-panel";

export const dynamic = "force-dynamic";

export default async function AdminDeployPage() {
  await guardAdmin();
  const report = checkCompleteness();
  const status = readDeployStatus();
  const log = readDeployLogTail(6000);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Déploiement</h1>
      <p className="text-sm text-neutral-500">
        « Déployer » revalide le code (<code>npm run check</code>), prend un instantané de sauvegarde, compile
        le site et redémarre le serveur. Le site est brièvement indisponible pendant la recompilation —
        rafraîchissez cette page ensuite.
      </p>
      <DeployPanel report={report} initialStatus={status} initialLog={log} />
    </div>
  );
}