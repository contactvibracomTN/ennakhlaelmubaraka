"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getDirection } from "@/i18n/routing";

const SWIPE_THRESHOLD = 60;
const AUTOPLAY_MS = 4000;

/**
 * Product image slider — every photo of the product sheet slides through a
 * single viewport with a smooth right-to-left motion (the track is kept
 * `dir="ltr"` so the forward direction is always visually right → left,
 * including on RTL pages). Supports arrows, dot navigation, the thumbnail
 * strip, keyboard arrows and touch/mouse swipes.
 *
 * Autoplay (demande client) : les photos défilent toutes les 4 s, avec pause
 * au survol / au focus / pendant un glisser-déposer, et désactivé quand
 * l'utilisateur préfère un mouvement réduit.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const locale = useLocale();
  const t = useTranslations("product");
  const isRtl = getDirection(locale) === "rtl";

  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFrom, setDragFrom] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const last = count - 1;

  const goTo = (target: number) => {
    setIndex(Math.min(Math.max(target, 0), last));
  };
  const next = () => setIndex((i) => (i >= last ? 0 : i + 1));
  const prev = () => setIndex((i) => (i <= 0 ? last : i - 1));

  // Autoplay — restarted after any manual navigation (index in deps).
  useEffect(() => {
    if (count < 2 || paused || isDragging) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lastIndex = count - 1;
    const id = window.setInterval(() => {
      setIndex((i) => (i >= lastIndex ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused, isDragging, index]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (count < 2) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    setIsDragging(true);
    setDragFrom(event.clientX);
    setDragOffset(0);
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragOffset(event.clientX - dragFrom);
  };

  const endDrag = () => {
    if (!isDragging) return;
    const delta = isRtl ? -dragOffset : dragOffset;
    if (delta < -SWIPE_THRESHOLD) next();
    else if (delta > SWIPE_THRESHOLD) prev();
    setIsDragging(false);
    setDragOffset(0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = isRtl ? "ArrowLeft" : "ArrowRight";
    const backward = isRtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === forward) {
      event.preventDefault();
      next();
    } else if (event.key === backward) {
      event.preventDefault();
      prev();
    }
  };

  if (count === 0) return null;

  const transform = `translateX(calc(-${index * 100}% + ${dragOffset}px))`;
  const prevLabel = t("galleryPrev");
  const nextLabel = t("galleryNext");
  const showControls = count > 1;

  return (
    <div>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={alt}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative aspect-square cursor-grab touch-pan-y overflow-hidden rounded-3xl border border-line bg-ivory-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:cursor-grabbing"
      >
        <div
          dir="ltr"
          className={`flex h-full w-full ${
            isDragging ? "" : "transition-transform duration-500 ease-out"
          }`}
          style={{ transform }}
        >
          {images.map((src, i) => (
            <div
              key={src}
              aria-hidden={i !== index}
              className="relative h-full w-full shrink-0"
            >
              <Image
                src={src}
                alt={i === index ? alt : ""}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority={i === 0}
                draggable={false}
                className="object-cover select-none"
              />
            </div>
          ))}
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={prevLabel}
              className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/90 text-forest shadow-sm transition-colors hover:bg-gold-light/70 hover:text-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                isRtl ? "end-3" : "start-3"
              }`}
            >
              {isRtl ? (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={nextLabel}
              className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/90 text-forest shadow-sm transition-colors hover:bg-gold-light/70 hover:text-forest-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                isRtl ? "start-3" : "end-3"
              }`}
            >
              {isRtl ? (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${alt} ${i + 1} / ${count}`}
                  aria-current={i === index}
                  className={`h-2 cursor-pointer rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    i === index
                      ? "w-6 bg-gold-deep"
                      : "w-2 bg-surface/80 hover:bg-gold/80"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {showControls ? (
        <div
          className="mt-4 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${alt} ${i + 1} / ${count}`}
              aria-current={i === index}
              className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                i === index
                  ? "border-gold-deep"
                  : "border-line hover:border-gold/60"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 30vw, 15vw"
                draggable={false}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
