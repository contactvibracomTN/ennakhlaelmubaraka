import type { CommerceProvider } from "@/types/commerce";
import type { OrderDraft, OrderResult, PaymentMethod } from "@/types/checkout";
import type { Locale } from "@/lib/config/locales";
import { staticProductRepository } from "@/lib/data/product-repository";
import { buildWhatsAppUrl } from "@/lib/config/site.config";
import { bankTransferOrderLines } from "@/lib/config/bank";
import { formatMoney } from "@/types/money";
import { isDateProduct } from "@/types/product";
import { pick } from "@/lib/data/localize";
import {
  dateLineGradeLabel,
  dateLineUnitPrice,
  formatWeightKg,
} from "@/lib/data/weight-price";
import { isFreeDeliveryEligible } from "@/lib/config/promos";

/**
 * Mock CommerceProvider (Blueprint §12) — V1 order flow.
 * NEVER charges anything: it assembles the order and hands it to WhatsApp
 * (plus a future optional webhook). Real providers (Tap/Moyasar/HyperPay)
 * swap in behind the same interface once a merchant account exists.
 */

type OrderLabels = {
  prefix: string;
  subtotal: string;
  deliveryFee: string;
  freeDelivery: string;
  shippingToConfirm: string;
  discount: string;
  total: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  deliveryMode: string;
  payment: string;
  iban: string;
  beneficiary: string;
  notes: string;
  kgUnit: string;
};

