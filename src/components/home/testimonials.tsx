import { getLocale, getTranslations } from "next-intl/server";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import { siteConfig } from "@/lib/config/site.config";
import { getLocaleMeta } from "@/lib/config/locales";
import { resolveTestimonialText, type Testimonial } from "@/types/testimonial";
import type { Locale } from "@/lib/config/locales";
import { TestimonialForm } from "./testimonial-form";

const MAX_CARDS = 9;

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${
            star <= value ? "fill-gold-deep text-gold-deep" : "fill-transparent text-line"
          }`}
        />
      ))}
    </span>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string, bcp47: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(bcp47, { year: "numeric", month: "short" }).format(date);
}

function sortPublished(list: Testimonial[]): Testimonial[] {
  return list
    .filter((item) => item.status === "published")
    .sort((a, b) => {
      const byOrder = (a.order ?? 0) - (b.order ?? 0);
      if (byOrder !== 0) return byOrder;
      return (
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
      );
    });
}

/**
 * Homepage social-proof section ("آراء عملائنا").
 *
 * Only `published` records are shown; the WhatsApp number and internal notes
 * never leave the admin panel. The CTA opens the accordion form below.
 */
export async function Testimonials() {
  const t = await getTranslations("testimonials");
  const locale = (await getLocale()) as Locale;
  const bcp47 = getLocaleMeta(locale)?.bcp47 ?? locale;

  const published = sortPublished(testimonials);
  const visible = published.slice(0, MAX_CARDS);
  const average =
    published.length > 0
      ? published.reduce((sum, item) => sum + item.rating, 0) / published.length
      : 0;

  const cards = visible.map((item) => ({
    id: item.id,
    name: item.name,
    job: item.job,
    nationality: item.nationality,
    rating: item.rating,
    text: resolveTestimonialText(item, locale),
    date: formatDate(item.publishedAt ?? item.createdAt, bcp47),
    isoDate: (item.publishedAt ?? item.createdAt).slice(0, 10),
  }));

  const jsonLd =
    published.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Store",
          name: siteConfig.brand.nameEn,
          url: siteConfig.siteUrl,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Madinah",
            addressCountry: "SA",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(average.toFixed(1)),
            reviewCount: published.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: cards.slice(0, 10).map((item) => ({
            "@type": "Review",
            author: { "@type": "Person", name: item.name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: item.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: item.text,
            datePublished: item.isoDate,
          })),
        }
      : null;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative overflow-hidden bg-ivory-deep/50"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest text-date-soft uppercase">
            {t("eyebrow")}
          </p>
          <h2
            id="testimonials-title"
            className="mt-2 font-arabic-display text-3xl font-bold text-forest sm:text-4xl"
          >
            {t("title")}
          </h2>
          <div aria-hidden="true" className="rule-gold mx-auto mt-4 w-24" />
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t("subtitle")}</p>
        </div>

        {cards.length > 0 ? (
          <>
            <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
              <Stars value={Math.round(average)} label={t("starLabel", { value: average.toFixed(1) })} />
              <p className="text-sm text-muted">
                <span className="text-base font-bold text-forest">{average.toFixed(1)}</span>
                <span aria-hidden="true" className="mx-1.5">
                  ·
                </span>
                {t("countLabel", { count: published.length })}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((item) => (
                <article
                  key={item.id}
                  className="relative flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Quote
                    aria-hidden="true"
                    className="absolute end-5 top-5 h-8 w-8 text-gold/25"
                  />
                  <Stars value={item.rating} label={t("starLabel", { value: item.rating })} />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-charcoal">
                    {item.text}
                  </blockquote>
                  <footer className="mt-5 flex items-center gap-3 border-t border-line/70 pt-4">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-gold-light"
                    >
                      {initials(item.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-forest">{item.name}</p>
                      {item.job || item.nationality ? (
                        <p className="truncate text-xs text-muted">
                          {[item.job, item.nationality].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      {item.date ? (
                        <p className="mt-0.5 text-[11px] text-muted/80">
                          {t("publishedOn", { date: item.date })}
                        </p>
                      ) : null}
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-dashed border-gold-deep/40 bg-white/70 px-6 py-10 text-center">
            <Quote aria-hidden="true" className="mx-auto h-9 w-9 text-gold-deep/50" />
            <h3 className="mt-4 font-arabic-display text-xl font-bold text-forest">
              {t("emptyTitle")}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              {t("emptyText")}
            </p>
          </div>
        )}

        <TestimonialForm />

        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </div>
    </section>
  );
}
