/**
 * Data layer (Phase 0) — typed datasets + static repositories + mock
 * commerce provider. UI/features consume ONLY this index; datasets are
 * auto-generated (see resources/tools/migrate-v21.mjs).
 */

export { dateProducts } from "@/lib/data/datasets/dates";
export { giftProducts } from "@/lib/data/datasets/gifts";
export { guideVarieties } from "@/lib/data/datasets/guide";
export { blogPosts } from "@/lib/data/datasets/blog";
export { dateCategories, giftCategories } from "@/lib/data/datasets/categories";

export { staticProductRepository } from "@/lib/data/product-repository";
export { staticGuideRepository } from "@/lib/data/guide-repository";
export { staticBlogRepository } from "@/lib/data/blog-repository";
export { mockCommerceProvider } from "@/lib/data/commerce-provider";
export { pick, imageAlt } from "@/lib/data/localize";
