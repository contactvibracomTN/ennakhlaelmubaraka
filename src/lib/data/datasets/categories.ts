/**
 * Category info (names/descriptions) — migrated from v2.1, localized for all
 * locales. Date-category images are LOCAL photo equivalents.
 * V3 (PO 2026-09-29): dates categories = "medina" (تمور المدينة) +
 * "kingdom" (تمور المملكة); the old "world"/"premium" categories were removed.
 *
 * ⚠️ EDITORIAL CONTENT NOW LIVES IN `./content/categories.json`, edited through
 * the /admin panel. This module re-validates and re-exports it.
 */

import type { DateCategoryInfo, GiftCategoryInfo } from "@/types/product";
import content from "../content/categories.json";
import { parseCategories } from "@/lib/data/content-schema";

const categories = parseCategories(content);

export const dateCategories = categories.dates as unknown as DateCategoryInfo[];
export const giftCategories = categories.gifts as unknown as GiftCategoryInfo[];