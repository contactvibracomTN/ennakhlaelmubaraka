/**
 * migrate-v21.mjs — v2.1 → v3 typed data migration (Phase 0, data layer).
 *
 * Reads the raw v2.1 sources and emits strict, typed datasets under
 * `src/lib/data/datasets/*.ts`:
 *   - dates.ts      (DateProduct[])  — 26 items
 *   - gifts.ts      (GiftProduct[])  — 25 items
 *   - guide.ts      (GuideVariety[]) — 24 varieties (AR+EN editorial, FR editorial)
 *   - categories.ts (DateCategoryInfo[] + GiftCategoryInfo[])
 *
 * Rules honoured here:
 *   - NO invented data: every field is mapped from the raw sources.
 *   - All migrated content is flagged `contentStatus: "demo"` (prices and
 *     editorial from the unvalidated v2.1 prototype).
 *   - Region/texture French enums are normalized to the model vocabulary.
 *   - EN size labels for weights are MACHINE-DERIVED from the v2.1 AR strings
 *     (v2.1 only shipped AR size strings) — marked in a comment for review.
 *   - Remote category images are replaced by equivalent LOCAL photos already
 *     extracted from the v2.1 deploy zip.
 *   - The 6 additional locales (fr, tr, ur, ms, bn, id) are merged from the
 *     v2.1 `src/translations/*.json` overlays (products/gifts/categories short
 *     content) and from `data.json → guideVarieties[].fr` (guide editorial).
 *     Exactly like the v2.1 site, only FR ships full guide editorial; the
 *     other locales fall back to EN for guide long-form content.
 *
 * Run: node resources/tools/migrate-v21.mjs  (from the project root)
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "resources", "raw");
const OUT = join(ROOT, "src", "lib", "data", "datasets");

const data = JSON.parse(readFileSync(join(RAW, "src-data.json"), "utf8"));
const photos = JSON.parse(readFileSync(join(RAW, "src-photos.json"), "utf8"));

/* --------------------- v2.1 translation overlays (6 langs) --------------------- */

/** Extra locales merged from the v2.1 site (UI falls back to EN when absent). */
const EXTRA_LOCALES = ["fr", "tr", "ur", "ms", "bn", "id"];

const overlays = Object.fromEntries(
  EXTRA_LOCALES.map((code) => [
    code,
    JSON.parse(readFileSync(join(RAW, "translations", `${code}.json`), "utf8")),
  ]),
);

/**
 * `{ ar, en }` + a per-locale string every time the overlay provides one.
 * Missing locales are simply omitted so `pick()` falls back to EN.
 */
function withOverlay(base, getVal) {
  const out = { ...base };
  for (const code of EXTRA_LOCALES) {
    const val = getVal(code);
    if (val) out[code] = val;
  }
  return out;
}

/* ----------------------------- helpers ------------------------------- */

/** "89 ر.س" / "SAR 89" → { amount: 89 }. Throws on non-numeric. */
function parseSar(str, where) {
  const m = String(str).match(/(\d[\d,]*)/);
  if (!m) throw new Error(`Cannot parse SAR string "${str}" (${where})`);
  return Number(m[1].replace(/,/g, ""));
}

const money = (str, where) => ({
  amount: parseSar(str, where),
  currency: "SAR",
});

/** v2.1 French texture → GuideTexture. */
const TEXTURE_MAP = { molle: "soft", semi: "semi-soft", seche: "dry" };
const texture = (t) => (t ? TEXTURE_MAP[t] : undefined);

/** v2.1 French region → GuideRegion (normalized). */
const REGION_MAP = {
  maghreb: "maghreb",
  machrek: "mashriq",
  golf: "gulf",
  iran: "iran",
  oman: "oman",
  egypte: "egypt",
};
const region = (r) => {
  if (!(r in REGION_MAP)) throw new Error(`Unknown region "${r}"`);
  return REGION_MAP[r];
};

