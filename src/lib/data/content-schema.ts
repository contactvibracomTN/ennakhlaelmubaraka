/**
 * Runtime content validation (admin-driven JSON store).
 *
 * The catalog/gifts/blog/categories/guide data now lives in `content/*.json`,
 * edited through the /admin panel. These zod schemas are the guardrail:
 * every dataset module parses its JSON at import time and throws a clear
 * error if an admin save ever produced malformed content — long before a
 * broken page could be served. `.passthrough()` keeps unknown keys intact
 * (no silent data loss) while still validating the known structure.
 */
import { z } from "zod";
import type { DateProduct, GiftProduct } from "@/types/product";
import type { BlogPost } from "@/types/blog";
import type { GuideVariety } from "@/types/guide";
import type { Testimonial } from "@/types/testimonial";

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
    imageAlts: z.record(z.string(), localizableSchema).optional(),
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
    imageAlts: z.record(z.string(), localizableSchema).optional(),
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

const guideRegionSchema = z.enum(["maghreb", "mashriq", "gulf", "oman", "egypt"]);

const guideTimelineEventSchema = z
  .object({ label: localizableSchema, text: localizableSchema })
  .passthrough();

const guideNutritionFactSchema = z
  .object({ label: localizableSchema, value: localizableSchema })
  .passthrough();

const guideResourceSchema = z
  .object({ label: localizableSchema, href: z.string() })
  .passthrough();

const guideVarietySchema = z
  .object({
    slug: z.string(),
    number: z.string(),
    nameSearch: z.string(),
    title: localizableSchema,
    caption: localizableSchema,
    origin: localizableSchema,
    intro: localizableSchema,
    timeline: z.array(guideTimelineEventSchema),
    strengths: z.array(localizableSchema),
    taste: localizableSchema,
    region: guideRegionSchema,
    texture: textureSchema,
    nutrition: z.array(guideNutritionFactSchema),
    resources: z.array(guideResourceSchema),
    productSlug: z.string(),
    ctaLabel: localizableSchema.optional(),
    image: z.string(),
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
/* testimonials                                                       */
/* ------------------------------------------------------------------ */

const testimonialStatusSchema = z.enum(["pending", "published", "archived"]);
const testimonialSourceSchema = z.enum(["website", "in-store", "import"]);

/**
 * Stored record — validated when the public site reads the JSON store and when
 * the admin saves. `.passthrough()` keeps forward-compatible fields.
 */
const testimonialSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(120),
    whatsapp: z.string().max(40),
    job: z.string().max(120).optional(),
    nationality: z.string().max(80).optional(),
    message: z.string().min(1).max(2000),
    rating: z.number().int().min(1).max(5),
    locale: z.string().min(2).max(8),
    status: testimonialStatusSchema,
    source: testimonialSourceSchema,
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    publishedAt: z.string().optional(),
    publishedText: z.record(z.string(), z.string()).optional(),
    adminNote: z.string().max(2000).optional(),
    order: z.number().optional(),
  })
  .passthrough();

/**
 * Public submission payload. Kept deliberately strict: this is the only
 * unauthenticated write path in the app.
 */
export const testimonialSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[+\d\s().-]+$/),
  job: z.string().trim().max(80).optional().default(""),
  nationality: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
  locale: z.string().min(2).max(8).optional().default("ar"),
});

export type TestimonialSubmission = z.infer<typeof testimonialSubmissionSchema>;

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

export function parseGuideVarieties(input: unknown): GuideVariety[] {
  return guideVarietySchema.array().parse(input) as unknown as GuideVariety[];
}

export function validateGuideVariety(input: unknown): GuideVariety {
  return guideVarietySchema.parse(input) as unknown as GuideVariety;
}

export function parseCategories(input: unknown): {
  dates: Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>;
  gifts: Array<{ slug: string; name: Record<string, string>; description?: Record<string, string>; image?: string }>;
} {
  return categoriesSchema.parse(input) as never;
}

export function parseTestimonials(input: unknown): Testimonial[] {
  return testimonialSchema.array().parse(input) as unknown as Testimonial[];
}

export function validateTestimonial(input: unknown): Testimonial {
  return testimonialSchema.parse(input) as unknown as Testimonial;
}