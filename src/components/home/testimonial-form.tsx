"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, Loader2, Send, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { submitTestimonialAction, type TestimonialFormResult } from "@/lib/actions/testimonials";

export interface CountryOption {
  code: string;
  label: string;
}

const RATINGS = [1, 2, 3, 4, 5] as const;

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-line bg-ivory/40 px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted/60 transition-colors focus:border-gold-deep focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30";

const LABEL_CLASS = "text-sm font-semibold text-forest";

/**
 * Public "add a review" accordion. The CTA at the bottom of the section toggles
 * the panel; the form posts to the `submitTestimonialAction` server action.
 */
export function TestimonialForm({ countries }: { countries: CountryOption[] }) {
  const t = useTranslations("testimonials");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [result, setResult] = useState<TestimonialFormResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const startedAtRef = useRef(0);

  const success = result?.ok === true;
  const errorCode = result && !result.ok ? result.code : null;

  const toggleOpen = () => {
    if (!open) startedAtRef.current = Date.now();
    setOpen((value) => !value);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", locale);
    formData.set("startedAt", String(startedAtRef.current || Date.now()));
    startTransition(async () => {
      const response = await submitTestimonialAction(formData);
      setResult(response);
      if (response.ok) {
        form.reset();
        setRating(0);
      }
    });
  };

  const reset = () => {
    setResult(null);
    setRating(0);
    startedAtRef.current = Date.now();
    formRef.current?.reset();
  };

  return (
    <div className="mt-10 flex flex-col items-center">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls="testimonial-form-panel"
        className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-forest-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        {open ? t("ctaClose") : t("ctaAdd")}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="testimonial-form-panel"
        inert={!open}
        aria-hidden={!open}
        className={`grid w-full transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-gold/40 bg-white p-6 shadow-sm sm:p-8">
            {success ? (
              <div className="py-6 text-center" role="status" aria-live="polite">
                <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 font-arabic-display text-2xl font-bold text-forest">
                  {t("successTitle")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                  {t("successText")}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
                >
                  {t("addAnother")}
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate={false}>
                <div className="mb-6">
                  <h3 className="font-arabic-display text-2xl font-bold text-forest">
                    {t("formTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t("formHint")}</p>
                </div>

                {errorCode ? (
                  <p
                    role="alert"
                    className="mb-5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-relaxed text-danger"
                  >
                    {errorCode === "invalid"
                      ? t("errors.invalid")
                      : errorCode === "rate-limit"
                        ? t("errors.rateLimit")
                        : t("errors.error")}
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={LABEL_CLASS}>
                      {t("name")} <span className="text-danger">*</span>
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      placeholder={t("namePlaceholder")}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="block">
                    <span className={LABEL_CLASS}>
                      {t("whatsapp")} <span className="text-danger">*</span>
                    </span>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      minLength={8}
                      maxLength={20}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="[+0-9()\s-]{8,20}"
                      placeholder={t("whatsappPlaceholder")}
                      aria-describedby="testimonial-whatsapp-hint"
                      className={INPUT_CLASS}
                    />
                    <span id="testimonial-whatsapp-hint" className="mt-1 block text-xs text-muted">
                      {t("whatsappHint")}
                    </span>
                  </label>

                  <label className="block">
                    <span className={LABEL_CLASS}>{t("job")}</span>
                    <input
                      type="text"
                      name="job"
                      maxLength={80}
                      autoComplete="organization-title"
                      placeholder={t("jobPlaceholder")}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="block">
                    <span className={LABEL_CLASS}>{t("country")}</span>
                    <select
                      name="countryCode"
                      defaultValue=""
                      autoComplete="country"
                      className={INPUT_CLASS}
                    >
                      <option value="">{t("countryPlaceholder")}</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className={LABEL_CLASS}>
                      {t("message")} <span className="text-danger">*</span>
                    </span>
                    <textarea
                      name="message"
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={4}
                      placeholder={t("messagePlaceholder")}
                      className={`${INPUT_CLASS} resize-y`}
                    />
                  </label>
                </div>

                <fieldset className="mt-5">
                  <legend className={LABEL_CLASS}>
                    {t("rating")} <span className="text-danger">*</span>
                  </legend>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1" role="radiogroup" aria-label={t("rating")}>
                      {RATINGS.map((value) => (
                        <label
                          key={value}
                          className="cursor-pointer rounded-lg p-1 transition-transform hover:scale-110 focus-within:ring-2 focus-within:ring-forest/40"
                        >
                          <input
                            type="radio"
                            name="rating"
                            value={value}
                            required
                            checked={rating === value}
                            onChange={() => setRating(value)}
                            className="sr-only"
                          />
                          <Star
                            aria-hidden="true"
                            className={`h-7 w-7 transition-colors ${
                              value <= rating
                                ? "fill-gold-deep text-gold-deep"
                                : "fill-transparent text-line"
                            }`}
                          />
                          <span className="sr-only">{t(`ratingLabels.${value}`)}</span>
                        </label>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-date-soft">
                      {rating > 0
                        ? t(`ratingLabels.${rating as 1 | 2 | 3 | 4 | 5}`)
                        : t("ratingHint")}
                    </span>
                  </div>
                </fieldset>

                {/* Honeypot — hidden from humans, irresistible to bots. */}
                <div className="hidden" aria-hidden="true">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-xs leading-relaxed text-muted">{t("privacy")}</p>
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-date px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-date-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? (
                      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send aria-hidden="true" className="h-4 w-4" />
                    )}
                    {pending ? t("submitting") : t("submit")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
