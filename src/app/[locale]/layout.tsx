import type { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Amiri,
  IBM_Plex_Sans_Arabic,
  Marcellus,
  Inter,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Bengali,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getLocaleMeta, localesMeta } from "@/lib/config/locales";
import { siteConfig } from "@/lib/config/site.config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementMarquee } from "@/components/layout/announcement-marquee";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
// Local SVG flag assets (no external request, no emoji dependency).
// Imported before globals so Tailwind utilities can size the flags.
import "flag-icons/css/flag-icons.min.css";
import "../globals.css";

/* ---------------------------------------------------------------------------
 * Typography (Blueprint V3 §art-direction).
 * Amiri            — Arabic display (headings)
 * IBM Plex Sans Arabic — Arabic UI (body/interface)
 * Marcellus        — Latin display (english headings)
 * Inter            — Latin UI
 * Noto Nastaliq Urdu   — Urdu UI (Nastaliq script)
 * Noto Sans Bengali    — Bengali UI
 * Variables are wired to the `@theme` tokens in globals.css.
 * ------------------------------------------------------------------------- */
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-urdu",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = getLocaleMeta(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const siteName =
    locale === "ar" ? siteConfig.brand.nameAr : siteConfig.brand.nameEn;
  // metadataBase → URLs absolues (canonical/OG/hreflang). Positionné dès
  // qu'un domaine de production est défini ; sinon résolution relative
  // (site en noindex, silhouette de dev).
  const origin = siteConfig.siteUrl.length > 0 ? new URL(siteConfig.siteUrl) : undefined;
  // Canonical/og:url est scopé par locale (racine pour la locale par défaut) ;
  // chaque page le surcharge avec son chemin réel via `buildPageMetadata` (§31).
  const canonicalPath = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: origin,
    title: { default: siteName, template: t("titleTemplate") },
    description: t("description"),
    applicationName: siteName,
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(
        localesMeta.map((m) => [m.bcp47, `/${m.code}`]),
      ),
    },
    openGraph: {
      type: "website",
      locale: meta?.bcp47,
      siteName,
      title: siteName,
      description: t("description"),
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: t("description"),
    },
    robots: {
      index: siteConfig.siteUrl.length > 0,
      follow: siteConfig.siteUrl.length > 0,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  // Serve 404 for unknown locales instead of a blank page.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for all routes in the app (next-intl).
  setRequestLocale(locale);

  const meta = getLocaleMeta(locale);
  const t = await getTranslations("common");

  return (
    <html
      lang={meta?.bcp47 ?? "ar-SA"}
      dir={meta?.dir ?? "rtl"}
      className={`${amiri.variable} ${plexArabic.variable} ${marcellus.variable} ${inter.variable} ${notoNastaliqUrdu.variable} ${notoSansBengali.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col bg-ivory text-foreground antialiased">
        <NextIntlClientProvider>
          <CartProvider>
            <a href="#main" className="skip-link">
              {t("skipToContent")}
            </a>
            <AnnouncementMarquee />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppFloat />
            <ConsentBanner />
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
