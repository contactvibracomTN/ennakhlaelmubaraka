/**
 * Route-segment loading fallback (SSR streaming state). Shown briefly while
 * each `[locale]` page streams; intentionally minimal and decorative.
 */
export default function Loading() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-6xl animate-pulse px-4 py-16 sm:px-6"
    >
      <div className="h-3 w-24 rounded bg-line" />
      <div className="mt-4 h-9 w-2/3 rounded bg-line" />
      <div className="mt-3 h-4 w-1/2 rounded bg-line" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-ivory-deep/40 p-4"
          >
            <div className="aspect-square rounded-xl bg-line" />
            <div className="mt-4 h-4 w-3/4 rounded bg-line" />
            <div className="mt-2 h-3 w-1/2 rounded bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
