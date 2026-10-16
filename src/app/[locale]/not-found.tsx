import { MessageCircle } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";

/** The catalogue routes worth offering from a dead end, in order. */
const FALLBACKS = ["/dates", "/gifts", "/guide", "/contact"] as const;

/**
 * Localized 404 for unknown paths within a locale segment
 * (renders inside the `[locale]` layout, keeping header/footer).
 *
 * A dead end is only a lost sale if it offers nothing. This page used to render
 * a title and a single "back home" link, so a mistyped or outdated URL left the
 * visitor with one option. It now points at the four routes that answer most
 * "I was looking for…" intents, and at WhatsApp — the channel this shop
 * actually sells through.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("common");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const locale = (await getLocale()) as Locale;

  const labels: Record<(typeof FALLBACKS)[number], string> = {
    "/dates": tn("dates"),
    "/gifts": tn("gifts"),
    "/guide": tn("guide"),
    "/contact": tn("contact"),
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 text-center">
      <p
        aria-hidden="true"
        className="font-display text-7xl font-bold text-gold-deep"
      >
        404
      </p>
      <h1 className="mt-6 font-arabic-display text-2xl font-bold text-forest">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("notFoundBody")}
      </p>

      <nav
        aria-label={t("notFoundBrowse")}
        className="mt-8 w-full"
      >
        <ul className="flex flex-wrap justify-center gap-2">
          {FALLBACKS.map((href) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-block rounded-full border border-forest/30 px-4 py-2 text-sm font-semibold text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {labels[href]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("backToHome")}
        </Link>
        <a
          href={buildWhatsAppUrl(tw("help"), locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-success px-6 py-3 text-sm font-semibold text-success transition-colors hover:bg-success/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <MessageCircle aria-hidden className="size-4" />
          {tn("whatsapp")}
        </a>
      </div>

      {/* Keeps the language usable after a 404 rather than bouncing the visitor
          to another locale by accident. */}
      <p className="mt-10 text-xs text-muted">
        {t("notFoundOtherLanguages")}{" "}
        <span className="inline-flex flex-wrap justify-center gap-2">
          {routing.locales
            .filter((code) => code !== locale)
            .map((code) => (
              <Link
                key={code}
                href="/"
                locale={code}
                className="font-semibold text-forest underline underline-offset-4 hover:text-gold-deep"
              >
                {code.toUpperCase()}
              </Link>
            ))}
        </span>
      </p>
    </div>
  );
}
