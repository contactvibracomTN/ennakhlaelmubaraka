import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NavLinks } from "@/components/navigation/nav-links";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartLink } from "@/components/cart/cart-link";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { buildWhatsAppUrl } from "@/lib/config/site.config";

/**
 * Site header.
 * Brand (official logo image — never redrawn), main nav, cart entry,
 * language switch and WhatsApp CTA. Mobile navigation lives in MobileMenu.
 */
export async function Header() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const tw = await getTranslations("whatsapp");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand.
            No `aria-label` here on purpose: the link already contains its
            accessible name as visible text, and labelling it with `brandFull`
            ("النخلة المباركة للتّمور الفاخرة") while the pixels read "النخلة
            المباركة / Premium Dates · Al Nakhlah" made the accessible name
            diverge from the visible one — the WCAG 2.5.3 failure Lighthouse
            reported. A link named by its own text needs no override.
            The tagline below also used to be a hard-coded English string in all
            eight languages; it now comes from the message files. */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <Image
            src="/images/brand/logo-square.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
            priority
          />
          <span className="leading-tight">
            <span className="block font-arabic-display text-lg font-bold tracking-tight text-forest">
              {tc("brand")}
            </span>
            <span className="hidden text-[0.65rem] tracking-wide text-muted sm:block">
              {tc("tagline")}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={t("home")} className="hidden items-center lg:flex">
          <NavLinks variant="desktop" />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CartLink />

          <LanguageSwitcher compact />

          <a
            href={buildWhatsAppUrl(tw("greeting"))}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inline-flex"
          >
            <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />
            {t("whatsapp")}
          </a>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
