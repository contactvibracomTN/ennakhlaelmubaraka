import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Next.js 16 configuration.
 * - next-intl plugin loads `src/i18n/request.ts` for per-locale request config.
 * - Images: AVIF/WebP formats (brief §40); local assets only in V1 (no remotePatterns).
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /**
   * Pin Turbopack's workspace root to this project. Without it, Turbopack walks
   * up the tree looking for a lockfile and finds `C:\Users\BY 4\package-lock.json`
   * (the home directory), then warns that it ignored it — and the workspace it
   * picks influences what gets watched and what is considered part of the app.
   */
  turbopack: {
    root: __dirname,
  },
  experimental: {
    /**
     * `next build` fans static generation out over
     * `min(experimental.cpus, ceil(pages / staticGenerationMinPagesPerWorker))`
     * workers. This build renders 649 pages, so the default of 25 pages per
     * worker picks 7 workers (this machine has 8 cores), each holding the full
     * dataset plus a render tree. On this 7.7 GB box — with a browser open —
     * they died at ~324/649 pages with
     * `Zone Allocation failed — process out of memory`.
     *
     * 657 → one worker for the export step (649 pages + the /bulk-order page
     * in each of the 8 locales, PO 13/10/2026). Slower, but the emitted HTML,
     * the route manifest and the incremental cache are byte-identical: only
     * the fan-out changes. The status line still reads "7 workers": it prints
     * the pre-cap value derived from `experimental.cpus`, before the cap above
     * is applied inside the export runner.
     */
    staticGenerationMinPagesPerWorker: 657,
  },
  async redirects() {
    return [
      // العجوة is a single page (PO 2026-10): /dates/ajwa hosts every Ajwa
      // product as a card (عجوة المدينة + عجوة العالية). The legacy slugs
      // keep resolving for old links / bookmarks.
      {
        source: "/:locale/dates/ajwa-medina",
        destination: "/:locale/dates/ajwa",
        permanent: true,
      },
      {
        source: "/:locale/dates/ajwa-small",
        destination: "/:locale/dates/ajwa",
        permanent: true,
      },
      {
        source: "/:locale/dates/ajwa-aaliya",
        destination: "/:locale/dates/ajwa",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);