/** Zip two per-language arrays into LocalizedText[] (index-safe). */
function zipLocalized(ar, en, where) {
  if (ar.length !== en.length) {
    throw new Error(`Mismatched ar/en lengths at ${where}`);
  }
  return ar.map((a, i) => {
    if (typeof a !== typeof en[i] || (typeof a === "object" && a == null)) {
      throw new Error(`Shaped mismatch at ${where}[${i}]`);
    }
    if (typeof a === "object" && !Array.isArray(a) && !Array.isArray(en[i])) {
      if ("text" in a) {
        // timeline event: { label, text }
        return {
          label: { ar: a.label, en: en[i].label },
          text: { ar: a.text, en: en[i].text },
        };
      }
      return {
        label: { ar: a.label, en: en[i].label },
        value: { ar: a.value, en: en[i].value },
      };
    }
    if (Array.isArray(a) && Array.isArray(en[i])) {
      return {
        label: { ar: a[0], en: en[i][0] },
        value: { ar: a[1], en: en[i][1] },
      };
    }
    if (typeof a === "string" && typeof en[i] === "string") {
      return { ar: a, en: en[i] };
    }
    throw new Error(`Unhandled shape at ${where}[${i}]`);
  });
}

const local = (ar, en) => ({ ar, en });

/** `{ ar, en }` + optional FR (the only locale with full guide editorial). */
const local3 = (ar, en, fr) => ({ ar, en, ...(fr ? { fr } : {}) });

/**
 * Merge the parallel FR array into zipLocalized() output (guide editorial).
 * `kind`: "text" | "event" ({label,text}) | "fact" ({label,value}).
 */
function mergeFr(entries, frEntries, kind, where) {
  if (!frEntries) return entries;
  if (frEntries.length !== entries.length) {
    throw new Error(`Mismatched FR length at ${where}`);
  }
  return entries.map((ent, i) => {
    const fe = frEntries[i];
    if (!fe) return ent;
    if (kind === "event" || kind === "fact") {
      const obj =
        kind === "event"
          ? { label: local3(ent.label.ar, ent.label.en, fe.label), text: local3(ent.text.ar, ent.text.en, fe.text) }
          : { label: local3(ent.label.ar, ent.label.en, fe.label), value: local3(ent.value.ar, ent.value.en, fe.value) };
      return obj;
    }
    return local3(ent.ar, ent.en, fe);
  });
}

/** v2.1 local photo path → public path (strips the date_/gift_/guide_ prefix). */
function photoPaths(slug, kind) {
  const key = `${kind}_${slug}`;
  const rel = photos[key];
  if (!rel || rel.length !== 3) {
    throw new Error(`Missing 3 photos for ${key}`);
  }
  const prefix = `images/photos/${kind}_`;
  return rel.map((p) => {
    if (!p.startsWith(prefix)) {
      throw new Error(`Unexpected photo path "${p}" for ${key}`);
    }
    return `/images/${kind}s/${p.slice(prefix.length)}`;
  });
}

const round = (n) => Math.round(n);

/** Parse a v2.1 AR weight string into { number?, unit, labelAr, labelEn }.
 *  Note: no `\b` — Arabic letters aren't ASCII word chars. kg checked first. */
function parseWeight(raw) {
  const s = String(raw).trim();
  const kg = s.match(/([\d.]+)\s*كجم/);
  const g = kg ? null : s.match(/([\d.]+)\s*جم/);
  const ml = kg ? null : g ? null : s.match(/([\d.]+)\s*مل/);
  if (kg) {
    const n = Number(kg[1]);
    return { number: n, unit: "kg", labelAr: `${n} كجم`, labelEn: `${n} kg` };
  }
  if (g) {
    const n = Number(g[1]);
    return { number: n, unit: "g", labelAr: `${n} جم`, labelEn: `${n} g` };
  }
  if (ml) {
    const n = Number(ml[1]);
    return { number: n, unit: "ml", labelAr: `${n} مل`, labelEn: `${n} ml` };
  }
  return { number: null, unit: null, labelAr: s, labelEn: deriveSizeEn(s) };
}

