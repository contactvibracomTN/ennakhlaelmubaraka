"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavLinks } from "@/components/navigation/nav-links";
import { LanguageSwitcher } from "./language-switcher";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { buildWhatsAppUrl } from "@/lib/config/site.config";

/**
 * Mobile navigation drawer (hamburger → slide-over).
 * - Accessible: aria-expanded/aria-controls, Escape to close, focus return.
 * - Body scroll is locked while open.
 * - Closes after selecting a link.
 */
export function MobileMenu() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const tw = useTranslations("whatsapp");

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    // Return focus to the toggle button after closing.
    requestAnimationFrame(() => buttonRef.current?.focus());
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? tc("menuClose") : tc("menuOpen")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ivory-deep/60 text-forest transition-colors hover:border-gold-deep lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={close}
        className={`fixed inset-0 z-50 bg-forest-deep/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={t("home")}
        className={`fixed inset-y-0 start-0 z-50 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-ivory shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Link
            href="/"
            onClick={close}
            className="font-arabic-display text-lg font-bold text-forest"
          >
            {tc("brand")}
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label={tc("menuClose")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-forest/70 transition-colors hover:bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={t("home")} className="px-5 py-2">
          <NavLinks variant="mobile" onSelect={close} />
        </nav>

        <div className="mt-auto space-y-4 border-t border-line px-5 py-5">
          <a
            href={buildWhatsAppUrl(tw("greeting"))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <WhatsAppLogo className="h-4 w-4" aria-hidden="true" />
            {t("whatsapp")}
          </a>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{tc("languageLabel")}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
