"use client";

/**
 * Date product sheet — interactive part (fiche produit dates, PO 2026-10).
 *
 * The gallery and the order panel must agree on ONE thing: the selected quality
 * grade. Choosing a grade therefore updates the price *and* the photo shown
 * (each grade may carry its own images; empty grades fall back to the product
 * photos). This is why the whole sheet is a single client component: the grade
 * state lives here and is shared between <ProductGallery> and <WeightSelector>.
 */
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { pick } from "@/lib/data/localize";
import { formatMoney } from "@/types/money";
import {
  dateLineGradeLabel,
  gradeFor,
  gradeImageAlts,
  gradeImages,
  gradeTierLabel,
} from "@/lib/data/weight-price";
import type { Locale } from "@/lib/config/locales";
import type { DateProduct, GradeTier } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { WeightSelector } from "./weight-selector";

const TIER_TONE: Record<GradeTier, string> = {
  premium: "bg-gold-light text-date-deep",
  medium: "bg-ivory-deep text-forest",
  economic: "bg-line text-muted",
};

const AVAILABILITY_TONE = {
  "in-stock": "bg-success/10 text-success",
  "out-of-stock": "bg-danger/10 text-danger",
  preorder: "bg-warning/10 text-warning",
} as const;

export function DateProductView({
  product,
  categoryName,
  framed = false,
}: {
  product: DateProduct;
  categoryName?: string | null;
  framed?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const te = useTranslations("dates");
  const tg = useTranslations("guide");

  const name = pick(product.name, locale);
  // Long copy (PO 2026-10): optional description written in the admin editor,
  // rendered under the teaser on the product sheet only.
  const description = product.description
    ? pick(product.description, locale)
    : null;
  const headingId = `date-card-${product.id}`;
  const Heading = framed ? "h2" : "h1";

  const grades = product.grades ?? [];
  const [gradeId, setGradeId] = useState<string | undefined>(
    product.defaultGradeId ?? grades[0]?.id,
  );
  const selectedGrade = gradeFor(product, gradeId);
  const images = gradeImages(product, gradeId);
  const imageAlts = gradeImageAlts(product, gradeId);

  const body = (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="space-y-4">
        <ProductGallery
          // Re-mount on grade change so the slider resets to the first photo
          // of the newly selected quality.
          key={selectedGrade?.id ?? "base"}
          images={images}
          alt={name}
          alts={imageAlts}
        />
        {product.images.length === 0 ? (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-line bg-ivory-deep p-6 text-center text-xs leading-relaxed text-muted">
            {tc("photoToConfirm")}
          </div>
        ) : null}
        {grades.length > 0 && selectedGrade ? (
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-forest">{t("gradeLabel")}:</span>
            {selectedGrade.tier ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_TONE[selectedGrade.tier]}`}
              >
                {gradeTierLabel(selectedGrade.tier, locale)}
              </span>
            ) : null}
            <span className="text-charcoal/80">
              {dateLineGradeLabel(product, selectedGrade.id, locale)}
            </span>
            <span className="text-date-deep">
              {formatMoney[locale](selectedGrade.pricePerKg.amount)}
            </span>
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {categoryName ? (
            <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs font-semibold text-forest">
              {categoryName}
            </span>
          ) : null}
          {/* Stock has never been counted: every item carries `availability:
              "in-stock"` from the placeholder data. While the product is
              `demo`, the badge therefore states the honest thing —
              availability is confirmed when the customer asks — instead of
              asserting a firm "متوفر". `out-of-stock` and `preorder` are
              deliberate states chosen by the owner, so they still render. */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              AVAILABILITY_TONE[product.availability]
            }`}
          >
            {t(
              product.availability === "out-of-stock"
                ? "outOfStock"
                : product.availability === "preorder"
                  ? "preorder"
                  : product.contentStatus === "demo"
                    ? "availabilityToConfirm"
                    : "inStock",
            )}
          </span>
          {product.texture ? (
            <span className="rounded-full bg-gold-light/50 px-3 py-1 text-xs font-semibold text-date-deep">
              {tg(`textures.${product.texture}`)}
            </span>
          ) : null}
        </div>

        <Heading
          id={headingId}
          className={`mt-4 font-arabic-display font-bold leading-tight text-forest ${
            framed ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {name}
        </Heading>

        <p className="mt-3 text-sm text-muted">
          <span className="font-semibold text-forest">{t("origin")}: </span>
          {pick(product.origin, locale)}
        </p>

        <p className="mt-5 text-base leading-relaxed text-charcoal/85">
          {pick(product.teaser, locale)}
        </p>

        {description ? (
          <div className="mt-5 border-t border-line pt-5">
            <h2 className="text-sm font-semibold text-forest">
              {t("descriptionTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-charcoal/80">
              {description}
            </p>
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <WeightSelector
            product={product}
            gradeId={gradeId}
            onGradeChange={setGradeId}
          />
          {product.offerLabel ? (
            <p className="mt-4 rounded-xl bg-gold-light/40 px-4 py-2.5 text-xs text-date-deep">
              {pick(product.offerLabel, locale)}
            </p>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-ivory-deep/40 p-6">
          <h2 className="text-sm font-semibold text-forest">{t("details")}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">{t("origin")}</dt>
              <dd className="mt-0.5 text-forest">
                {pick(product.origin, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t("texture")}</dt>
              <dd className="mt-0.5 text-forest">
                {product.texture ? tg(`textures.${product.texture}`) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{te("categoriesLabel")}</dt>
              <dd className="mt-0.5 text-forest">{categoryName ?? "—"}</dd>
            </div>
            {grades.length > 0 ? (
              <div className="col-span-2">
                <dt className="text-xs text-muted">{t("gradeLabel")}</dt>
                <dd className="mt-0.5 flex flex-wrap gap-2 text-forest">
                  {grades.map((grade) => (
                    <button
                      key={grade.id}
                      type="button"
                      onClick={() => setGradeId(grade.id)}
                      aria-pressed={selectedGrade?.id === grade.id}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs transition-colors ${
                        selectedGrade?.id === grade.id
                          ? "bg-gold-light/60 ring-1 ring-gold-deep"
                          : "bg-ivory-deep hover:bg-gold-light/40"
                      }`}
                    >
                      {grade.tier ? (
                        <span
                          className={`me-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${TIER_TONE[grade.tier]}`}
                        >
                          {gradeTierLabel(grade.tier, locale)}
                        </span>
                      ) : null}
                      {dateLineGradeLabel(product, grade.id, locale)}
                      <span className="ms-1 opacity-70">
                        {formatMoney[locale](grade.pricePerKg.amount)}
                      </span>
                    </button>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );

  return framed ? (
    <section
      id={product.slug}
      aria-labelledby={headingId}
      className="scroll-mt-24 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8"
    >
      {body}
    </section>
  ) : (
    <section aria-labelledby={headingId}>{body}</section>
  );
}
