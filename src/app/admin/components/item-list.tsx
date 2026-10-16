import Link from "next/link";

export interface ItemListRow {
  href: string;
  thumb?: string;
  title: string;
  slug: string;
  badge: string;
  note: string;
}

export function ItemList({
  title,
  description,
  items,
  newHref,
  newLabel,
  emptyText,
}: {
  title: string;
  description?: string;
  items: ItemListRow[];
  newHref: string;
  newLabel: string;
  emptyText: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">{title}</h1>
          {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
        </div>
        <Link
          href={newHref}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {newLabel}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {items.map((row) => (
            <li key={row.slug}>
              <Link href={row.href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-emerald-50/60">
                {row.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.thumb} alt="" className="h-12 w-12 rounded-lg border border-neutral-200 object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-lg">
                    📦
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-900">{row.title}</span>
                  <span className="block truncate text-xs text-neutral-500">{row.slug}</span>
                </span>
                <span className="hidden items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 md:inline-flex">
                  {row.badge}
                </span>
                <span className="hidden max-w-[220px] truncate text-xs text-neutral-500 lg:inline">{row.note}</span>
                <span className="text-neutral-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}