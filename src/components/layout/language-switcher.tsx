"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localesMeta } from "@/lib/config/locales";

/**
 * Language switcher — dropdown listing every active locale with its native
 * name. Keeps the current path while changing the locale prefix
 * (next-intl Link `locale` prop), so the user stays on the same page.
 */
export function LanguageSwitcher({
  compact = false,
}: {
  /** Compact renders icon-only on small screens (header usage). */
  compact?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape / route change.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = localesMeta.find((m) => m.code === locale) ?? localesMeta[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("languageLabel")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-ivory-deep/60 px-3 py-1.5 text-xs font-medium text-forest transition-colors hover:border-gold-deep hover:bg-gold-light/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span aria-hidden="true" className="text-gold-deep">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className={compact ? "hidden sm:inline" : undefined}>
          {current.nativeName}
        </span>
        <span aria-hidden="true">
          <ChevronDown
            className={`h-3 w-3 text-forest/60 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("languageLabel")}
          className="absolute end-0 top-full z-50 mt-2 max-h-72 w-48 overflow-auto rounded-2xl border border-line bg-surface py-1.5 shadow-lg shadow-forest/10"
        >
          {localesMeta.map((meta) => {
            const active = meta.code === locale;
            return (
              <li key={meta.code}>
                {active ? (
                  <span
                    role="option"
                    aria-selected="true"
                    className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-semibold text-gold-deep"
                  >
                    <span>
                      <span className="me-2 inline-block w-8 text-[10px] uppercase tracking-wider text-forest/50">
                        {meta.code}
                      </span>
                      {meta.nativeName}
                    </span>
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  <Link
                    href={pathname}
                    locale={meta.code}
                    lang={meta.code}
                    role="option"
                    aria-selected="false"
                    onClick={() => setOpen(false)}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-forest transition-colors hover:bg-gold-light/40 hover:text-forest-deep focus-visible:bg-gold-light/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span className="me-2 inline-block w-8 text-[10px] uppercase tracking-wider text-forest/50">
                      {meta.code}
                    </span>
                    {meta.nativeName}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
