import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { ArticleCard } from "@/components/blog/article-card";
import { staticBlogRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/config/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/${locale}/blog`,
  });
}

/**
 * Blog listing (Plan §5 step 1–2) — SSG over the 8 locales. Renders the
 * published posts newest-first via `ArticleCard` (cover image, category,
 * date, excerpt); shows the localized empty state while the dataset is empty.
 */
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const localeTyped = locale as Locale;
  const posts = await staticBlogRepository.getPosts();

  return (
    <>
      <CatalogHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {posts.length === 0 ? (
          <p className="mx-auto max-w-xl text-center text-muted">{t("empty")}</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {posts.map((post) => (
              <li key={post.slug}>
                <ArticleCard
                  post={post}
                  locale={localeTyped}
                  categoryLabel={t(`categories.${post.category}`)}
                  readMore={t("readMore")}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}