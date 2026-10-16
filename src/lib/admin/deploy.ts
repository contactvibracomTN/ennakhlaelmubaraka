/**
 * Deploy — triggers the detached deployment pipeline (scripts/deploy/
 * run-deploy.mjs) and exposes its status/log. The pipeline kills the :3000
 * listener, runs `npm run check` + `npm run build`, then restarts the server —
 * so the admin page itself goes briefly dark during a deploy (normal).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { deployLogFile, deployScript, deployStatusFile, logsDir, projectRoot } from "./paths";

export interface DeployStatus {
  phase: "idle" | "starting" | "check" | "snapshot" | "build" | "restart" | "done" | "failed";
  startedAt?: string;
  finishedAt?: string;
  ok?: boolean;
  message?: string;
}

export function isDeployRunning(status?: DeployStatus): boolean {
  const s = status ?? readDeployStatus();
  return ["starting", "check", "snapshot", "build", "restart"].includes(s.phase);
}

export function readDeployStatus(): DeployStatus {
  try {
    if (!existsSync(deployStatusFile())) return { phase: "idle" };
    return JSON.parse(readFileSync(deployStatusFile(), "utf8")) as DeployStatus;
  } catch {
    return { phase: "idle" };
  }
}

export function startDeploy(): { ok: boolean; message: string } {
  if (isDeployRunning()) return { ok: false, message: "Un déploiement est déjà en cours." };
  mkdirSync(logsDir(), { recursive: true });
  const status: DeployStatus = { phase: "starting", startedAt: new Date().toISOString(), ok: false };
  writeFileSync(deployStatusFile(), JSON.stringify(status, null, 2), "utf8");
  try {
    const child = spawn(process.execPath, [deployScript()], {
      cwd: projectRoot(),
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return { ok: true, message: "Déploiement lancé. Le panneau sera brièvement indisponible pendant la recompilation." };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    writeFileSync(
      deployStatusFile(),
      JSON.stringify({ phase: "failed", startedAt: new Date().toISOString(), ok: false, message }, null, 2),
      "utf8",
    );
    return { ok: false, message: `Impossible de lancer le déploiement : ${message}` };
  }
}

export function readDeployLogTail(maxChars = 2000): string {
  try {
    const file = deployLogFile();
    if (!existsSync(file)) return "(pas encore de log)";
    const all = readFileSync(file, "utf8");
    return all.slice(-maxChars);
  } catch {
    return "(log illisible)";
  }
}