/** Small AR→EN glossary for the machine-derived size lines (demo content). */
function deriveSizeEn(ar) {
  const pairs = [
    ["تشكيلة ضيافة كبيرة", "Large hospitality mix"],
    ["تشكيلة ضيافة", "Hospitality mix"],
    ["تشكيلة 750 جم + حلويات", "750 g mix + sweets"],
    ["تشكيلة 1 كجم + حلويات", "1 kg mix + sweets"],
    ["1.5 كجم — تصميم ضيافة", "1.5 kg — hospitality design"],
    ["تشكيلة 550 جم", "550 g mix"],
    ["تشكيلة 650 جم", "650 g mix"],
    ["6 أصناف × 125 جم", "6 varieties × 125 g"],
    ["18 قطعة فاخرة", "18 luxury pieces"],
    ["500 جم — مثال", "500 g"],
    ["500 جم — عرض تجريبي", "500 g"],
    ["تشكيلة متنوعة", "Varied selection"],
    ["12 قطعة", "12 pieces"],
    ["300 جم", "300 g"],
    ["400 جم", "400 g"],
    ["250 مل", "250 ml"],
    ["220 جم", "220 g"],
    ["500 جم", "500 g"],
    ["250 جم", "250 g"],
    ["200 جم", "200 g"],
    ["1.5 كجم", "1.5 kg"],
    ["1 كجم", "1 kg"],
    ["1 كيلو", "1 kg"],
  ];
  const hit = pairs.find(([a]) => a === ar);
  if (hit) return hit[1];
  // fallback: transliterate number+unit
  const m = ar.match(/([\d.]+)\s*(جم|كجم|مل|قطعة)/);
  if (m) {
    const units = { جم: "g", كجم: "kg", مل: "ml", قطعة: "pieces" };
    return `${m[1]} ${units[m[2]]}`;
  }
  return ar; // keep AR verbatim as last resort (flagged demo)
}

/* ------------------------------ dates -------------------------------- */

const dateProducts = data.dateProducts.map((p) => {
  const w = parseWeight(p.weight);
  const offer = {
    ar: p.offerLabelAr ?? "",
    en: p.offerLabelEn ?? "",
    ...Object.fromEntries(
      EXTRA_LOCALES.map((code) => [
        code,
        overlays[code]?.dateProducts?.[p.slug]?.offerLabel,
      ]).filter(([, v]) => v),
    ),
  };
  const badges = offer.ar ? [offer] : [];
  const tex = texture(p.texture);
  return {
    kind: "date",
    id: `date-${p.slug}`,
    slug: p.slug,
    name: withOverlay(local(p.nameAr, p.nameEn), (code) =>
      overlays[code]?.dateProducts?.[p.slug]?.name,
    ),
    teaser: withOverlay(local(p.teaserAr, p.teaserEn), (code) =>
      overlays[code]?.dateProducts?.[p.slug]?.teaser,
    ),
    images: photoPaths(p.slug, "date"),
    price: money(p.priceAr, p.slug),
    compareAtPrice: p.regularPriceAr
      ? money(p.regularPriceAr, p.slug)
      : undefined,
    availability: "in-stock",
    badges: badges.length ? badges : undefined,
    contentStatus: "demo",
    category: p.category,
    varietySlug: p.guideSlug || undefined,
    origin: withOverlay(local(p.originAr, p.originEn), (code) =>
      overlays[code]?.dateProducts?.[p.slug]?.origin,
    ),
    unit: w.unit === "g" || w.unit === "kg" ? "kg" : "box",
    weightOptions: [
      {
        id: w.unit === "g" || w.unit === "kg" ? `w-${w.number}${w.unit}` : "w-box",
        label: local(w.labelAr, w.labelEn),
        price: money(p.priceAr, p.slug),
        pricePerKg:
          w.unit === "g"
            ? moneyParsed(round((parseSar(p.priceAr, p.slug) * 1000) / w.number), p.slug)
            : w.unit === "kg"
              ? money(p.priceAr, p.slug)
              : undefined,
      },
    ],
    texture: tex,
    offerLabel: offer.ar ? offer : undefined,
  };
});

function moneyParsed(amount, where) {
  if (!Number.isFinite(amount)) throw new Error(`Bad derived amount at ${where}`);
  return { amount, currency: "SAR" };
}

/** Split v2.1 composition string on "·" into trimmed lines. */
const splitLines = (s) =>
  String(s)
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);

/* ------------------------------ gifts -------------------------------- */

