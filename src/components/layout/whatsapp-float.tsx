import { getLocale, getTranslations } from "next-intl/server";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";

/**
 * Floating WhatsApp button (bottom corner) — the primary order channel
 * (Blueprint §9). Links to a prefilled greeting message; safely hidden
 * behind the demo banner area and clear of the consent banner.
 */
export async function WhatsAppFloat() {
  const tw = await getTranslations("whatsapp");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  return (
    <a
      href={buildWhatsAppUrl(tw("greeting"), locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tw("greeting")}
      title={tc("brand")}
      className="fixed bottom-5 inset-inline-end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg shadow-forest-deep/30 ring-2 ring-white/60 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <WhatsAppLogo className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
