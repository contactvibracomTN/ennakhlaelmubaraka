/**
 * Shared listing-page header band (dates / gifts / guide).
 */
export function CatalogHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-line bg-ivory-deep/40">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
        <p className="text-sm font-semibold tracking-widest text-date-soft uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-arabic-display text-3xl font-bold text-forest sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
