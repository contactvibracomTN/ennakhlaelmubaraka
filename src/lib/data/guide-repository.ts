import type { GuideVariety } from "@/types/guide";
import type { GuideRepository } from "@/types/commerce";
import { guideVarieties } from "@/lib/data/datasets/guide";

/**
 * Static GuideRepository (Blueprint §5) — reads the admin-edited guide
 * (`content/guide.json`): 19 varieties, no prices, CTA only for the varieties
 * actually sold in the boutique.
 */

const bySlug = new Map(guideVarieties.map((v) => [v.slug, v]));

const searchable = (v: GuideVariety) =>
  [v.slug, v.nameSearch, v.title.ar, v.title.en].join(" ").toLowerCase();

export class StaticGuideRepository implements GuideRepository {
  async getVarieties(): Promise<GuideVariety[]> {
    return guideVarieties;
  }

  async getVariety(slug: string): Promise<GuideVariety | null> {
    return bySlug.get(slug) ?? null;
  }

  async search(term: string): Promise<GuideVariety[]> {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return guideVarieties.filter((v) => searchable(v).includes(q));
  }
}

/** Shared singleton for the app. */
export const staticGuideRepository = new StaticGuideRepository();
