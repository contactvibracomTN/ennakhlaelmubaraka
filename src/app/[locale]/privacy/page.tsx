import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/config/locales";
import { getPrivacyContent } from "@/lib/content/privacy-policy";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function isSafeHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|\/)/i.test(href);
}

/** Renders [label](url) markers as real links without HTML injection. */
function InlineText({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const label = match[1];
    const href = match[2];
    nodes.push(
      isSafeHref(href) ? (
        <a
          key={index}
          href={href}
          className="text-forest underline decoration-gold/60 underline-offset-2 hover:text-gold-deep"
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      ) : (
        label
      ),
    );
    cursor = index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function Paragraphs({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 space-y-2.5">
      {items.map((item, index) => (
        <p key={index} className="text-sm leading-relaxed text-muted">
          <InlineText text={item} />
        </p>
      ))}
    </div>
  );
}

/**
 * Privacy policy. The text lives in `src/lib/content/privacy-policy.ts` so the
 * same legal meaning is kept across all eight site languages. Every statement
 * there is tied to an existing data flow in the application.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
  const content = getPrivacyContent(locale as Locale);

  return (
    <>
      <div className="border-b border-line bg-ivory-deep/40">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h1 className="font-arabic-display text-3xl font-bold text-forest sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {content.intro}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-deep">
            {content.effectiveDate}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <nav aria-label={t("contentsLabel")} className="mb-10 rounded-3xl border border-line bg-ivory p-6">
          <h2 className="font-arabic-display text-base font-bold text-forest">
            {t("contentsLabel")}
          </h2>
          <ol className="mt-3 grid gap-1.5 text-sm text-forest sm:grid-cols-2">
            {content.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="hover:text-gold-deep hover:underline">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-6">
          {content.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-3xl border border-line bg-ivory p-6"
            >
              <h2 className="font-arabic-display text-lg font-bold text-forest">
                {section.heading}
              </h2>
              <Paragraphs items={section.paragraphs} />

              {section.list ? (
                <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted marker:text-gold-deep">
                  {section.list.map((item, index) => (
                    <li key={index}>
                      <InlineText text={item} />
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.paragraphsAfterList ? (
                <Paragraphs items={section.paragraphsAfterList} />
              ) : null}

              {section.subsections?.map((subsection) => (
                <div key={subsection.heading} className="mt-5 border-t border-line pt-5">
                  <h3 className="text-sm font-bold text-forest">{subsection.heading}</h3>
                  <Paragraphs items={subsection.paragraphs} />
                  {subsection.list ? (
                    <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted marker:text-gold-deep">
                      {subsection.list.map((item, index) => (
                        <li key={index}>
                          <InlineText text={item} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: `/${locale}/privacy`,
  });
}
