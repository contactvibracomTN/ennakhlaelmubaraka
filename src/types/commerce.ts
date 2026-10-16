import type { Product } from "./product";
import type { GuideVariety } from "./guide";
import type { OrderDraft, OrderResult } from "./checkout";

/**
 * Data-repository contracts (brief §47, Blueprint §5/§12).
 * V1 implementation: static datasources. Future: database / CMS / Salla adapter
 * behind the same interfaces — the UI never changes.
 */
export interface ProductRepository {
  getDateProducts(): Promise<Product[]>;
  getGiftProducts(): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getFeatured(): Promise<Product[]>;
  getBestSellers(): Promise<Product[]>;
  getRelatedToVariety(varietySlug: string): Promise<Product[]>;
  search(term: string): Promise<Product[]>;
}

export interface GuideRepository {
  getVarieties(): Promise<GuideVariety[]>;
  getVariety(slug: string): Promise<GuideVariety | null>;
  search(term: string): Promise<GuideVariety[]>;
}

export type CommerceRepository = ProductRepository & GuideRepository;

/**
 * Commerce provider (Blueprint §12). The V1 implementation is a mock that ships
 * the order to WhatsApp + optional webhook. No payment is ever taken in mock
 * mode.
 */
export interface CommerceProvider {
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  createOrder(draft: OrderDraft): Promise<OrderResult>;
}
