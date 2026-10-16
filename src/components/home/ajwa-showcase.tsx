import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import { pick, staticBlogRepository, staticProductRepository } from "@/lib/data";
import type { Locale } from "@/lib/config/locales";

/** The two blog articles endorsing the Ajwa section (PO 2026-09). */
const AJWA_ARTICLE_SLUGS = ["ajwa-medina-nutrition", "ajwa-origin-story"] as const;

/**
 * Dedicated Ajwa flagship section (PO 2026-09, request 3).
 * - `full`   : homepage section (deep-forest panel, image + CTA + articles).
 * - `compact`: banner shown inside the Medina section of the dates catalogue.
 * All copy is localized (`ajwa` message scope); article titles come from the
 * real blog dataset — nothing invented (Blueprint §11).
 */
export async function AjwaShowcase({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const t = await getTranslations("ajwa");
  const locale = (await getLocale()) as Locale;
  const forward = getDirection(locale) === "rtl" ? "\u2190" : "\u2192";

  const dates = await staticProductRepository.getDateProducts();
  const flagship = dates.find((p) => p.slug === "ajwa") ?? null;

  const posts = await staticBlogRepository.getPosts();
  const articles = AJWA_ARTICLE_SLUGS.map((slug) =>
    posts.find((p) => p.slug === slug),
  ).filter((p) => p !== undefined);

  const image = flagship?.images[0] ?? "/images/dates/ajwa.jpg";
  const imageAlt = flagship ? pick(flagship.name, locale) : t("title");

  if (variant === "compact") {
    return (
      <section
        aria-labelledby="ajwa-title"
        className="my-4 overflow-hidden rounded-2xl bg-forest text-ivory"
      >
        <div className="grid items-center gap-5 p-5 sm:p-6 md:grid-cols-[auto_1fr_auto]">
          <Image
            src={image}
            alt={imageAlt}
            width={320}
            height={240}
            className="size-28 rounded-xl border-2 border-gold/40 object-cover sm:size-32"
          />
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold-light uppercase">
              {t("eyebrow")}
            </p>
            <h2
              id="ajwa-title"
              className="mt-1 font-arabic-display text-xl font-bold text-ivory sm:text-2xl"
            >
              {t("title")}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory/75">
              {t("lead")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dates/ajwa"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-gold-light"
            >
              {t("ctaBuy")}
            </Link>
            <div className="flex flex-col gap-1 text-sm">
              {articles.map((post) => (
                <Link
                  key={post!.slug}
                  href={`/blog/${post!.slug}`}
                  className="inline-flex items-center gap-1.5 text-gold-light transition-colors hover:text-ivory"
                >
                  <span className="max-w-[16rem] truncate">
                    {pick(post!.title, locale)}
                  </span>
                  <span aria-hidden>{forward}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="ajwa-title" className="bg-forest text-ivory">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative">
            <Image
              src={image}
              alt={imageAlt}
              width={800}
              height={600}
              className="aspect-[4/3] w-full rounded-2xl border-4 border-gold/40 object-cover"
            />
            <p className="absolute bottom-4 inset-inline-start-4 rounded-full bg-bordeaux px-3 py-1 text-xs font-semibold text-ivory shadow-lg">
              {t("priceLabel")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-widest text-gold-light uppercase">
              {t("eyebrow")}
            </p>
            <h2
              id="ajwa-title"
              className="mt-2 font-arabic-display text-3xl font-bold text-ivory sm:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ivory/80">
              {t("lead")}
            </p>

            <ul className="mt-5 space-y-2">
              {t.raw("bullets").map((bullet: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-ivory/85"
                >
                  <span aria-hidden className="mt-0.5 text-gold">
                    ✦
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/dates/ajwa"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest transition-colors hover:bg-gold-light"
              >
                {t("ctaBuy")}
                <span aria-hidden>{forward}</span>
              </Link>
            </div>

            <div className="mt-8 border-t border-ivory/15 pt-6">
              <p className="text-xs font-semibold tracking-widest text-gold-light uppercase">
                {t("readArticles")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {articles.map((post) => (
                  <Link
                    key={post!.slug}
                    href={`/blog/${post!.slug}`}
                    className="group rounded-xl border border-ivory/15 bg-ivory/5 p-4 transition-colors hover:border-gold/60 hover:bg-ivory/10"
                  >
                    <span className="block text-sm font-semibold leading-snug text-ivory group-hover:text-gold-light">
                      {pick(post!.title, locale)}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold-light">
                      <span aria-hidden>{forward}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}