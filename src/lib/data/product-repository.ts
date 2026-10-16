import type { Product } from "@/types/product";
import type { ProductRepository } from "@/types/commerce";
import { dateProducts } from "@/lib/data/datasets/dates";
import { giftProducts } from "@/lib/data/datasets/gifts";

/**
 * Static ProductRepository (Blueprint §5/§12) — V1 reads from the migrated
 * typed datasets. Swap for a database/CMS/Salla adapter behind the same
 * interface without touching the UI.
 */

const allProducts: Product[] = [...dateProducts, ...giftProducts];

const bySlug = new Map(allProducts.map((p) => [p.slug, p]));

const searchable = (p: Product) =>
  [p.slug, p.name.ar, p.name.en, p.teaser.ar, p.teaser.en]
    .join(" ")
    .toLowerCase();

/**
 * Demo curation for Phase 2 (featured / best-sellers) — now only a FALLBACK.
 * ⚠️ Real sales data does not exist yet, so the owner flags products by hand
 * via the admin checkboxes (`featured` / `bestSeller`, PO 2026-10). When no
 * product carries the flag, these explicit placeholders keep the homepage
 * section populated until the owner confirms the actual best sellers.
 */
const DEMO_FEATURED_SLUGS = [
  "ajwa",
  "safawi",
  "sukkari",
  "signature-box",
  "royal-stuffed-date-box",
] as const;

export class StaticProductRepository implements ProductRepository {
  async getDateProducts(): Promise<Product[]> {
    return dateProducts;
  }

  async getGiftProducts(): Promise<Product[]> {
    return giftProducts;
  }

  async getAllProducts(): Promise<Product[]> {
    return allProducts;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return bySlug.get(slug) ?? null;
  }

  async getFeatured(): Promise<Product[]> {
    return this.byFlag("featured");
  }

  async getBestSellers(): Promise<Product[]> {
    // Real sales data does not exist yet: the owner flags best sellers by hand
    // in the admin (PO 2026-10). Fall back to the demo curation while no
    // product is flagged, so the homepage section is never empty.
    return this.byFlag("bestSeller");
  }

  /** Products flagged in the admin; demo curation when nothing is flagged. */
  private byFlag(flag: "featured" | "bestSeller"): Product[] {
    const flagged = allProducts.filter((p) => p[flag]);
    if (flagged.length > 0) return flagged.slice(0, 10);
    return this.pickBySlugs(DEMO_FEATURED_SLUGS);
  }

  /** Date products whose variety links to the given guide slug. */
  async getRelatedToVariety(varietySlug: string): Promise<Product[]> {
    return dateProducts.filter((p) => p.varietySlug === varietySlug);
  }

  async search(term: string): Promise<Product[]> {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter((p) => searchable(p).includes(q));
  }

  private pickBySlugs(slugs: readonly string[]): Product[] {
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is Product => Boolean(p));
  }
}

/** Shared singleton for the app (and for the mock CommerceProvider). */
export const staticProductRepository = new StaticProductRepository();
