/**
 * Dates variety guide — EDITORIAL CONTENT NOW LIVES IN `content/guide.json`,
 * edited through /admin/guide (browser forms + machine translation + human
 * validation). This module only re-validates and re-exports that JSON so a
 * malformed save can never be served silently.
 *
 * The guide is purely editorial: it never shows prices. Varieties sold in the
 * boutique carry a `productSlug` + an optional localized `ctaLabel`.
 *
 * Legacy note: the former hand-maintained dataset (v2.1 migration, 24 entries
 * with market prices) was replaced by this JSON store; its generator script
 * (`resources/tools/migrate-v21.mjs`) must NOT be run anymore.
 */

import content from "../content/guide.json";
import { parseGuideVarieties } from "@/lib/data/content-schema";

export const guideVarieties = parseGuideVarieties(content);