const LABELS: Record<Locale, OrderLabels> = {
  ar: {
    // mirrors messages/ar.json whatsapp.orderPrefix
    prefix: "طلب جديد من موقع النخلة المباركة:",
    subtotal: "المجموع الفرعي",
    deliveryFee: "الشحن",
    freeDelivery: "مجاني داخل المدينة المنورة (للفواتير أكثر من 200 ريال)",
    shippingToConfirm: "يُؤكَّد في المحادثة (~20 ريال داخل المدينة)",
    discount: "الخصم",
    total: "الإجمالي",
    customer: "الاسم",
    phone: "الجوال",
    city: "المدينة",
    address: "العنوان",
    deliveryMode: "طريقة الاستلام",
    payment: "طريقة الدفع",
    iban: "رقم الآيبان",
    beneficiary: "اسم الحساب",
    notes: "ملاحظات",
    kgUnit: "كجم",
  },
  en: {
    // mirrors messages/en.json whatsapp.orderPrefix
    prefix: "New order from Al Nakhlah Al Mubarakah website:",
    subtotal: "Subtotal",
    deliveryFee: "Shipping",
    freeDelivery: "Free within Madinah (invoices above SAR 200)",
    shippingToConfirm: "To be confirmed in the conversation (~SAR 20 within Madinah)",
    discount: "Discount",
    total: "Total",
    customer: "Name",
    phone: "Phone",
    city: "City",
    address: "Address",
    deliveryMode: "Delivery method",
    payment: "Payment",
    iban: "IBAN",
    beneficiary: "Account name",
    notes: "Notes",
    kgUnit: "kg",
  },
  fr: {
    // mirrors messages/fr.json whatsapp.orderPrefix
    prefix: "Nouvelle commande depuis le site d'Al Nakhlah Al Mubarakah :",
    subtotal: "Sous-total",
    deliveryFee: "Livraison",
    freeDelivery: "Gratuite à Médine (factures supérieures à 200 SAR)",
    shippingToConfirm: "À confirmer dans la conversation (~20 SAR à Médine)",
    discount: "Remise",
    total: "Total",
    customer: "Nom",
    phone: "Téléphone",
    city: "Ville",
    address: "Adresse",
    deliveryMode: "Mode de livraison",
    payment: "Paiement",
    iban: "IBAN",
    beneficiary: "Titulaire du compte",
    notes: "Notes",
    kgUnit: "kg",
  },
  tr: {
    // mirrors messages/tr.json whatsapp.orderPrefix
    prefix: "Al Nakhlah Al Mubarakah sitesinden yeni sipariş:",
    subtotal: "Ara toplam",
    deliveryFee: "Kargo",
    freeDelivery: "Medine içinde ücretsiz (200 SAR üzeri faturalar)",
    shippingToConfirm: "Sohbette onaylanacak (Medine içi ~20 SAR)",
    discount: "İndirim",
    total: "Toplam",
    customer: "Ad",
    phone: "Telefon",
    city: "Şehir",
    address: "Adres",
    deliveryMode: "Teslimat şekli",
    payment: "Ödeme",
    iban: "IBAN",
    beneficiary: "Hesap sahibi",
    notes: "Notlar",
    kgUnit: "kg",
  },
  ur: {
    // mirrors messages/ur.json whatsapp.orderPrefix
    prefix: "النخلۃ المبارکہ کی ویب سائٹ سے نیا آرڈر:",
    subtotal: "ذیلی کل",
    deliveryFee: "شپنگ",
    freeDelivery: "مدینہ میں مفت (200 ریال سے زیادہ کی انوائس)",
    shippingToConfirm: "بات چیت میں تصدیق کی جائے گی (~20 ریال مدینہ)",
    discount: "رعایت",
    total: "کل",
    customer: "نام",
    phone: "فون",
    city: "شہر",
    address: "پتہ",
    deliveryMode: "ڈیلیوری کا طریقہ",
    payment: "ادائیگی",
    iban: "IBAN",
    beneficiary: "اکاؤنٹ ہولڈر",
    notes: "نوٹس",
    kgUnit: "kg",
  },
  id: {
    // mirrors messages/id.json whatsapp.orderPrefix
    prefix: "Pesanan baru dari situs Al Nakhlah Al Mubarakah:",
    subtotal: "Subtotal",
    deliveryFee: "Pengiriman",
    freeDelivery: "Gratis di Madinah (faktur di atas SAR 200)",
    shippingToConfirm: "Dikonfirmasi dalam percakapan (~SAR 20 di Madinah)",
    discount: "Diskon",
    total: "Total",
    customer: "Nama",
    phone: "Telepon",
    city: "Kota",
    address: "Alamat",
    deliveryMode: "Metode pengiriman",
    payment: "Pembayaran",
    iban: "IBAN",
    beneficiary: "Pemilik rekening",
    notes: "Catatan",
    kgUnit: "kg",
  },
  bn: {
    // mirrors messages/bn.json whatsapp.orderPrefix
    prefix: "আল নাখলাহ আল মুবারাকাহ ওয়েবসাইট থেকে নতুন অর্ডার:",
    subtotal: "সাবটোটাল",
    deliveryFee: "ডেলিভারি",
    freeDelivery: "মদিনায় বিনামূল্যে (২০০ SAR-এর বেশি ইনভয়েস)",
    shippingToConfirm: "কথোপকথনে নিশ্চিত করতে হবে (মদিনায় ~২০ SAR)",
    discount: "ছাড়",
    total: "মোট",
    customer: "নাম",
    phone: "ফোন",
    city: "শহর",
    address: "ঠিকানা",
    deliveryMode: "ডেলিভারির পদ্ধতি",
    payment: "পেমেন্ট",
    iban: "IBAN",
    beneficiary: "অ্যাকাউন্ট হোল্ডার",
    notes: "নোট",
    kgUnit: "kg",
  },
  ms: {
    // mirrors messages/ms.json whatsapp.orderPrefix
    prefix: "Pesanan baharu dari laman Al Nakhlah Al Mubarakah:",
    subtotal: "Subjumlah",
    deliveryFee: "Penghantaran",
    freeDelivery: "Percuma di Madinah (invois melebihi SAR 200)",
    shippingToConfirm: "Akan disahkan dalam perbualan (~SAR 20 di Madinah)",
    discount: "Diskaun",
    total: "Jumlah",
    customer: "Nama",
    phone: "Telefon",
    city: "Bandar",
    address: "Alamat",
    deliveryMode: "Kaedah penghantaran",
    payment: "Pembayaran",
    iban: "IBAN",
    beneficiary: "Pemegang akaun",
    notes: "Nota",
    kgUnit: "kg",
  },
};

const DELIVERY: Record<Locale, { delivery: string; pickup: string }> = {
  ar: { delivery: "توصيل", pickup: "استلام من المتجر" },
  en: { delivery: "Delivery", pickup: "Store pickup" },
  fr: { delivery: "Livraison", pickup: "Retrait en magasin" },
  tr: { delivery: "Kargo", pickup: "Mağazadan teslim" },
  ur: { delivery: "ڈیلیوری", pickup: "اسٹور سے وصول" },
  id: { delivery: "Dikirim", pickup: "Ambil di toko" },
  bn: { delivery: "ডেলিভারি", pickup: "দোকান থেকে সংগ্রহ" },
  ms: { delivery: "Penghantaran", pickup: "Ambil di kedai" },
};

