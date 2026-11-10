#!/usr/bin/env node
/**
 * Content image guard.
 *
 * Every local image path referenced by the JSON content layer
 * (`/images/...`) must exist under `public/`. A typo, a renamed upload or an
 * admin save that recorded a file which was never written silently produces a
 * 404 on the live site (and an empty slot in galleries/cards).
 *
 * Run before committing content changes:
 *   npm run check:images
 *
 * Exits with code 1 when at least one referenced image is missing, so it can
 * also be wired into CI later.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "lib", "data", "content");
const publicDir = join(root, "public");

const missing = new Map();

function walk(value, file) {
  if (typeof value === "string") {
    if (!value.startsWith("/images/")) return;
    if (existsSync(join(publicDir, value))) return;
    if (!missing.has(value)) missing.set(value, new Set());
    missing.get(value).add(file);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, file);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walk(item, file);
  }
}

const files = readdirSync(contentDir).filter((name) => name.endsWith(".json"));

for (const file of files) {
  walk(JSON.parse(readFileSync(join(contentDir, file), "utf8")), file);
}

if (missing.size === 0) {
  console.log(`✓ Images OK — ${files.length} fichiers de contenu vérifiés.`);
  process.exit(0);
}

console.error(`✗ ${missing.size} image(s) référencée(s) mais absente(s) de public/ :`);
for (const [image, sources] of missing) {
  console.error(`  - ${image}  (${[...sources].join(", ")})`);
}
console.error("\nCorrige le chemin dans le JSON ou ajoute le fichier, puis relance `npm run check:images`.");
process.exit(1);
