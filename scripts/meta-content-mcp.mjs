#!/usr/bin/env node
/**
 * Meta Content MCP — lecture seule.
 *
 * Expose les données organiques Facebook Page / Instagram nécessaires à l'agent
 * quotidien : posts, commentaires, insights, médias Instagram.
 *
 * Aucune écriture n'est implémentée volontairement. Le token reste côté
 * environnement OpenCode via {env:META_CONTENT_TOKEN} et n'est jamais journalisé.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const SERVER_NAME = "meta-content";
const SERVER_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2025-06-18";

function tokenFromEnvLocal() {
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local"),
  ];
  for (const file of candidates) {
    try {
      const text = fs.readFileSync(file, "utf8");
      const match = text.match(/^META_CONTENT_TOKEN=(.*)$/m);
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    } catch {
      // essayer le chemin suivant
    }
  }
  return "";
}

const TOKEN = process.env.META_CONTENT_TOKEN || tokenFromEnvLocal();
const PAGE_ID = process.env.META_PAGE_ID || "1237934092745712";
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID || "17841432161316016";
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v27.0";

function clampLimit(value, fallback = 25, max = 100) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}

async function graphGet(path, params = {}) {
  if (!TOKEN) {
    throw new Error(
      "META_CONTENT_TOKEN est vide. Créez le token System User 'nakhla-content' puis redémarrez OpenCode.",
    );
  }

  const url = new URL(`${GRAPH_VERSION}/${path.replace(/^\//, "")}`, "https://graph.facebook.com/");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  url.searchParams.set("access_token", TOKEN);

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const raw = await response.text();

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { raw };
  }

  if (!response.ok || payload?.error) {
    const message = payload?.error?.message || `Graph API HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (code ${payload.error.code})` : "";
    throw new Error(`${message}${code}`);
  }

  return payload;
}

const TOOLS = [
  {
    name: "meta_content_get_assets",
    description:
      "Retourne les identifiants publics configurés : Page Facebook et compte Instagram professionnel. Utile pour vérifier la cible avant toute analyse.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "meta_content_get_page_posts",
    description:
      "Liste les publications organiques de la Page Facebook avec texte, date, permalien et compteurs de réactions/commentaires/partages. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "ID de Page. Par défaut la Page configurée." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Nombre de publications, 25 par défaut." },
        since: { type: "string", description: "Timestamp Unix de début, optionnel." },
        until: { type: "string", description: "Timestamp Unix de fin, optionnel." },
      },
    },
  },
  {
    name: "meta_content_get_page_post_insights",
    description:
      "Récupère les insights d'une publication Facebook : portée, impressions, engagement, commentaires et partages. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        post_id: { type: "string", description: "ID de la publication Facebook." },
        metric: {
          type: "string",
          description:
            "Métriques séparées par des virgules. Par défaut : post_reach,post_impressions,post_engaged_users,post_comments,post_shares.",
        },
      },
      required: ["post_id"],
    },
  },
  {
    name: "meta_content_get_page_comments",
    description:
      "Liste les commentaires publics d'une publication Facebook pour détecter les questions et les signaux d'intérêt. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        post_id: { type: "string", description: "ID de la publication Facebook." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Nombre de commentaires, 25 par défaut." },
      },
      required: ["post_id"],
    },
  },
  {
    name: "meta_content_get_ig_media",
    description:
      "Liste les médias organiques Instagram : légende, date, type, permalien, likes et commentaires. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        ig_account_id: { type: "string", description: "ID du compte Instagram. Par défaut le compte configuré." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Nombre de médias, 25 par défaut." },
        since: { type: "string", description: "Timestamp Unix de début, optionnel." },
        until: { type: "string", description: "Timestamp Unix de fin, optionnel." },
      },
    },
  },
  {
    name: "meta_content_get_ig_media_insights",
    description:
      "Récupère les insights d'un média Instagram : engagement, impressions, portée, sauvegardes et partages selon disponibilité. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        media_id: { type: "string", description: "ID du média Instagram." },
        metric: { type: "string", description: "Par défaut : engagement,impressions,reach,saved,shares." },
      },
      required: ["media_id"],
    },
  },
  {
    name: "meta_content_get_ig_comments",
    description:
      "Liste les commentaires publics d'un média Instagram pour analyser les interactions de la communauté. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        media_id: { type: "string", description: "ID du média Instagram." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Nombre de commentaires, 25 par défaut." },
      },
      required: ["media_id"],
    },
  },
  {
    name: "meta_content_get_ig_account_insights",
    description:
      "Récupère les insights du compte Instagram : portée, impressions, vues du profil. Lecture seule.",
    inputSchema: {
      type: "object",
      properties: {
        ig_account_id: { type: "string", description: "ID du compte Instagram. Par défaut le compte configuré." },
        period: { type: "string", description: "day, week ou month. Par défaut day." },
        metric: { type: "string", description: "Par défaut : reach,impressions,profile_views." },
      },
    },
  },
];

async function callTool(name, args = {}) {
  switch (name) {
    case "meta_content_get_assets":
      return {
        page_id: PAGE_ID,
        instagram_account_id: IG_ACCOUNT_ID,
        graph_version: GRAPH_VERSION,
        token_present: Boolean(TOKEN),
        mode: "read-only",
      };

    case "meta_content_get_page_posts": {
      const limit = clampLimit(args.limit);
      return await graphGet(`${PAGE_ID}/feed`, {
        fields:
          "id,message,created_time,permalink_url,likes.limit(0).summary(true),comments.limit(0).summary(true),shares",
        limit,
        since: args.since,
        until: args.until,
      });
    }

    case "meta_content_get_page_post_insights": {
      if (!args.post_id) throw new Error("post_id est requis.");
      const metric =
        args.metric ||
        "post_reach,post_impressions,post_engaged_users,post_comments,post_shares";
      return await graphGet(`${args.post_id}/insights`, { metric });
    }

    case "meta_content_get_page_comments": {
      if (!args.post_id) throw new Error("post_id est requis.");
      return await graphGet(`${args.post_id}/comments`, {
        fields: "id,message,created_time,from.name,like_count",
        limit: clampLimit(args.limit),
      });
    }

    case "meta_content_get_ig_media": {
      const limit = clampLimit(args.limit);
      return await graphGet(`${args.ig_account_id || IG_ACCOUNT_ID}/media`, {
        fields:
          "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count",
        limit,
        since: args.since,
        until: args.until,
      });
    }

    case "meta_content_get_ig_media_insights": {
      if (!args.media_id) throw new Error("media_id est requis.");
      return await graphGet(`${args.media_id}/insights`, {
        metric: args.metric || "engagement,impressions,reach,saved,shares",
      });
    }

    case "meta_content_get_ig_comments": {
      if (!args.media_id) throw new Error("media_id est requis.");
      return await graphGet(`${args.media_id}/comments`, {
        fields: "id,text,timestamp,username,like_count",
        limit: clampLimit(args.limit),
      });
    }

    case "meta_content_get_ig_account_insights": {
      return await graphGet(`${args.ig_account_id || IG_ACCOUNT_ID}/insights`, {
        metric: args.metric || "reach,impressions,profile_views",
        period: args.period || "day",
      });
    }

    default:
      throw new Error(`Outil inconnu : ${name}`);
  }
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

async function handle(message) {
  const { id, method, params = {} } = message;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: message.params?.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      },
    });
    return;
  }

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return;
  }

  if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
    return;
  }

  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }

  if (method === "tools/call") {
    const name = params.name;
    try {
      const data = await callTool(name, params.arguments || {});
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        },
      });
    } catch (error) {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        },
      });
    }
    return;
  }

  send({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Méthode non supportée : ${method}` },
  });
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON invalide" } });
    return;
  }
  void handle(message);
});