const PAYMENT: Record<Locale, Record<PaymentMethod, string>> = {
  ar: {
    whatsapp: "واتساب",
    cod: "الدفع عند الاستلام",
    "bank-transfer": "تحويل بنكي",
    online: "دفع إلكتروني",
  },
  en: {
    whatsapp: "WhatsApp",
    cod: "Cash on delivery",
    "bank-transfer": "Bank transfer",
    online: "Online payment",
  },
  fr: {
    whatsapp: "WhatsApp",
    cod: "Paiement à la livraison",
    "bank-transfer": "Virement bancaire",
    online: "Paiement en ligne",
  },
  tr: {
    whatsapp: "WhatsApp",
    cod: "Kapıda ödeme",
    "bank-transfer": "Banka havalesi",
    online: "Online ödeme",
  },
  ur: {
    whatsapp: "واٹس ایپ",
    cod: "ڈیلیوری پر ادائیگی",
    "bank-transfer": "بینک ٹرانسفر",
    online: "آن لائن ادائیگی",
  },
  id: {
    whatsapp: "WhatsApp",
    cod: "Bayar di tempat",
    "bank-transfer": "Transfer bank",
    online: "Pembayaran online",
  },
  bn: {
    whatsapp: "হোয়াটসঅ্যাপ",
    cod: "ডেলিভারিতে নগদ অর্থ",
    "bank-transfer": "ব্যাংক ট্রান্সফার",
    online: "অনলাইন পেমেন্ট",
  },
  ms: {
    whatsapp: "WhatsApp",
    cod: "Bayar semasa penghantaran",
    "bank-transfer": "Pindahan bank",
    online: "Pembayaran dalam talian",
  },
};

export class MockCommerceProvider implements CommerceProvider {
  async getProducts() {
    return staticProductRepository.getAllProducts();
  }

  async getProduct(slug: string) {
    return staticProductRepository.getProductBySlug(slug);
  }

  /** Assemble a human-readable WhatsApp order message (V1 channel). */
  async createOrder(draft: OrderDraft): Promise<OrderResult> {
    const { orderId, items, customer, delivery, payment, totals, locale } =
      draft;
    const l = LABELS[locale];
    const products = await this.getProducts();
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines = items.map((item) => {
      const product = byId.get(item.productId);
      const name = product ? pick(product.name, locale) : item.productId;
      const weightLabel =
        product && isDateProduct(product) && item.weightKgs != null
          ? formatWeightKg(locale, item.weightKgs, l.kgUnit)
          : "";
      const gradeLabel =
        product && isDateProduct(product) && item.gradeId != null
          ? dateLineGradeLabel(product, item.gradeId, locale)
          : "";
      let unit = product?.price.amount ?? 0;
      if (product && isDateProduct(product)) {
        unit = dateLineUnitPrice(product, item.weightKgs, item.gradeId);
      }
      const shownName = [name, weightLabel, gradeLabel]
        .filter(Boolean)
        .join(" ");
      return `• ${shownName} × ${item.quantity} — ${formatMoney[locale](
        unit * item.quantity,
      )}`;
    });

    const deliveryLine = DELIVERY[locale][delivery];
    const rows = [
      `${l.prefix} ${orderId}`,
      "",
      ...lines,
      "",
      `${l.subtotal}: ${formatMoney[locale](totals.subtotal)}`,
      /* Règle livraison (PO 2026-10) : gratuite à Médine quand la facture
         dépasse 200 SAR ; sinon le tarif (~20 SAR) est confirmé dans la
         conversation. Le retrait en magasin ne porte pas de ligne livraison. */
      delivery === "delivery"
        ? isFreeDeliveryEligible(totals.subtotal)
          ? `${l.deliveryFee}: ${l.freeDelivery}`
          : `${l.deliveryFee}: ${l.shippingToConfirm}`
        : "",
      /* La remise −10 % est retirée au lancement (PO 2026-10) — on n'imprime
         une ligne remise que si un montant y est réellement appliqué. */
      totals.discount > 0
        ? `${l.discount}: ${formatMoney[locale](totals.discount)}`
        : "",
      `${l.total}: ${formatMoney[locale](totals.total)}`,
      "",
      `${l.customer}: ${customer.name}`,
      `${l.phone}: ${customer.phone}`,
      customer.city ? `${l.city}: ${customer.city}` : "",
      customer.addressLine && delivery === "delivery"
        ? `${l.address}: ${customer.addressLine}`
        : "",
      `${l.deliveryMode}: ${deliveryLine}`,
      `${l.payment}: ${PAYMENT[locale][payment.method]}`,
      /* Bank lines are only appended when the IBAN actually validated — a
         customer must never receive a transfer instruction with a wrong or
         placeholder account number. */
      payment.method === "bank-transfer"
        ? bankTransferOrderLines({ iban: l.iban, beneficiary: l.beneficiary }).join("\n")
        : "",
      customer.notes ? `${l.notes}: ${customer.notes}` : "",
    ].filter(Boolean);

    const whatsappUrl = buildWhatsAppUrl(rows.join("\n"), locale);

    return {
      ok: true,
      orderId,
      channel: "whatsapp",
      whatsappUrl,
    };
  }
}

export const mockCommerceProvider = new MockCommerceProvider();
