import { getLocale, getTranslations } from "next-intl/server";
import { getDirection, routing } from "@/i18n/routing";
import { Truck } from "lucide-react";

/**
 * How many times the full multilingual sequence is repeated inside one marquee
 * half. Two identical halves make the loop seamless; repeating the sequence
 * keeps each half wider than the viewport so no gap ever shows on wide screens.
 */
const SEQUENCE_REPEATS = 2;

type Promo = {
  locale: string;
  dir: "rtl" | "ltr";
  text: string;
};

/**
 * Fetches the promo line in every supported locale, in routing order
 * (ar first). Independent of the visitor's navigation language: the ribbon must
 * scroll the offer through all languages (PO 2026-10).
 */
async function getLocalizedPromos(): Promise<Promo[]> {
  return Promise.all(
    routing.locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "announcement" });
      return { locale, dir: getDirection(locale), text: t("text") };
    }),
  );
}

/** One marquee half: the full multilingual sequence, repeated for width. */
function MarqueeHalf({ promos, hidden }: { promos: Promo[]; hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex w-max shrink-0 items-center">
      {Array.from({ length: SEQUENCE_REPEATS }).flatMap((_, r) =>
        promos.map((promo) => (
          <span
            key={`${r}-${promo.locale}`}
            dir={promo.dir}
            lang={promo.locale}
            className="inline-flex items-center gap-3 whitespace-nowrap pe-8"
          >
            <Truck aria-hidden className="size-4 text-gold-light" />
            <span className="text-sm font-semibold tracking-wide text-ivory sm:text-base">
              {promo.text}
            </span>
            <span aria-hidden className="text-sm text-gold-light">
              ✦
            </span>
          </span>
        )),
      )}
    </div>
  );
}

/**
 * Announcement marquee (PO 2026-09/10): permanent scrolling offer ribbon.
 * Out-of-brand burgundy accent to catch the eye (user-approved). Pure CSS
 * animation, no client JS.
 *
 * Multilingual by design: whatever language the visitor browses in, the ribbon
 * cycles the free-delivery offer through every supported locale (each phrase
 * carries its own `dir`/`lang` so RTL scripts render correctly). The animation
 * duration is scaled up because a half now holds many phrases.
 *
 * Seamless loop: the track is two identical halves; `marquee-scroll` slides to
 * -50% and restarts. RTL uses its own `marquee-scroll-rtl` keyframe (+50%) so
 * the ribbon scrolls the way RTL reads (see globals.css). Reduced-motion
 * users get a static ribbon; screen readers get a single sr-only line in the
 * visitor's own language.
 */
export async function AnnouncementMarquee() {
  const t = await getTranslations("announcement");
  const locale = await getLocale();
  const dir = getDirection(locale);
  const promos = await getLocalizedPromos();

  return (
    <div
      role="region"
      aria-label={t("label")}
      className="overflow-hidden bg-bordeaux border-b border-bordeaux-deep"
    >
      {/* Assistive tech gets the visitor's own language once; the visual ribbon
          scrolls the offer through every language on purpose. */}
      <span className="sr-only">{t("text")}</span>
      <div
        data-dir={dir}
        aria-hidden
        className="marquee-track flex w-max py-2.5 [--marquee-duration:80s]"
      >
        {/* Real (visible) half first, then an identical visual twin. */}
        <MarqueeHalf promos={promos} />
        <MarqueeHalf promos={promos} hidden />
      </div>
    </div>
  );
}
