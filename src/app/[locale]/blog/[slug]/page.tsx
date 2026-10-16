import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection, routing } from "@/i18n/routing";
import { pick, staticBlogRepository } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { ProductCta } from "@/components/blog/product-cta";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import { localeMeta } from "@/lib/config/locales";
import type { BlogBlock } from "@/types/blog";
import type { Locale } from "@/lib/config/locales";

/** Pre-render every post in every locale (SSG). Empty dataset → [] — 404s. */
export async function generateStaticParams() {
  const posts = await staticBlogRepository.getPosts();
  return posts.flatMap((post) =>
    routing.locales.map((locale) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await staticBlogRepository.getPost(slug);
  if (!post) return {};
  const lang = locale as Locale;
  return buildPageMetadata({
    title: pick(post.title, lang),
    description: pick(post.excerpt, lang),
    path: `/${locale}/blog/${slug}`,
    images: post.coverImage ? [post.coverImage] : [],
  });
}

/** Renders one typed content block (Plan §4.1 — no MDX, JSON only). */
function BlogBlockView({
  block,
  locale,
}: {
  block: BlogBlock;
  locale: Locale;
}) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-charcoal/85">
          {pick(block.text, locale)}
        </p>
      );
    case "list":
      return (
        <ul className="space-y-3" role="list">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-base leading-relaxed text-charcoal/85"
            >
              <span
                aria-hidden="true"
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
              />
              {pick(item, locale)}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="rounded-3xl border border-gold/50 bg-gold-light/30 p-6 text-lg italic leading-relaxed text-forest">
          {pick(block.text, locale)}
        </blockquote>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          {block.caption ? (
            <p className="px-4 pt-4 text-sm font-semibold text-forest">
              {pick(block.caption, locale)}
            </p>
          ) : null}
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-ivory-deep">
                {block.columns.map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-3 text-start font-semibold text-forest"
                  >
                    {pick(col, locale)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-line/60 last:border-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-3 align-top text-charcoal/85"
                    >
                      {pick(cell, locale)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div className="rounded-3xl border border-gold/50 bg-gold-light/30 p-6 sm:p-8">
          <p className="text-lg font-semibold leading-relaxed text-forest">
            {pick(block.text, locale)}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={buildWhatsAppUrl(pick(block.whatsappMessage, locale), locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <WhatsAppLogo className="h-4 w-4" />
              {pick(block.whatsappLabel, locale)}
            </a>
            {block.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-white px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {pick(link.label, locale)}
                <span aria-hidden="true">
                  {getDirection(locale) === "rtl" ? "\u2190" : "\u2192"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const localeTyped = locale as Locale;
  const post = await staticBlogRepository.getPost(slug);
  if (!post) notFound();

  const faq = post.faq ?? [];
  const hasFaq = faq.length > 0;
  const dateFormatter = new Intl.DateTimeFormat(localeMeta[localeTyped].bcp47, {
    dateStyle: "long",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pick(post.title, localeTyped),
    description: pick(post.excerpt, localeTyped),
    datePublished: post.date,
    articleSection: t(`categories.${post.category}`),
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-forest"
        >
          <span aria-hidden="true">
            {getDirection(locale) === "rtl" ? "\u2192" : "\u2190"}
          </span>
          {t("back")}
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-gold-light/50 px-3 py-1 text-xs font-semibold text-date-deep">
              {t(`categories.${post.category}`)}
            </span>
            <time dateTime={post.date} className="text-xs text-muted">
              {t("published")}: {dateFormatter.format(new Date(post.date))}
            </time>
          </div>
          <h1 className="mt-4 font-arabic-display text-3xl font-bold leading-tight text-forest sm:text-4xl">
            {pick(post.title, localeTyped)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-date-deep/90">
            {pick(post.excerpt, localeTyped)}
          </p>
        </header>

        {post.coverImage ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-ivory-deep">
            <Image
              src={post.coverImage}
              alt={pick(post.title, localeTyped)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}

        <article className="mt-12 space-y-10">
          {post.sections.map((section, i) => (
            <section key={i}>
              {section.heading ? (
                <h2 className="mb-4 font-arabic-display text-2xl font-bold text-forest">
                  {pick(section.heading, localeTyped)}
                </h2>
              ) : null}
              <div className="space-y-4">
                {section.blocks.map((block, j) => (
                  <BlogBlockView key={j} block={block} locale={localeTyped} />
                ))}
              </div>
            </section>
          ))}
        </article>

        <ProductCta
          productSlugs={post.productSlugs}
          locale={localeTyped}
          heading={t("shopProducts")}
          button={t("discover")}
        />

        {hasFaq ? (
          <section className="mt-14" aria-labelledby="blog-faq-title">
            <h2
              id="blog-faq-title"
              className="mb-5 font-arabic-display text-2xl font-bold text-forest"
            >
              {t("faq")}
            </h2>
            <dl className="space-y-3">
              {faq.map((entry, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-line bg-white p-5"
                >
                  <dt className="font-semibold text-forest">
                    {pick(entry.q, localeTyped)}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">
                    {pick(entry.a, localeTyped)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {hasFaq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((entry) => ({
                "@type": "Question",
                name: pick(entry.q, localeTyped),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: pick(entry.a, localeTyped),
                },
              })),
            }),
          }}
        />
      ) : null}
    </>
  );
}