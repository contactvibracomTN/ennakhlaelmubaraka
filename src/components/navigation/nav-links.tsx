"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { getDirection } from "@/i18n/routing";
import { NAV_ITEMS } from "./nav-items";

/**
 * Main navigation links with active-route highlighting.
 * `desktop` renders the inline horizontal bar; `mobile` renders a
 * full-width list inside the mobile drawer. `onSelect` lets the mobile
 * menu close itself after navigation.
 */
export function NavLinks({
  variant,
  onSelect,
}: {
  variant: "desktop" | "mobile";
  onSelect?: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  // The chevron points in the reading direction ("forward"): ‹ in RTL, › in LTR.
  const forward = getDirection(locale) === "rtl" ? "‹" : "›";

  const baseLink =
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

  if (variant === "desktop") {
    return (
      <ul className="flex items-center gap-6" role="list">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${baseLink} text-sm ${
                  isActive
                    ? "font-semibold text-forest"
                    : "text-forest/75 hover:text-forest"
                }`}
              >
                {t(item.messageKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col" role="list">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li
            key={item.href}
            className="border-b border-line/60 last:border-b-0"
          >
            <Link
              href={item.href}
              onClick={onSelect}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center justify-between px-1 py-4 text-base ${
                isActive ? "font-semibold text-forest" : "text-forest/80"
              }`}
            >
              <span>{t(item.messageKey)}</span>
              <span aria-hidden="true" className="text-gold-deep">
                {forward}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
