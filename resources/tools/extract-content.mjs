// Extract the catalog/blog/category const arrays from the TS datasets into
// JSON content files under src/lib/data/content/ (the future admin store).
// Usage: node resources/tools/extract-content.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "C:/Users/BY 4/Desktop/nakhla-v3/src/lib/data";
const OUT = join(ROOT, "content");
mkdirSync(OUT, { recursive: true });

/** Locate the array literal body for `export const NAME:` and return its text. */
function extractArray(src, name) {
  const marker = `export const ${name}:`;
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`export ${name} not found`);
  const open = src.indexOf("= [", start);
  if (open < 0) throw new Error(`array literal for ${name} not found`);
  const bodyStart = open + 2; // "= [" → body starts at "[" and ends at the matching "]"
  // Scan to the matching "]" at depth 0 (strings + comments respected).
  // The body INCLUDES the opening "[" so we start at depth 0, and we break
  // as soon as the array's own closing "]" brings depth back to 0.
  let depth = 0;
  let i = bodyStart;
  let quote = null;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; i += 1; continue; }
    if (ch === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl < 0 ? src.length : nl + 1;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    if (ch === "]" || ch === "}") depth -= 1;
    i += 1;
    if (depth === 0) break;
  }
  // `i` now points just past the array's own closing "]"; include it.
  const body = src.slice(bodyStart, i);
  // Evaluate as JS array literal -> data.
  const fn = new Function(`"use strict"; return (${body});`);
  return fn();
}

const load = (file) => readFileSync(join(ROOT, "datasets", file), "utf8");
const save = (file, data) => {
  writeFileSync(join(OUT, file), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`wrote content/${file} (${(data.length ?? 1)} entries)`);
};

const datesSrc = load("dates.ts");
const dates = extractArray(datesSrc, "dateProducts");
save("dates.json", dates);

const giftsSrc = load("gifts.ts");
const gifts = extractArray(giftsSrc, "giftProducts");
save("gifts.json", gifts);

const blogSrc = load("blog.ts");
const posts = extractArray(blogSrc, "blogPosts");
save("posts.json", posts);

const catSrc = load("categories.ts");
const catDates = extractArray(catSrc, "dateCategories");
const catGifts = extractArray(catSrc, "giftCategories");
save("categories.json", { dates: catDates, gifts: catGifts });

// Quick stats for eyeballing.
console.log("--------------------------------");
console.log("dates:", dates.length, "| gifts:", gifts.length, "| posts:", posts.length);
console.log("categories: dates", catDates.length, "gifts", catGifts.length);
console.log("sample post slug[0]:", posts[0]?.slug, "| date[0].slug:", dates[0]?.slug);