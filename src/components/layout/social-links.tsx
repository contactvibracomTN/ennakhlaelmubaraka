import type { ComponentType, SVGProps } from "react";
import { getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/config/site.config";
import type { Locale } from "@/lib/config/locales";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  SnapchatIcon,
} from "@/components/icons/social-icons";

type SocialKey = keyof typeof siteConfig.socials;
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const SOCIAL_ICONS: Record<SocialKey, IconComponent> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  snapchat: SnapchatIcon,
};

/**
 * Real social profiles from `siteConfig` (v2.1 cross-checked). Each link
 * opens in a new tab with an accessible localized label.
 */
export async function SocialLinks({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const locale = (await getLocale()) as Locale;
  const linkCls = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconCls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <ul className={`flex items-center gap-2.5 ${className}`} role="list">
      {Object.entries(siteConfig.socials).map(([key, social]) => {
        const label = locale === "ar" ? social.labelAr : social.labelEn;
        const Icon = SOCIAL_ICONS[key as SocialKey];
        return (
          <li key={key}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={`inline-flex items-center justify-center rounded-full border border-ivory/25 text-ivory/80 transition-colors hover:border-gold hover:bg-ivory/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${linkCls}`}
            >
              <Icon className={iconCls} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