const giftProducts = data.gifts.map((p) => {
  const offer = {
    ar: p.offerLabelAr ?? "",
    en: p.offerLabelEn ?? "",
    ...Object.fromEntries(
      EXTRA_LOCALES.map((code) => [
        code,
        overlays[code]?.gifts?.[p.slug]?.offerLabel,
      ]).filter(([, v]) => v),
    ),
  };
  const badges = offer.ar ? [offer] : [];
  if (p.tagAr) badges.push(local(p.tagAr, p.tagEn ?? p.tagAr));
  const linesAr = p.compositionAr ? splitLines(p.compositionAr) : [];
  const linesEn = p.compositionEn ? splitLines(p.compositionEn) : [];
  const contents =
    linesAr.length > 0
      ? linesAr.map((ar, i) => local(ar, linesEn[i] ?? ar))
      : undefined;
  return {
    kind: "gift",
    id: `gift-${p.slug}`,
    slug: p.slug,
    name: withOverlay(local(p.nameAr, p.nameEn), (code) =>
      overlays[code]?.gifts?.[p.slug]?.name,
    ),
    teaser: withOverlay(local(p.teaserAr, p.teaserEn), (code) =>
      overlays[code]?.gifts?.[p.slug]?.teaser,
    ),
    images: photoPaths(p.slug, "gift"),
    price: money(p.priceAr, p.slug),
    compareAtPrice: p.regularPriceAr ? money(p.regularPriceAr, p.slug) : undefined,
    availability: "in-stock",
    badges,
    contentStatus: "demo",
    category: p.category,
    contents,
    sizeLabel: p.weight ? local(p.weight, deriveSizeEn(p.weight)) : undefined,
    occasion: p.occasion || undefined,
  };
});

/* ------------------------------ guide -------------------------------- */

const guideVarieties = data.guideVarieties.map((v) => {
  const a = v.ar;
  const e = v.en;
  const f = v.fr;
  return {
    slug: v.slug,
    number: v.number,
    nameSearch: v.nameSearch,
    title: local3(a.title, e.title, f?.title),
    caption: local3(a.caption, e.caption, f?.caption),
    origin: local3(a.origin, e.origin, f?.origin),
    intro: local3(a.intro, e.intro, f?.intro),
    timeline: mergeFr(
      zipLocalized(a.timeline, e.timeline, `${v.slug}.timeline`),
      f?.timeline,
      "event",
      `${v.slug}.timeline`,
    ),
    strengths: mergeFr(
      zipLocalized(a.strengths, e.strengths, `${v.slug}.strengths`),
      f?.strengths,
      "text",
      `${v.slug}.strengths`,
    ),
    taste: local3(a.taste, e.taste, f?.taste),
    region: region(v.region),
    texture: texture(v.texture),
    nutrition: mergeFr(
      zipLocalized(a.nutrition, e.nutrition, `${v.slug}.nutrition`),
      f?.nutrition,
      "fact",
      `${v.slug}.nutrition`,
    ),
    prices: mergeFr(
      zipLocalized(a.prices, e.prices, `${v.slug}.prices`),
      f?.prices,
      "fact",
      `${v.slug}.prices`,
    ),
    resources: a.resources
      .map((r, i) => ({
        label: local3(r.label, e.resources[i].label, f?.resources?.[i]?.label),
        href: r.href ?? e.resources[i].href,
      }))
      // v2.1 prototype shipped external links to a competing brand
      // (bateel.com). Filter them out so the guide only surfaces
      // neutral, editorial references (Plan — boutique clean-up).
      .filter((r) => !/bateel\.com/i.test(r.href)),
    displayPrice: v.displayPrice,
    productSlug: v.productSlug,
    image: `/images/guide/${v.slug}.jpg`,
    contentStatus: "demo",
  };
});

/* ---------------------------- categories ------------------------------ */

const dateCategoryImages = {
  medina: "/images/dates/ajwa-medina.jpg",
  world: "/images/dates/medjool.jpg",
  premium: "/images/dates/premium-selection.jpg",
};

const dateCategories = data.dateCategories.map((c) => ({
  slug: c.slug,
  name: withOverlay(local(c.ar, c.en), (code) =>
    overlays[code]?.dateCategories?.[c.slug]?.name,
  ),
  description: withOverlay(local(c.descAr, c.descEn), (code) =>
    overlays[code]?.dateCategories?.[c.slug]?.desc,
  ),
  image: dateCategoryImages[c.slug],
}));

