// ============================================================================
//  النخلة المباركة — CONFIGURATION DU SITE (seul fichier que vous devez toucher)
//  Al Nakhlah Al Mubarakah — SITE CONFIG (the only file you normally edit)
//  ✏️  Pour changer quelque chose : modifiez ce fichier, puis relancez
//      « node tools/build.mjs » (ou demandez à votre développeur).
//  📝  To change anything: edit this file, then re-run « node tools/build.mjs ».
// ============================================================================

export const CONFIG = {
  /* ----------------------------------------------------------------------
   * 1) IDENTITÉ DE LA BOUTIQUE / STORE IDENTITY
   * -------------------------------------------------------------------- */
  brandNameAr: "النخلة المباركة للتّمور الفاخرة",
  brandNameEn: "Al Nakhlah Al Mubarakah — Premium Dates",
  brandShortAr: "النخلة المباركة",
  brandShortEn: "Al Nakhlah Al Mubarakah",
  taglineAr: "دقّة المدينة، مذاقٌ لا يُنسى",
  taglineEn: "Madinah's dates, an unforgettable taste",

  /* --- WhatsApp (format international, SANS + et sans espaces) --- */
  whatsappNumber: "966596101097",

  /* --- Téléphone affiché / Display phone --- */
  phoneDisplay: "+966 59 610 1097",

  /* --- Email --- */
  email: "nakhla.mubaraka26@gmail.com",

  /* --- Adresses / Addresses --- */
  addressAr: "المتجر رقم 49، سوق التمور المركزي، حي الوبرة، المدينة المنورة 42371، المملكة العربية السعودية",
  addressEn: "Shop No. 49, Central Dates Market, Al Wabra, Madinah 42371, Saudi Arabia",
  mapLabelAr: "المتجر رقم 49 — سوق التمور المركزي",
  mapLabelEn: "Shop No. 49 — Central Dates Market",
  mapsUrl:
    "https://www.google.com/maps/place/%D8%A7%D9%84%D9%86%D8%AE%D9%84%D8%A9+%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%83%D8%A9%E2%80%AD/@24.4621403,39.5837771,17z/data=!3m1!4b1!4m6!3m5!1s0x15bdbf005bd1b483:0x3c31db3f9c91aeb7!8m2!3d24.4621403!4d39.5837771!16s%2Fg%2F11x8k104lw?hl=ar&entry=ttu",

  /* --- Réseaux sociaux / Social networks --- */
  socials: {
    facebook: {
      url: "https://www.facebook.com/AlNakhlahAlMubarakahLitoumour",
      labelAr: "فيسبوك",
      labelEn: "Facebook",
    },
    instagram: {
      url: "https://www.instagram.com/nakhla_mubaraka/",
      labelAr: "إنستغرام",
      labelEn: "Instagram",
    },
    tiktok: {
      url: "https://www.tiktok.com/@nakhlamubaraka",
      labelAr: "تيك توك",
      labelEn: "TikTok",
    },
    snapchat: {
      url: "https://snapchat.com/t/i6fjhAmM",
      labelAr: "سناب شات",
      labelEn: "Snapchat",
    },
  },

  /* ----------------------------------------------------------------------
   * 2) SITE / SEO
   *    🌐 SiteUrl : mettez l'adresse finale du site (ex : https://nakhla.com)
   *    une fois le site en ligne. Tant qu'il est vide, le site reste
   *    « noindex » (non indexé par Google), ce qui est prudent.
   * -------------------------------------------------------------------- */
  siteUrl: "", // ex: "https://nakhla.example.com"
  defaultLang: "ar", // langue par défaut
  localeAr: "ar-SA",
  localeEn: "en-SA",

  /* ----------------------------------------------------------------------
   * 3) MESURE & MARKETING (GA4 / Clarity / Meta / TikTok)
   *    👍 Règle d'or : laissez VIDE tout ce que vous n'utilisez pas encore.
   *    Le site ne charge un script QUE si l'identifiant est rempli.
   *    ⭐ Un enfant peut le faire : copier-coller son identifiant ici.
   * -------------------------------------------------------------------- */
  analytics: {
    // Google Analytics 4 — identifiant "G-XXXXXXXXXX"
    ga4Id: "",
    // Google Tag Manager — identifiant "GTM-XXXXXXX" (facultatif si GA4 direct)
    gtmId: "",
    // Microsoft Clarity — identifiant projet "abcdefghij"
    clarityId: "",
    // Meta Pixel (Facebook) — identifiant numérique
    metaPixelId: "",
    // TikTok Pixel — identifiant "ABCDEFGHIJKLMNOPQRS"
    tiktokPixelId: "",
    // true = affichera un bandeau de consentement cookies (à activer plus tard)
    consentRequired: false,
  },

  /* ----------------------------------------------------------------------
   * 4) AUTOMATISATION / ORDERS
   *    🔗 Webhook : collez ici l'URL d'un scénario Make / Zapier / n8n
   *    pour recevoir chaque demande de commande en JSON automatiquement.
   *    (Optionnel — WhatsApp reste le canal principal.)
   * -------------------------------------------------------------------- */
  orderWebhookUrl: "",

  /* ----------------------------------------------------------------------
   * 5) PAIEMENTS EN LIGNE
   *    💳 mode "demo" : les moyens de paiement digitaux (mada, Visa/
   *    Mastercard, Apple Pay, Google Pay) sont affichés au checkout, mais
   *    la commande part via WhatsApp (aucun encaissement automatique).
   *    ➡️ Passer à "live" uniquement APRÈS avoir créé le compte marchand
   *    chez un prestataire agréé (Hyperpay / Tap / Moyasar / Stripe…) ;
   *    le checkout redirigera alors vers sa page de paiement hébergée.
   * -------------------------------------------------------------------- */
  payments: {
    mode: "demo", // "demo" | "live"
    provider: "", // ex: "hyperpay", "tap", "moyasar", "stripe"
    /* 💳 Virement bancaire direct (aucun compte marchand requis) :
       remplacez l'IBAN ci-dessous par celui du client dès qu'il vous le fournit.
       L'IBAN + le montant total s'affichent au checkout quand « تحويل بنكي »
       est sélectionné, et l'IBAN est inclus dans le message WhatsApp. */
    iban: "SA00 0000 0000 0000 0000 0000",
    beneficiary: "النخلة المباركة", // اسم الحساب الظاهر أثناء التحويل
  },
};

// ---------------------------------------------------------------------------
// CI-DESSOUS : petits calculs dérivés — ne rien modifier / derived values, do NOT edit
// ---------------------------------------------------------------------------
export const WHATSAPP_LINK = `https://wa.me/${CONFIG.whatsappNumber}`;
export const HAS_SITE_URL = Boolean(CONFIG.siteUrl);
export const ANALYTICS_IDS = CONFIG.analytics;