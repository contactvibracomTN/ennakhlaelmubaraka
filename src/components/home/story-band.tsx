import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import {
  buildWhatsAppUrl,
  getBrandName,
  getTagline,
} from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";

/**
 * Story band — the boutique's promise (v2.1 copy) with a WhatsApp CTA.
 */
export async function StoryBand() {
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");
  const tw = await getTranslations("whatsapp");
  const locale = (await getLocale()) as Locale;

  return (
    <section
      aria-labelledby="story-title"
      className="relative overflow-hidden bg-forest-deep text-ivory"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div aria-hidden="true" className="grid h-full w-full grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-s border-ivory/40" />
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold tracking-widest text-gold-light uppercase">
            {t("aboutEyebrow")}
          </p>
          <h2
            id="story-title"
            className="mt-3 font-arabic-display text-3xl font-bold leading-tight text-ivory sm:text-4xl"
          >
            {t("aboutTitle")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/75">
            {t("aboutText")}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <Link
            href="/story"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-forest-deep transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {t("aboutCta")}
          </Link>
          <a
            href={buildWhatsAppUrl(tw("greeting"), locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />
            {tn("whatsapp")}
          </a>
          <p className="text-xs text-ivory/50 lg:text-end">
            {getBrandName(locale)} · {getTagline(locale)}
          </p>
        </div>
      </div>
    </section>
  );
}
