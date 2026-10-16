import { getTranslations } from "next-intl/server";

/**
 * Footer FAQ accordion (PO 2026-09, request 4): the « الأسئلة الشّائعة »
 * title opens (native `<details>`) the five Q&A pairs migrated from the v2.1
 * reference — the exact same `faq.items` the /faq page renders. Server
 * component, no client JS; the /faq page stays in the sitemap and footer
 * links keep pointing at it (it is merely removed from the main nav).
 */
export async function FooterFaqAccordion() {
  const t = await getTranslations("footer");
  const tf = await getTranslations("faq");

  const items = tf.raw("items") as Array<{ q: string; a: string }>;

  return (
    <section
      aria-label={t("faqTitle")}
      className="border-t border-ivory/10"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-arabic-display text-lg font-bold text-gold transition-colors hover:text-gold-light marker:hidden">
            {t("faqTitle")}
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>

          <div className="mt-5 space-y-2.5">
            {items.map((item, i) => (
              <details
                key={i}
                className="group/item rounded-xl border border-ivory/15 bg-ivory/5 open:border-gold/50 open:bg-ivory/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-semibold leading-snug text-ivory transition-colors hover:text-gold-light marker:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ivory/20 text-gold-light transition-transform group-open/item:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-ivory/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}