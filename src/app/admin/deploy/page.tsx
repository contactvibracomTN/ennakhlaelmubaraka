import { guardAdmin } from "../guard";
import { checkCompleteness } from "@/lib/admin/completeness";
import { readDeployStatus, readDeployLogTail } from "@/lib/admin/deploy";
import {
  devPreviewUrl,
  getLastCommit,
  githubBranch,
  hasDevDeployHook,
  isGithubMode,
} from "@/lib/admin/github-writes";
import { DeployPanel } from "../components/deploy-panel";

export const dynamic = "force-dynamic";

export default async function AdminDeployPage() {
  await guardAdmin();
  const report = checkCompleteness();
  const githubMode = isGithubMode();
  let lastCommit: Awaited<ReturnType<typeof getLastCommit>> = null;
  if (githubMode) {
    try {
      lastCommit = await getLastCommit();
    } catch {
      /* token or network issue: the panel shows the fallback message */
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-950">Déploiement</h1>
      <p className="text-sm text-neutral-500">
        {githubMode ? (
          <>
            Les enregistrements sont committés sur <code>{githubBranch()}</code>
            . Vérifiez la preview, puis promouvez la branche en production
            depuis votre poste avec git.
          </>
        ) : (
          <>
            « Déployer » revalide le code (<code>npm run check</code>), prend un
            instantané de sauvegarde, compile le site et redémarre le serveur.
            Le site est brièvement indisponible pendant la recompilation —
            rafraîchissez cette page ensuite.
          </>
        )}
      </p>
      <DeployPanel
        report={report}
        initialStatus={githubMode ? { phase: "idle" } : readDeployStatus()}
        initialLog={githubMode ? "" : readDeployLogTail(6000)}
        githubMode={githubMode}
        branch={githubBranch()}
        lastCommit={lastCommit}
        previewUrl={devPreviewUrl()}
        hookReady={hasDevDeployHook()}
      />
    </div>
  );
}