const giftCategories = data.giftCategories.map((c) => ({
  slug: c.slug,
  name: withOverlay(local(c.ar, c.en), (code) =>
    overlays[code]?.giftCategories?.[c.slug]?.name,
  ),
  description: withOverlay(local(c.descAr, c.descEn), (code) =>
    overlays[code]?.giftCategories?.[c.slug]?.desc,
  ),
}));

/* ------------------------------ emit --------------------------------- */

mkdirSync(OUT, { recursive: true });

const header = ({ description, importNames }) => `// AUTO-GENERATED by resources/tools/migrate-v21.mjs — do not edit by hand.
// Regenerate: node resources/tools/migrate-v21.mjs
/* ${description} */

import type { ${importNames.join(", ")} } from "@/types/product";

`;

async function emit(name, code) {
  const formatted = await prettier.format(code, { parser: "typescript" });
  writeFileSync(join(OUT, name), formatted);
  console.log(`wrote datasets/${name}`);
}

await emit(
  "dates.ts",
  `${header({ description: "Migrated v2.1 dates catalog — 26 items. All contentStatus: 'demo'. Short content localized from v2.1 overlays (fr/tr/ur/ms/bn/id).", importNames: ["DateProduct"] })}
export const dateProducts: DateProduct[] = ${JSON.stringify(dateProducts, null, 2)};
`,
);

await emit(
  "gifts.ts",
  `${header({ description: "Migrated v2.1 gifts catalog — 25 items. All contentStatus: 'demo'. EN size labels are machine-derived; short content localized from v2.1 overlays (fr/tr/ur/ms/bn/id).", importNames: ["GiftProduct"] })}
export const giftProducts: GiftProduct[] = ${JSON.stringify(giftProducts, null, 2)};
`,
);

await emit(
  "guide.ts",
  `// AUTO-GENERATED by resources/tools/migrate-v21.mjs — do not edit by hand.
// Regenerate: node resources/tools/migrate-v21.mjs
/* Migrated v2.1 variety guide — 24 varieties (AR+EN+FR editorial; other locales fall back to EN). All contentStatus: 'demo'. */

import type { GuideVariety } from "@/types/guide";

export const guideVarieties: GuideVariety[] = ${JSON.stringify(
    guideVarieties,
    null,
    2,
  )};
`,
);

await emit(
  "categories.ts",
  `// AUTO-GENERATED by resources/tools/migrate-v21.mjs — do not edit by hand.
// Regenerate: node resources/tools/migrate-v21.mjs
/* Migrated v2.1 category info (names/descriptions; localized from v2.1 overlays for fr/tr/ur/ms/bn/id). Date-category images are LOCAL photo equivalents. */

import type { DateCategoryInfo, GiftCategoryInfo } from "@/types/product";

export const dateCategories: DateCategoryInfo[] = ${JSON.stringify(
    dateCategories,
    null,
    2,
  )};

export const giftCategories: GiftCategoryInfo[] = ${JSON.stringify(
    giftCategories,
    null,
    2,
  )};
`,
);

/* ------------------------------ report ------------------------------- */

const missing = {
  dates: dateProducts.filter((p) => !p.images || p.images.length !== 3),
  gifts: giftProducts.filter((p) => !p.images || p.images.length !== 3),
  guide: guideVarieties.filter((v) => !v.image),
};
console.log("\n--- migration report ---");
console.log(`dateProducts : ${dateProducts.length}`);
console.log(`giftProducts : ${giftProducts.length}`);
console.log(`guideVarieties: ${guideVarieties.length}`);
console.log(`dateCategories: ${dateCategories.length}; giftCategories: ${giftCategories.length}`);
console.log(
  `missing images: dates=${missing.dates.length} gifts=${missing.gifts.length} guide=${missing.guide.length}`,
);
const dupes = (arr, f) => arr.map(f).filter((x, i, a) => a.indexOf(x) !== i);
console.log(`duplicate slugs: dates=${dupes(dateProducts, (p) => p.slug).length} gifts=${dupes(giftProducts, (p) => p.slug).length} guide=${dupes(guideVarieties, (v) => v.slug).length}`);
console.log("done ✓");