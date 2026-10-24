const fs = require("fs");
for (const l of ["ar","en","fr","tr","ur","ms","bn","id"]) {
  const p = "src/messages/" + l + ".json";
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!j.giftRequest) {
    j.giftRequest = {
      eyebrow: "Gift Requests",
      title: "Large Orders / Box Diagnosis / Institutions",
      intro: "Use this form for large gift orders, box diagnosis, or institutional orders.",
      greeting: "Welcome to Al Nakhlah Al Mubarakah",
      fullName: "Full Name",
      city: "City",
      phone: "Phone / WhatsApp",
      object: "Purpose",
      objectPh: "Select purpose",
      objectOptions: {
        "large-order": "Large order",
        "box-diagnosis": "Box diagnosis request",
        "institutions": "Institutional orders"
      },
      quantity: "Requested quantity",
      productType: "Product / Box type",
      organization: "Organization / Entity",
      occasion: "Occasion",
      budget: "Estimated budget",
      deliveryDate: "Requested delivery date",
      details: "Additional details",
      fullNamePh: "Enter your full name",
      cityPh: "Enter city",
      phonePh: "e.g. 05XXXXXXXX",
      quantityPh: "e.g. 50 boxes or more",
      productTypePh: "e.g. gifts, custom boxes",
      organizationPh: "Company / Institution name",
      occasionPh: "e.g. wedding, Eid, corporate",
      budgetPh: "e.g. 1000 SAR",
      deliveryDatePh: "e.g. 2026-12-01",
      detailsPh: "Add details or requirements",
      submitWhatsApp: "Send via WhatsApp",
      message: "Gift/Institutional Request — Al Nakhlah Al Mubarakah:\nFull Name: {name}\nCity: {city}\nPhone/WhatsApp: {phone}\nPurpose: {object}\nQuantity: {quantity}\nProduct/Box: {productType}\nOrganization: {organization}\nOccasion: {occasion}\nBudget: {budget}\nDelivery date: {deliveryDate}\nDetails: {details}"
    };
    if (l === "ar") {
      j.giftRequest = {
        eyebrow: "طلبات الهدايا",
        title: "طلبات كبيرة / تشخيص بوكسات / مؤسّسات",
        intro: "استخدم هذا النموذج لطلبات الهدايا الكبيرة أو لطلب تشخيص البوكسات أو للطلبات المؤسّسية.",
        greeting: "مرحبًا بك في النخلة المباركة 🌴",
        fullName: "الإسم الكامل",
        city: "المدينة",
        phone: "رقم الهاتف / الواتساب",
        object: "الهدف",
        objectPh: "اختر الغرض",
        objectOptions: {"large-order":"طلبيّة كبيرة","box-diagnosis":"طلب تشخيص البوكسات","institutions":"طلبات للمؤسّسات"},
        quantity: "الكمّية المطلوبة",
        productType: "نوع المنتج / نوع البوكس المطلوب",
        organization: "اسم المؤسّسة / الجهة",
        occasion: "المناسبة",
        budget: "الميزانية التقديرية",
        deliveryDate: "تاريخ التسليم المطلوب",
        details: "تفاصيل إضافية",
        fullNamePh: "اكتب اسمك الكامل",
        cityPh: "اكتب اسم المدينة",
        phonePh: "مثال: 05XXXXXXXX",
        quantityPh: "مثال: 50 علبة أو أكثر",
        productTypePh: "مثال: هدايا، بوكسات مخصصة",
        organizationPh: "اسم الشركة / المؤسسة",
        occasionPh: "مثال: زفاف، عيد، مناسبة مؤسّسية",
        budgetPh: "مثال: 1000 ر.س",
        deliveryDatePh: "مثال: 2026-12-01",
        detailsPh: "أضف أي تفاصيل أو متطلبات",
        submitWhatsApp: "إرسال عبر واتساب",
        message: "طلب هدايا / مؤسّسات — النخلة المباركة:\nالإسم الكامل: {name}\nالمدينة: {city}\nرقم الهاتف / الواتساب: {phone}\nالهدف: {object}\nالكمّية المطلوبة: {quantity}\nنوع المنتج / البوكس: {productType}\nاسم الجهة / المؤسّسة: {organization}\nالمناسبة: {occasion}\nالميزانية التقديرية: {budget}\nتاريخ التسليم: {deliveryDate}\nتفاصيل إضافية: {details}"
      };
    }
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
  }
}
console.log("done");
