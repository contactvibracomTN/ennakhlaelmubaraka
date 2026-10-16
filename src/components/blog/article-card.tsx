import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import { pick } from "@/lib/data";
import { localeMeta } from "@/lib/config/locales";
import type { BlogPost } from "@/types/blog";
import type { Locale } from "@/lib/config/locales";

/**
 * Blog article card (Plan §4) — used by the /blog listing. Renders the
 * localized cover image (when provided), category badge, date, title and
 * excerpt; links to /blog/[slug].
 */
export function ArticleCard({
  post,
  locale,
  categoryLabel,
  readMore,
}: {
  post: BlogPost;
  locale: Locale;
  categoryLabel: string;
  readMore: string;
}) {
  const dateFormatter = new Intl.DateTimeFormat(localeMeta[locale].bcp47, {
    dateStyle: "medium",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {post.coverImage ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-ivory-deep">
          <Image
            src={post.coverImage}
            alt={pick(post.title, locale)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-gold-light/50 px-2.5 py-1 text-[0.65rem] font-semibold text-date-deep">
            {categoryLabel}
          </span>
          <time dateTime={post.date} className="text-[0.65rem] text-muted">
            {dateFormatter.format(new Date(post.date))}
          </time>
        </div>
        <h2 className="mt-3 font-arabic-display text-lg font-bold leading-snug text-forest">
          {pick(post.title, locale)}
        </h2>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {pick(post.excerpt, locale)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
          {readMore}
          <span aria-hidden="true">
            {getDirection(locale) === "rtl" ? "\u2190" : "\u2192"}
          </span>
        </span>
      </div>
    </Link>
  );
}