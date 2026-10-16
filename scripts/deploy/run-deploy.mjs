// Deploy pipeline (detached process — survives the admin server being killed).
// Phases: check → snapshot → build → restart → done/failed.
// State: logs/deploy.status.json ; log: logs/deploy.log
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LOG_DIR = join(ROOT, "logs");
const STATUS = join(LOG_DIR, "deploy.status.json");
const LOG = join(LOG_DIR, "deploy.log");
const BACKUP_ROOT = join(ROOT, ".backup");

mkdirSync(LOG_DIR, { recursive: true });

function log(line) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  try {
    appendFileSync(LOG, msg + "\n", "utf8");
  } catch {}
  console.log(msg);
}

function setStatus(phase, extra = {}) {
  const payload = {
    phase,
    startedAt: extra.startedAt ?? null,
    finishedAt: extra.finishedAt ?? null,
    ok: phase === "done",
    message: extra.message ?? "",
    ...extra,
  };
  try {
    writeFileSync(STATUS, JSON.stringify(payload, null, 2), "utf8");
  } catch {}
}

function fail(message, startedAt) {
  log("FAILED: " + message);
  setStatus("failed", { message, startedAt, finishedAt: new Date().toISOString() });
  process.exit(1);
}

const startedAt = new Date().toISOString();
setStatus("starting", { startedAt });

/* ---------- 1. npm run check ---------- */
log("→ phase check: npm run check");
setStatus("check", { startedAt });
const check = spawnSync("npm.cmd", ["run", "check"], { cwd: ROOT, encoding: "utf8", timeout: 300_000, maxBuffer: 64 * 1024 * 1024 });
if (check.error || check.status !== 0) {
  log((check.stdout || "") + "\n" + (check.stderr || ""));
  fail("npm run check a échoué — rien n'a été déployé. Corrigez les erreurs puis redéployez.", startedAt);
}
log("check ✓");

/* ---------- 2. snapshot ---------- */
log("→ phase snapshot (sauvegarde complète)");
setStatus("snapshot", { startedAt });
try {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = join(BACKUP_ROOT, `deploy-${stamp}`);
  mkdirSync(dest, { recursive: true });
  const toCopy = [
    join(ROOT, "src", "lib", "data", "content"),
    join(ROOT, "src", "messages"),
    join(ROOT, "src", "lib", "admin", "state.json"),
  ];
  for (const src of toCopy) {
    if (existsSync(src)) cpSync(src, join(dest, src.split(/[\\/]/).pop()), { recursive: true });
  }
  log(`snapshot → ${dest}`);
} catch (err) {
  log("snapshot warning: " + (err.message || String(err)));
}

/* ---------- 3. npm run build ---------- */
log("→ phase build: arrêt du serveur :3000, puis npm run build");
setStatus("build", { startedAt });

function killPort(port) {
  try {
    const out = execFileSync("netstat", ["-ano"], { encoding: "utf8", timeout: 20_000 });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (line.includes(`:${port}`) && line.includes("LISTENING")) {
        const parts = line.split(/\s+/).filter(Boolean);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execFileSync("taskkill", ["/F", "/PID", pid], { stdio: "ignore", timeout: 20_000 });
        log(`serveur :${port} (pid ${pid}) arrêté`);
      } catch {}
    }
  } catch (err) {
    log("kill :" + port + " warning: " + (err.message || String(err)));
  }
}

killPort(3000);

// clean stale .next (a partially-failed previous build poisons the next one)
try {
  rmSync(join(ROOT, ".next"), { recursive: true, force: true });
} catch {}

const build = spawnSync("npm.cmd", ["run", "build"], {
  cwd: ROOT,
  encoding: "utf8",
  timeout: 1_800_000,
  maxBuffer: 64 * 1024 * 1024,
});
if (build.error || build.status !== 0) {
  log((build.stdout || "") + "\n" + (build.stderr || ""));
  fail("npm run build a échoué — le site reste sur la version précédente. Voir logs/deploy.log.", startedAt);
}
log("build ✓");

/* ---------- 4. restart ---------- */
log("→ phase restart: démarrage de next start (détaché)");
setStatus("restart", { startedAt });
try {
  const child = spawn("cmd", ["/c", "start", "/b", "npm.cmd", "run", "start"], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
} catch (err) {
  fail("Le build a réussi mais le redémarrage a échoué : " + (err.message || String(err)) + ". Démarrez le serveur manuellement.", startedAt);
}

log("done ✓");
setStatus("done", { startedAt, finishedAt: new Date().toISOString(), message: "Déploiement réussi — site reconstruit et serveur relancé." });
process.exit(0);