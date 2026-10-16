"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Route-segment error boundary (Next 16: `retry` prop, not `reset`).
 * Localized fallback with a retry action; logs diagnostics for the
 * future error-reporting layer.
 */
export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // Log for the error-reporting layer (Blueprint §34) once wired.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 text-center">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light/50 text-date-deep"
      >
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-arabic-display text-2xl font-bold text-forest">
        {t("errorTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("errorBody")}
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted/70" dir="ltr">
          {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={retry}
        className="mt-8 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {t("retry")}
      </button>
    </div>
  );
}
