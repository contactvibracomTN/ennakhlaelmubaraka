import {
  BadgeCheck,
  Gift,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Reassurance band — the four values (Blueprint §? / v2.1 "قيم نعتز بها"),
 * resolved from messages: hand-selection, gifting, WhatsApp service,
 * price transparency.
 */
const ITEM_KEYS = [
  { key: "selection", icon: BadgeCheck },
  { key: "gifting", icon: Gift },
  { key: "service", icon: MessageCircleHeart },
  { key: "transparency", icon: ShieldCheck },
] as const;

export async function Reassurance() {
  const t = await getTranslations("home");
  const key = (suffix: string) => `reassuranceItems.${suffix}`;

  return (
    <section
      className="bg-forest text-ivory"
      aria-labelledby="reassurance-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold tracking-widest text-gold-light uppercase">
            {t("reassuranceEyebrow")}
          </p>
          <h2
            id="reassurance-title"
            className="mt-2 font-arabic-display text-3xl font-bold text-ivory sm:text-4xl"
          >
            {t("reassuranceTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ivory/70">
            {t("reassuranceSubtitle")}
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {ITEM_KEYS.map(({ key: itemKey, icon: Icon }, index) => (
            <li
              key={itemKey}
              className="rounded-2xl border border-ivory/10 bg-forest-soft/40 p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold"
                >
                  <Icon className="h-5 w-5" />
                </span>
                {/* Decorative ordinal, but still real text: at `ivory/15` on the forest
                    background it measured 1.53:1. `ivory/45` measures ~3.7:1,
                    which clears the 3:1 required for text this size while
                    staying visibly secondary. */}
                <span className="font-display text-3xl text-ivory/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-medium text-ivory">
                {t(key(`${itemKey}.title`))}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ivory/70">
                {t(key(`${itemKey}.text`))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
