import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const BRIEF_DIR = path.resolve(ROOT, "docs", "briefs", "2026-12");
const PROMPT_DIR = path.join(BRIEF_DIR, "prompts");
const HTML_PATH = path.join(BRIEF_DIR, "validation.html");
const STATE_PATH = path.join(BRIEF_DIR, "validation-state.json");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4321);
const IDS = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));
const CHECK_FIELDS = new Set(["texte", "champs", "photo", "prompt"]);
const FILE_OF = (field) => (field === "prompt" ? "prompt" : "brief");

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
}

function readIfExists(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function readState() {
  const raw = readIfExists(STATE_PATH);
  if (!raw) return { version: 1, updatedAt: null, briefs: {} };
  try {
    return JSON.parse(raw);
  } catch {
    return { version: 1, updatedAt: null, briefs: {} };
  }
}

function writeWithBackup(file, data) {
  if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.bak`);
  fs.writeFileSync(file, data, "utf8");
}

function writeState(state) {
  state.updatedAt = new Date().toISOString();
  writeWithBackup(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function briefPath(id) {
  return path.join(BRIEF_DIR, `brief-${id}.md`);
}

function promptPath(id) {
  return path.join(PROMPT_DIR, `prompt-${id}.md`);
}

function vscodeUrl(file) {
  return `vscode://file/${file.replace(/\\/g, "/")}`;
}

function fileHash(file) {
  const content = readIfExists(file);
  return content === null ? null : hash(content);
}

function defaultEntry() {
  return {
    texte: false,
    champs: false,
    photo: false,
    prompt: false,
    hashes: { brief: null, prompt: null },
    checkedAt: {},
  };
}

function metaFrom(content) {
  const lines = content.split(/\r?\n/);
  const title = (lines[0] || "").replace(/^#\s*Brief\s*\[\d+\]\s*—\s*/, "").trim();
  const line = lines.find((l) => /^\[\d+\]\s*—/.test(l)) || "";
  const meta = line.split("·").map((part) => part.trim()).slice(1, 3).join(" · ");
  return { title, meta };
}

function buildView() {
  const stored = readState();
  const counts = {
    a_valider: 0,
    pret_pour_prompt: 0,
    a_preparer: 0,
    valide: 0,
    a_reverifier: 0,
  };
  const briefs = [];

  for (const id of IDS) {
    const content = readIfExists(briefPath(id)) || "";
    const briefHash = hash(content);
    const hasPrompt = fs.existsSync(promptPath(id));
    const promptHash = hasPrompt ? fileHash(promptPath(id)) : null;
    const saved = stored.briefs?.[id] || defaultEntry();
    const entry = {
      ...defaultEntry(),
      ...saved,
      hashes: { ...defaultEntry().hashes, ...(saved.hashes || {}) },
      checkedAt: { ...(saved.checkedAt || {}) },
    };

    const staleBrief = entry.hashes.brief && entry.hashes.brief !== briefHash;
    const stalePrompt = entry.hashes.prompt && entry.hashes.prompt !== promptHash;
    let status;
    if (staleBrief || stalePrompt) status = "a_reverifier";
    else if (entry.texte && entry.champs && entry.photo && entry.prompt) status = "valide";
    else if (promptHash) status = "a_valider";
    else if (entry.texte && entry.champs && entry.photo) status = "pret_pour_prompt";
    else status = "a_preparer";
    counts[status] += 1;

    const { title, meta } = metaFrom(content);
    briefs.push({
      id,
      title,
      meta,
      status,
      checks: {
        texte: Boolean(entry.texte),
        champs: Boolean(entry.champs),
        photo: Boolean(entry.photo),
        prompt: Boolean(entry.prompt),
      },
      promptPresent: hasPrompt,
      vscodeUrl: vscodeUrl(briefPath(id)),
      promptUrl: hasPrompt ? vscodeUrl(promptPath(id)) : null,
      content,
    });
  }

  return {
    version: 1,
    updatedAt: stored.updatedAt || null,
    total: IDS.length,
    counts,
    briefs,
  };
}

function sendJson(res, code, value) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}

function sendText(res, code, value) {
  res.writeHead(code, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(value);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) reject(new Error("Corps trop volumineux"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function validId(id) {
  return typeof id === "string" && IDS.includes(id);
}

async function handleCheck(req, res) {
  const body = await parseBody(req);
  const { id, field, value } = body;
  if (!validId(id)) return sendJson(res, 400, { error: "Identifiant invalide" });
  if (!CHECK_FIELDS.has(field)) return sendJson(res, 400, { error: "Champ invalide" });
  if (typeof value !== "boolean") return sendJson(res, 400, { error: "Valeur invalide" });
  if (field === "prompt" && value && !fs.existsSync(promptPath(id))) {
    return sendJson(res, 400, { error: "Aucun prompt déposé pour ce brief" });
  }

  const state = readState();
  const entry = { ...defaultEntry(), ...(state.briefs?.[id] || {}) };
  entry.hashes = { ...defaultEntry().hashes, ...(entry.hashes || {}) };
  entry.checkedAt = { ...(entry.checkedAt || {}) };

  if (value) {
    entry[field] = true;
    entry.checkedAt[field] = new Date().toISOString();
    entry.hashes[FILE_OF(field)] =
      FILE_OF(field) === "prompt" ? fileHash(promptPath(id)) : hash(readIfExists(briefPath(id)) || "");
  } else {
    entry[field] = false;
    delete entry.checkedAt[field];
    if (field === "prompt") {
      if (!entry.prompt) entry.hashes.prompt = null;
    } else if (!entry.texte && !entry.champs && !entry.photo) {
      entry.hashes.brief = null;
    }
  }

  state.briefs = state.briefs || {};
  state.briefs[id] = entry;
  writeState(state);
  return sendJson(res, 200, { ok: true, id, field, value });
}

async function handleSave(req, res) {
  const body = await parseBody(req);
  const { id, content } = body;
  if (!validId(id)) return sendJson(res, 400, { error: "Identifiant invalide" });
  if (typeof content !== "string") return sendJson(res, 400, { error: "Contenu invalide" });

  const file = briefPath(id);
  const previous = readIfExists(file) || "";
  if (content !== previous) {
    writeWithBackup(file, content);
    const state = readState();
    state.briefs = state.briefs || {};
    state.briefs[id] = defaultEntry();
    writeState(state);
  }
  return sendJson(res, 200, { ok: true, id, changed: content !== previous });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
    if (url.pathname === "/" || url.pathname === "/validation.html") {
      if (req.method !== "GET") return sendJson(res, 405, { error: "Méthode non autorisée" });
      const html = readIfExists(HTML_PATH);
      if (html === null) return sendJson(res, 404, { error: "Page introuvable" });
      return sendText(res, 200, html);
    }
    if (url.pathname === "/api/state" && req.method === "GET") {
      return sendJson(res, 200, buildView());
    }
    if (url.pathname === "/api/check" && req.method === "POST") {
      return await handleCheck(req, res);
    }
    if (url.pathname === "/api/save" && req.method === "POST") {
      return await handleSave(req, res);
    }
    return sendJson(res, 404, { error: "Ressource introuvable" });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || "Requête invalide" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serveur prêt sur http://${HOST}:${PORT}`);
  console.log("Contrôle local uniquement. Aucun appel réseau, aucune publication, aucun boost.");
});
