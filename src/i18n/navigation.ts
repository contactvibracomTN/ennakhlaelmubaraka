import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives (next-intl).
 * Every internal link in the app MUST go through these helpers so that
 * `/[locale]` prefixes and hreflang-consistent paths are enforced everywhere.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
