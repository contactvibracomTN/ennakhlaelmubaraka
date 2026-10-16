import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Demo figures band. The +25 years / +2000 clients figures come from the
 * previous site and are NOT yet validated — Blueprint §11 requires them
 * to stay visibly marked as demo until approved.
 */
export async function Stats() {
  const t = await getTranslations("home");

  const stats = [
    {
      key: "years",
      value: t("stats.years.value"),
      label: t("stats.years.label"),
    },
    {
      key: "clients",
      value: t("stats.clients.value"),
      label: t("stats.clients.label"),
    },
    {
      key: "varieties",
      value: t("stats.varieties.value"),
      label: t("stats.varieties.label"),
    },
    {
      key: "location",
      value: t("stats.location.value"),
      label: t("stats.location.label"),
    },
  ];

  return (
    <section
      aria-label={t("demoNote")}
      className="mx-auto max-w-6xl px-4 sm:px-6"
    >
      <div className="my-14 rounded-3xl border border-gold/50 bg-gold-light/40 px-6 py-8 sm:px-10">
        <p className="max-w-3xl text-sm font-medium leading-relaxed text-forest">
          {t("demoNote")}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center lg:text-start">
              <dd className="font-arabic-display text-3xl font-bold text-date-deep">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-7">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-date-deep/40 px-5 py-2.5 text-sm font-semibold text-date-deep transition-colors hover:bg-date-deep hover:text-ivory"
          >
            {t("demoPricesCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
