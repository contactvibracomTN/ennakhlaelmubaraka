/**
 * Runtime content validation (admin-driven JSON store).
 *
 * The catalog/gifts/blog/categories data now lives in `content/*.json`,
 * edited through the /admin panel. These zod schemas are the guardrail:
 * every dataset module parses its JSON at import time and throws a clear
 * error if an admin save ever produced malformed content — long before a
 * broken page could be served. `.passthrough()` keeps unknown keys intact
 * (no silent data loss) while still validating the known structure.
 */
import { z } from "zod";
import type { DateProduct, GiftProduct } from "@/types/product";
import type { BlogPost } from "@/types/blog";

export const LOCALES = ["ar", "en", "fr", "tr", "ur", "ms", "bn", "id"] as const;

/** A per-language block: `{ ar: "...", en: "...", ... }`. */
export const localizableSchema = z.record(z.string(), z.string());

const moneySchema = z.object({
  amount: z.number(),
  currency: z.literal("SAR"),
});

const contentStatusSchema = z.enum(["draft", "demo", "validated", "published"]);
const availabilitySchema = z.enum(["in-stock", "out-of-stock", "preorder"]);
const textureSchema = z.enum(["soft", "semi-soft", "dry"]);

const weightOptionSchema = z
  .object({
    id: z.string(),
    label: localizableSchema,
    price: moneySchema,
    pricePerKg: moneySchema.optional(),
  })
  .passthrough();

const gradeSchema = z
  .object({
    id: z.string(),
    label: localizableSchema,
    pricePerKg: moneySchema,
    tier: z.enum(["premium", "medium", "economic"]).optional(),
    images: z.array(z.string()).optional(),
  })
  .passthrough();

const productBaseSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: localizableSchema,
    teaser: localizableSchema,
    description: localizableSchema.optional(),
    images: z.array(z.string()),
    price: moneySchema,
    compareAtPrice: moneySchema.optional(),
    availability: availabilitySchema,
    badges: z.array(localizableSchema).optional(),
    contentStatus: contentStatusSchema,
    featured: z.boolean().optional(),
    bestSeller: z.boolean().optional(),
  })
  .passthrough();

const dateProductSchema = productBaseSchema.extend({
  kind: z.literal("date"),
  category: z.enum(["medina", "kingdom"]),
  varietySlug: z.string().optional(),
  origin: localizableSchema,
  unit: z.enum(["kg", "box"]),
  weightOptions: z.array(weightOptionSchema),
  grades: z.array(gradeSchema).optional(),
  defaultGradeId: z.string().optional(),
  texture: textureSchema.optional(),
  offerLabel: localizableSchema.optional(),
});

const giftProductSchema = productBaseSchema.extend({
  kind: z.literal("gift"),
  category: z.enum(["personal", "occasions", "date-products"]),
  contents: z.array(localizableSchema).optional(),
  bundleOf: z.array(z.string()).optional(),
  sizeLabel: localizableSchema.optional(),
  occasion: z.enum(["visit", "ramadan", "eid", "wedding"]).optional(),
  isConceptual: z.boolean().optional(),
});

const blogCategorySchema = z.enum(["ramadan", "nutrition", "recipes", "story"]);

const blogParagraphSchema = z
  .object({ kind: z.literal("paragraph"), text: localizableSchema })
  .passthrough();
const blogListSchema = z
  .object({ kind: z.literal("list"), items: z.array(localizableSchema) })
  .passthrough();
const blogQuoteSchema = z
  .object({ kind: z.literal("quote"), text: localizableSchema })
  .passthrough();
const blogTableSchema = z
  .object({
    kind: z.literal("table"),
    caption: localizableSchema.optional(),
    columns: z.array(localizableSchema),
    rows: z.array(z.array(localizableSchema)),
  })
  .passthrough();
const blogCtaSchema = z
  .object({
    kind: z.literal("cta"),
    text: localizableSchema,
    whatsappLabel: localizableSchema,
    whatsappMessage: localizableSchema,
    links: z.array(z.object({ label: localizableSchema, href: z.string() })),
  })
  .passthrough();

const blogBlockSchema = z.discriminatedUnion("kind", [
  blogParagraphSchema,
  blogListSchema,
  blogQuoteSchema,
  blogTableSchema,
  blogCtaSchema,
]);

const blogSectionSchema = z
  .object({
    heading: localizableSchema.optional(),
    blocks: z.array(blogBlockSchema),
  })
  .passthrough();

const blogPostSchema = z
  .object({
    slug: z.string(),
    category: blogCategorySchema,
    date: z.string(),
    coverImage: z.string().optional(),
    title: localizableSchema,
    excerpt: localizableSchema,
    sections: z.array(blogSectionSchema),
    productSlugs: z.array(z.string()),
    faq: z.array(z.object({ q: localizableSchema, a: localizableSchema })).optional(),
    contentStatus: contentStatusSchema,
  })
  .passthrough();

const categoryInfoSchema = z
  .object({
    slug: z.string(),
    name: localizableSchema,
    description: localizableSchema.optional(),
    image: z.string().optional(),
  })
  .passthrough();

const categoriesSchema = z.object({
  dates: z.array(categoryInfoSchema),
  gifts: z.array(categoryInfoSchema),
});

/* ------------------------------------------------------------------ */

export function parseDateProducts(input: unknown): DateProduct[] {
  return dateProductSchema.array().parse(input) as unknown as DateProduct[];
}

export function validateDateProduct(input: unknown): DateProduct {
  return dateProductSchema.parse(input) as unknown as DateProduct;
}

export function validateGiftProduct(input: unknown): GiftProduct {
  return giftProductSchema.parse(input) as unknown as GiftProduct;
}

export function validateBlogPost(input: unknown): BlogPost {
  return blogPostSchema.parse(input) as unknown as BlogPost;
}

export function parseGiftProducts(input: unknown): GiftProduct[] {
  return giftProductSchema.array().parse(input) as unknown as GiftProduct[];
}

export function parseBlogPosts(input: unknown): BlogPost[] {
  return blogPostSchema.array().parse(input) as unknown as BlogPost[];
}

export function parseCategories(input: unknown): {
  dates: Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>;
  gifts: Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>;
} {
  return categoriesSchema.parse(input) as never;
}