import type { LocalizedText, ContentStatus } from "./localization";

/**
 * Blog model (Plan — Blog statique §4.1).
 * Editorial content authored per language; missing locales resolve to English
 * via `pick()` — exactly like the guide data. UI labels live in
 * `src/messages/*.json` (next-intl "blog" namespace).
 */
export type BlogCategory = "ramadan" | "nutrition" | "recipes" | "story";

/** One structured content block — JSON-only (no MDX dependency, Plan §4.2). */
export type BlogBlock =
  | { kind: "paragraph"; text: LocalizedText }
  | { kind: "list"; items: LocalizedText[] }
  | { kind: "quote"; text: LocalizedText }
  | {
      /** Localized table (prices/recommendations) — Plan §3.1 hub table. */
      kind: "table";
      caption?: LocalizedText;
      columns: LocalizedText[];
      rows: LocalizedText[][];
    }
  | {
      /** Conversion CTA — WhatsApp deep link (Plan §3.1) + internal page links. */
      kind: "cta";
      text: LocalizedText;
      whatsappLabel: LocalizedText;
      whatsappMessage: LocalizedText;
      links: { label: LocalizedText; href: string }[];
    };

export interface BlogSection {
  /** Optional section heading. */
  heading?: LocalizedText;
  blocks: BlogBlock[];
}

export interface BlogFaqEntry {
  q: LocalizedText;
  a: LocalizedText;
}

export interface BlogPost {
  /** Stable URL slug (e.g. "guide-achat-ramadan"). */
  slug: string;
  category: BlogCategory;
  /** ISO 8601 publication date (e.g. "2026-12-20"). */
  date: string;
  /** Local image path under /images/blog (optional in V1). */
  coverImage?: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  sections: BlogSection[];
  /** Linked catalog product slugs (step 2 CTA cards). */
  productSlugs: string[];
  /** Optional FAQ list → JSON-LD FAQPage (step 2 onward). */
  faq?: BlogFaqEntry[];
  contentStatus: ContentStatus;
}

/** Data-repository contract (mirrors `GuideRepository`, types/commerce.ts). */
export interface BlogRepository {
  getPosts(): Promise<BlogPost[]>;
  getPost(slug: string): Promise<BlogPost | null>;
}