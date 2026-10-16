import type { BlogPost, BlogRepository } from "@/types/blog";
import { blogPosts } from "@/lib/data/datasets/blog";

/**
 * Static BlogRepository (Plan §5 step 1) — reads the typed blog dataset
 * (newest first). Like the guide/product repositories, pages consume ONLY this
 * contract; a future headless CMS can replace it without touching the UI.
 */
const bySlug = new Map(blogPosts.map((post) => [post.slug, post]));

export class StaticBlogRepository implements BlogRepository {
  async getPosts(): Promise<BlogPost[]> {
    return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    return bySlug.get(slug) ?? null;
  }
}

/** Shared singleton for the app. */
export const staticBlogRepository = new StaticBlogRepository();