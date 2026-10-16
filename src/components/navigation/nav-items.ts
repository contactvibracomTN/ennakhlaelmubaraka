/**
 * Single source of truth for the main navigation.
 * Labels are resolved from the `nav` message scope by each renderer
 * (server components via `getTranslations`, client components via
 * `useTranslations`) so the same list works in Header, MobileMenu and
 * Footer without passing server-fetched strings into client islands.
 */
export const NAV_ITEMS = [
  { href: "/", messageKey: "home" },
  { href: "/dates", messageKey: "dates" },
  { href: "/gifts", messageKey: "gifts" },
  { href: "/guide", messageKey: "guide" },
  { href: "/blog", messageKey: "blog" },
  { href: "/story", messageKey: "story" },
  { href: "/contact", messageKey: "contact" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Footer quick-link subset (categories), resolved with `footer` scope keys. */
export const FOOTER_CATEGORY_LINKS = [
  { href: "/dates", messageKey: "categoriesDates" },
  { href: "/gifts", messageKey: "categoriesGifts" },
  { href: "/guide", messageKey: "categoriesGuide" },
] as const;
