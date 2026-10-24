import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import { staticGuideRepository } from "@/lib/data";
import { pick } from "@/lib/data";
import type { GuideTexture, GuideVariety } from "@/types/guide";
import type { Locale } from "@/lib/config/locales";

const TEXTURE_KEY: Record<GuideTexture, string> = {
  soft: "soft",
  "semi-soft": "semi-soft",
  dry: "dry",
};

/**
 * Guide teaser (homepage "دليل التمور"), mirroring v2.1's
 * six-variety teaser grid. Content is the migrated editorial catalog.
 */
export async function GuideTeaser() {
  const t = await getTranslations("guide");
  const th = await getTranslations("home");
  const locale = (await getLocale()) as Locale;

  const varieties = await staticGuideRepository.getVarieties();
  const teaser = varieties.slice(0, 6);

  return (
    <section aria-labelledby="guide-teaser-title" className="bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-date-soft uppercase">
              {t("eyebrow")}
            </p>
            <h2
              id="guide-teaser-title"
              className="mt-2 font-arabic-display text-3xl font-bold text-forest sm:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-3 max-w-xl text-muted">{t("subtitle")}</p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
          >
            {th("viewAll")}
          </Link>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {teaser.map((variety) => (
            <li key={variety.slug}>
              <VarietyCard variety={variety} locale={locale} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function VarietyCard({
  variety,
  locale,
}: {
  variety: GuideVariety;
  locale: Locale;
}) {
  const t = await getTranslations("guide");

  return (
    <Link
      href={`/guide/${variety.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ivory-deep">
        <Image
          src={variety.image}
          alt={pick(variety.title, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 start-3 rounded-full bg-forest-deep/80 px-2.5 py-1 font-display text-xs text-gold-light">
          {variety.number}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-arabic-display text-lg font-bold leading-snug text-forest">
          {pick(variety.title, locale).split("—")[0].trim()}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {pick(variety.origin, locale)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex rounded-full bg-gold-light/50 px-2.5 py-1 text-[0.65rem] font-semibold text-date-deep">
            {t(`textures.${TEXTURE_KEY[variety.texture]}`)}
          </span>
          <span
            aria-hidden="true"
            className="text-gold-deep transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          >
            {getDirection(locale) === "rtl" ? "\u2190" : "\u2192"}
          </span>
        </div>
      </div>
    </Link>
  );
}
