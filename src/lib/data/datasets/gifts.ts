/**
 * Gifts catalog — migrated from v2.1 (25 items, all `contentStatus: "demo"`).
 *
 * ⚠️ EDITORIAL CONTENT NOW LIVES IN `./content/gifts.json`, edited through the
 * /admin panel. This module only re-validates and re-exports that JSON.
 *
 * Legacy note: regenerating via `node resources/tools/migrate-v21.mjs` would
 * overwrite the JSON store — do not run it anymore.
 */

import type { GiftProduct } from "@/types/product";
import content from "../content/gifts.json";
import { parseGiftProducts } from "@/lib/data/content-schema";

export const giftProducts: GiftProduct[] = parseGiftProducts(content);