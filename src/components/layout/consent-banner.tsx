"use client";

import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config/site.config";
import { OPEN_CONSENT_EVENT } from "@/components/layout/consent-settings";

const STORAGE_KEY = "nakhla.consent.v1";
const CONSENT_CHANGE_EVENT = "nakhla:consent-change";
type Choice = "accepted" | "rejected";

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): Choice | null {
  return readChoice();
}

function getServerSnapshot(): Choice | null {
  return null;
}

function denyAnalytics() {
  const win = window as Window & { dataLayer?: unknown[] };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push([
    "consent",
    "update",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);

  for (const name of ["_ga", "_gid", "_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  }
}

function GtmLoader() {
  const gtmId = siteConfig.analytics.gtmId;
  if (!gtmId) return null;

  return (
    <>
      <Script id="gtm-consent-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * Analytics stay off until the visitor chooses. The choice is stored locally
 * so it can be changed from the footer; refusing is as easy as accepting.
 */
export function ConsentBanner() {
  const t = useTranslations("consent");
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const decide = (value: Choice) => {
    if (value === "rejected") denyAnalytics();
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // A private browser may block storage; the choice still applies in memory.
    }
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    setReopened(false);
  };

  const analyticsAllowed = choice === "accepted" && Boolean(siteConfig.analytics.gtmId);
  const visible = choice === null || reopened;

  return (
    <>
      {analyticsAllowed ? <GtmLoader /> : null}
      {visible ? (
        <div
          role="dialog"
          aria-label={t("title")}
          aria-modal="false"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-2xl border border-gold/40 bg-forest-deep p-5 text-ivory shadow-2xl"
        >
          <h2 className="font-arabic-display text-base font-bold">{t("title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ivory/80">
            {t("body")}{" "}
            <Link href="/privacy" className="underline decoration-gold underline-offset-2 hover:text-gold">
              {t("privacyLink")}
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-forest-deep transition-colors hover:bg-gold-light"
            >
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={() => decide("rejected")}
              className="rounded-full border border-ivory/40 px-5 py-2 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10"
            >
              {t("reject")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
