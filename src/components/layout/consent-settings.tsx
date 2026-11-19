"use client";

import { useTranslations } from "next-intl";

export const OPEN_CONSENT_EVENT = "nakhla:open-consent";

/** Footer control that reopens the consent panel without reloading the site. */
export function ConsentSettings() {
  const t = useTranslations("footer");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="transition-colors hover:text-gold"
    >
      {t("cookieSettings")}
    </button>
  );
}
