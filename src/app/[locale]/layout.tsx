import type { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
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
      {/* Google Tag Manager — exact Google snippet, as high as possible in the
          document (right at the top of <head>), so the container boots before
          any other tag. */}
      <head>
        {/* The official GTM snippet must sit directly in <head> (Google's
            requirement), so we render it raw rather than via next/script —
            React keeps exactly one <head> and merges the metadata into it. */}
        {siteConfig.analytics.gtmId ? (
          /* eslint-disable-next-line @next/next/next-script-for-ga */
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${siteConfig.analytics.gtmId}');`,
            }}
          />
        ) : null}
      </head>
      <body className="flex min-h-dvh flex-col bg-ivory text-foreground antialiased">
        {/* Google Tag Manager (noscript) — right after <body> (Google's
            requirement). Rendered only when a GTM id is configured. */}
        {siteConfig.analytics.gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${siteConfig.analytics.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}

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

            {/* Analytics — when `managedByGtm` is true, the GTM container is the
                only tag injected (GA4 + Meta Pixel live INSIDE GTM, single
                source of truth → no double counting). Otherwise the app loads
                GA4 + Meta directly (legacy behaviour). */}
            {siteConfig.analytics.ga4Id && !siteConfig.analytics.managedByGtm ? (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.ga4Id}`}
                  strategy="afterInteractive"
                />
                <Script id="ga4-init" strategy="afterInteractive">
                  {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${siteConfig.analytics.ga4Id}');`}
                </Script>
              </>
            ) : null}
            {siteConfig.analytics.metaPixelId &&
            !siteConfig.analytics.managedByGtm ? (
              <>
                <Script id="meta-pixel" strategy="afterInteractive">
                  {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${siteConfig.analytics.metaPixelId}');
fbq('track', 'PageView');`}
                </Script>
                <noscript>
                  {/* The Meta Pixel fallback must stay a plain tracking pixel —
                      next/image would rewrite its src. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${siteConfig.analytics.metaPixelId}&ev=PageView&noscript=1`}
                    alt=""
                  />
                </noscript>
              </>
            ) : null}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
