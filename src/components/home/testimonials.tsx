import { getLocale, getTranslations } from "next-intl/server";
import { Quote, Star } from "lucide-react";
import { siteConfig } from "@/lib/config/site.config";
import { COUNTRY_CODES, countryName, flagClass } from "@/lib/config/countries";
import { getLocaleMeta } from "@/lib/config/locales";
import { readPublishedTestimonials } from "@/lib/testimonials/store";
import { resolveTestimonialText, type PublicTestimonial } from "@/types/testimonial";
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

/**
 * Country flag from the local `flag-icons` stylesheet. Rendering an SVG-backed
 * CSS class (instead of an emoji) keeps the flag visible on Windows, which does
 * not render regional-indicator emoji.
 */
function CountryFlag({ code, label }: { code?: string; label?: string }) {
  const className = flagClass(code);
  if (!className) return null;
  // Decorative: the country/nationality label sits right next to it.
  const text = label ?? code ?? "";
  return (
    <span
      aria-hidden="true"
      title={text}
      className={`${className} inline-block h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]`}
    />
  );
}

function formatDate(value: string, bcp47: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(bcp47, { year: "numeric", month: "short" }).format(date);
}

function sortPublished(list: PublicTestimonial[]): PublicTestimonial[] {
  const last = Number.MAX_SAFE_INTEGER;
  return list.sort((a, b) => {
    const byOrder = (a.order ?? last) - (b.order ?? last);
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

  // Resolved on the server: Node's ICU and the browser's disagree on a few
  // country names (e.g. PS), which would break hydration if the client
  // recomputed them. The client receives the exact labels rendered by the SSR.
  const countries = COUNTRY_CODES.map((code) => ({
    code,
    label: countryName(code, locale) ?? code,
  }));

  const published = sortPublished(await readPublishedTestimonials());
  const visible = published.slice(0, MAX_CARDS);
  const average =
    published.length > 0
      ? published.reduce((sum, item) => sum + item.rating, 0) / published.length
      : 0;

  const cards = visible.map((item) => ({
    id: item.id,
    name: item.name,
    job: item.job,
    countryCode: item.countryCode,
    // The admin's free-text nationality wins; otherwise the country name is
    // translated for the current locale (Arabic, French, Bengali…).
    place: item.nationality?.trim() || countryName(item.countryCode, locale),
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
                      {item.job || item.place ? (
                        <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-muted">
                          {item.job ? <span className="truncate">{item.job}</span> : null}
                          {item.job && item.place ? <span aria-hidden="true">·</span> : null}
                          {item.place ? (
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <CountryFlag code={item.countryCode} label={item.place} />
                              <span className="truncate">{item.place}</span>
                            </span>
                          ) : null}
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

        <TestimonialForm countries={countries} />

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
