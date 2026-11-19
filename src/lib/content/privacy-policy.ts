import type { Locale } from "@/lib/config/locales";

/**
 * Privacy policy content. Kept outside the message catalogues because the text
 * is long, structured, and must stay identical in meaning across languages.
 * Every statement here describes an existing data flow in the codebase.
 */
export type PrivacySubsection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type PrivacySection = {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
  paragraphsAfterList?: string[];
  subsections?: PrivacySubsection[];
};

export type PrivacyContent = {
  intro: string;
  effectiveDate: string;
  sections: PrivacySection[];
};

const ar: PrivacyContent = {
  intro:
    "تشرح هذه السياسة البيانات التي يعالجها الموقع، ولماذا، ولمن تُرسل، وكم تبقى محفوظة. تسري على ennakhlaelmubaraka.com وكل لغاته وعلى محادثات الطلب عبر واتساب والبريد الإلكتروني.",
  effectiveDate: "آخر تحديث: ١٩ نوفمبر ٢٠٢٦",
  sections: [
    {
      id: "controller",
      heading: "الجهة المسؤولة ونطاق السياسة",
      paragraphs: [
        "الجهة المسؤولة عن معالجة البيانات هي مؤسسة النخلة المباركة للتجارة، مسجّلة في المملكة العربية السعودية برقم سجل تجاري ٧٠٤٣٤٩٧٦٣٠، وعنوانها: محل رقم ٤٩، سوق التمر المركزي، الورقاء، المدينة المنورة ٤٢٣٧١، المملكة العربية السعودية.",
        "لأي سؤال أو طلب يتعلق ببياناتك: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) أو [+966 59 610 1097](https://wa.me/966596101097). طلبات الهدايا والطلبات الكبيرة تصل أيضاً إلى [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com).",
        "تغطي هذه السياسة الموقع وقنوات الطلب المرتبطة به. الخدمات الخارجية التي تفتحها من الموقع (واتساب، خرائط Google، منصات التواصل) تخضع لقواعدها الخاصة.",
      ],
    },
    {
      id: "limits",
      heading: "ما لا يفعله الموقع",
      paragraphs: [
        "الموقع لا يقبل الدفع الإلكتروني حالياً. لا يطلب رقم بطاقة بنكية ولا رمزاً ولا رقم IBAN. يتم الاتفاق على الدفع مباشرة مع المتجر، عادةً عبر تحويل بنكي. هذا الحد سارٍ حالياً وقد يتغير في أي وقت؛ وتحتفظ شركتنا بحق تغييره في أي وقت دون إشعار مسبق، ونُحدّث سياسة الخصوصية وفقاً لذلك.",
        "الطلبات لا تُسجّل في قاعدة بيانات عملاء: تُستخدم بياناتها لإنشاء رسالة واتساب وتجهيز الطلب. أما التقييمات المنشورة فتُحفظ في قاعدة بيانات منفصلة.",
        "لا نبيع بياناتك ولا نرسلها إلى معلنين. الجهات الوحيدة التي تصل إليها هي مزوّدو الخدمة التقنيون اللازمون للموقع، والخدمات التي تختار استخدامها بنفسك.",
      ],
    },
    {
      id: "collection",
      heading: "البيانات التي نجمعها وأغراضها وأساسها النظامي",
      paragraphs: [],
      subsections: [
        {
          heading: "الطلب",
          paragraphs: [
            "يجمع نموذج الطلب الاسم ورقم الجوال والبريد الإلكتروني والمدينة والعنوان عند اختيار التوصيل وطريقة التوصيل ووسيلة الدفع والملاحظات ومحتوى السلة. تمر هذه البيانات عبر خادمنا لإنشاء رابط واتساب. تحتوي الرسالة على الاسم ورقم الجوال والمدينة والعنوان والأصناف والاختيارات والملاحظات، ولا يحتوي البريد الإلكتروني.",
            "الغرض: تجهيز الطلب وتأكيده ومتابعته. الأساس النظامي: تنفيذ الاتفاق أو عقد سابق (المادة ٦ من نظام حماية البيانات الشخصية، والمادة ٦/١/ب من لائحة GDPR).",
          ],
        },
        {
          heading: "التواصل وطلبات الهدايا والكميات الكبيرة",
          paragraphs: [
            "لا يطلب نموذج التواصل سوى الاسم والرسالة، ويفتح واتساب مباشرة في متصفحك دون المرور بخوادمنا.",
            "يجمع نموذج الهدايا الاسم والمدينة ورقم الجوال والغرض والكمية ونوع المنتج والجهة والمناسبة والميزانية والتاريخ والتفاصيل. ويجمع نموذج الطلب الكبير الاسم والمدينة ورقم الجوال والكمية والصنف والدرجة. تُرسل نسخة إلى [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) عبر خادمنا، وتُفتح الرسالة نفسها في واتساب.",
            "الغرض: الرد عليك وإعداد عرض. الأساس النظامي: طلبك والاتفاق السابق (المادة ٦ من النظام، والمادة ٦/١/ب من اللائحة).",
          ],
        },
        {
          heading: "تقييمات العملاء",
          paragraphs: [
            "يجمع نموذج التقييم الاسم ورقم واتساب والمهنة والجنسية والدولة والنص والتقييم واللغة. لا يُعرض رقم واتساب ولا الملاحظات الداخلية للعامة.",
            "الغرض: مراجعة التقييم ثم نشره باسمك ومهنتك ودولتك. الأساس النظامي: موافقتك الصريحة (المادة ٥ من النظام، والمادة ٦/١/أ من اللائحة).",
          ],
        },
        {
          heading: "البيانات التقنية",
          paragraphs: [
            "يسجّل مزوّد الاستضافة تلقائياً عنوان IP ونوع المتصفح والصفحات التي زُرت وأوقات الزيارة ورسائل الخطأ. الغرض: تشغيل الموقع وحمايته. الأساس النظامي: مصلحتنا المشروعة في استمرار الخدمة، في الحدود التي يسمح بها النظام (المادة ٦ من النظام، والمادة ٦/١/و من اللائحة).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "من يصل إلى البيانات",
      paragraphs: [
        "يستضيف Vercel الموقع ويشغّل الدوال التي تُنشئ رسائل الطلب. وتحفظ Neon التقييمات في قاعدة PostgreSQL في المنطقة eu-central-1. ويُرسل Hostinger رسائل الطلبات بالبريد الإلكتروني. ولا تُحمّل أدوات القياس من Google وMeta إلا بعد موافقتك. قد تُرسل البيانات إلى الجهات الرسمية إذا ألزمت بذلك أنظمة قائمة.",
        "لا تصل هذه المعلومات إلى تاجر آخر ولا إلى وسطاء بيانات. تتم معالجة محادثات واتساب والبريد وفق شروط Meta ومزوّد البريد الإلكتروني.",
      ],
    },
    {
      id: "transfers",
      heading: "النقل إلى خارج المملكة",
      paragraphs: [
        "تُعالج البيانات في المملكة العربية السعودية، وفي الاتحاد الأوروبي (قاعدة التقييمات)، لدى مزوّدين قد تقوم بنيتهم التحتية في الولايات المتحدة أو أماكن أخرى (Vercel وGoogle وMeta وHostinger).",
        "نطلب من هؤلاء المزوّدين ضمانات مقبولة بموجب النظام، وبموجب قواعد GDPR للمنطقة الاقتصادية الأوروبية والمملكة المتحدة: قرارات ملاءمة أو بنود تعاقدية قياسية. يمكنك مراسلتنا لمعرفة الآلية المطبّقة على كل مزوّد.",
        "مسؤول البيانات بالنسبة لأشخاص المنطقة الاقتصادية الأوروبية والمملكة المتحدة هو الكيان السعودي المذكور في أول هذه السياسة. لا يوجد حالياً ممثل أوروبي منشور هنا؛ وإذا لزم تعيين ممثل بموجب المادة ٢٧ من GDPR، فستُنشر بياناته هنا قبل أي معالجة مرتبطة بذلك.",
      ],
    },
    {
      id: "retention",
      heading: "مدد الحفظ",
      paragraphs: [
        "الطلبات: نحذف محادثات المتجر خلال ٢٤ شهراً من آخر تواصل، إلا إذا اقتضى نزاع أو التزام نظامي الإبقاء عليها. نسخ واتساب/Meta تخضع لقواعدها هي.",
        "طلبات الهدايا والكميات الكبيرة: تُحفظ رسائل البريد الإلكتروني ٢٤ شهراً ثم تُحذف، إلا عند وجود نزاع.",
        "التقييمات: يُحذف التقييم غير المنشور خلال ٣٠ يوماً. ويبقى التقييم المنشور متاحا على الموقع ما لم تطلب إزالته.",
        "السجلات التقنية: تُحفظ للمدة القصيرة التي يحتاجها مزوّد الاستضافة لتشخيص الحوادث.",
        "اختيار الموافقة: يُحفظ في متصفحك حتى تغيّره أو تمسح تخزين الموقع.",
        "السلة: تُحفظ في متصفحك حتى إتمام الطلب أو مسح تخزين الموقع.",
        "جلسة الإدارة: ملف تعريف ارتباط للجلسة يقتصر على المخولين، ويُحذف عند الخروج أو إغلاق المتصفح.",
      ],
    },
    {
      id: "cookies",
      heading: "ملفات تعريف الارتباط والتخزين المحلي والقياس",
      paragraphs: [
        "تستخدم السلة واختيار الموافقة التخزين المحلي في المتصفح. كلاهما لازم للخدمة التي طلبتها ولا يحتاجان موافقة مسبقة.",
        "يستخدم نطاق الإدارة ملف ارتباط جلسة للموظفين المخولين فقط، ولا يُستخدم لتتبع الزوار.",
        "لا يُحمّل Google Tag Manager ولا الأدوات بداخله (GA4، وربما Meta Pixel) إلا بعد موافقتك. الرفض أسهل مثل القبول تماماً. يمكنك تغيير رأيك في أي وقت عبر «إعدادات ملفات تعريف الارتباط» في تذييل الصفحة.",
        "روابط خرائط Google ومنصات التواصل لا تُحمّل شيئاً قبل أن تضغط عليها.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "نشر التقييمات",
      paragraphs: [
        "لا يُحفظ التقييم إلا إذا وضعت علامة في المربع الذي يسمح بنشر اسمك ومهنتك ودولتك. هذا المربع هو موافقتك الصريحة.",
        "يمكنك سحب الموافقة في أي وقت بالمراسلة على [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com). يُزال التقييم خلال ٣٠ يوماً. ولا يجعل السحب النشر السابق غير نظامي.",
      ],
    },
    {
      id: "rights",
      heading: "حقوقك",
      paragraphs: [
        "لك الحق في:",
      ],
      list: [
        "الاطلاع على بياناتك والحصول على نسخة منها.",
        "تصحيحها.",
        "حذفها.",
        "سحب الموافقة.",
        "الاعتراض على معالجة تستند إلى مصلحة مشروعة.",
        "طلب تقييد المعالجة.",
        "استلام البيانات التي قدمتها بصيغة مقروءة ونقلها إلى جهة أخرى حين ينص النظام على ذلك.",
        "تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) أو إلى جهة حماية البيانات في بلد إقامتك داخل المنطقة الاقتصادية الأوروبية أو إلى مكتب المعلومات بالمملكة المتحدة (ICO).",
      ],
      paragraphsAfterList: [
        "راسلنا على [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) أو [+966 59 610 1097](https://wa.me/966596101097). نجيب خلال ٣٠ يوماً بموجب النظام، مع إمكانية تمديد ٣٠ يوماً أخرى إذا تطلب الأمر جهداً غير متناسب، ونخبرك بذلك مسبقاً. وبموجب GDPR فالمدة شهر واحد قابلة للتمديد شهرين. قد نطلب التحقق من الهوية.",
      ],
    },
    {
      id: "security",
      heading: "الأمان والحوادث",
      paragraphs: [
        "يستخدم الموقع بروتوكول HTTPS، ووصولاً إدارياً محمياً، وتحققاً من النماذج على الخادم، وسجلات أمنية. وتُحفظ النسخ الاحتياطية الإدارية في مساحة مقيّدة.",
        "عند وقوع حادثة بيانات قد تضر بحقوقك، نُبلغ سدايا خلال ٧٢ ساعة حين يقتضي النظام السعودي ذلك، ونُبلغ الأشخاص المعنيين عند ارتفاع الخطر. وبموجب GDPR يتم إبلاغ السلطة خلال ٧٢ ساعة، ويُبلّغ الأشخاص المعنيون في حالة الخطر المرتفع.",
      ],
    },
    {
      id: "children",
      heading: "الأطفال",
      paragraphs: [
        "الموقع غير موجه لمن تقل أعمارهم عن ١٦ عاماً. لا نجمع بياناتهم عن قصد. لأي ولي أمر يلاحظ ذلك أن يطلب الحذف الفوري.",
      ],
    },
    {
      id: "marketing",
      heading: "التسويق والقرارات الآلية",
      paragraphs: [
        "لا نرسل رسائل ترويجية دون موافقة مسبقة. ولا نتخذ قراراً له أثر قانوني أو مؤثر من خلال المعالجة الآلية وحدها.",
      ],
    },
    {
      id: "changes",
      heading: "تعديلات السياسة",
      paragraphs: [
        "تُنشر أي تعديلات هنا مع تاريخ جديد. وفي التغييرات المهمة نضيف إشعاراً واضحاً داخل الموقع.",
      ],
    },
  ],
};

const en: PrivacyContent = {
  intro:
    "This policy explains what data the site processes, why, who receives it, and how long it is kept. It covers ennakhlaelmubaraka.com, every language version, and our order conversations on WhatsApp and email.",
  effectiveDate: "Last updated: 19 November 2026",
  sections: [
    {
      id: "controller",
      heading: "Controller and scope",
      paragraphs: [
        "The controller is مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah), a Saudi business registered under commercial registration 7043497630, at Shop No. 49, Central Dates Market, Al Wabra, Madinah 42371, Saudi Arabia.",
        "For any question or request about your data: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) or [+966 59 610 1097](https://wa.me/966596101097). Gift and bulk requests also reach [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com).",
        "This policy covers the site and its order channels. Third-party services you open from the site (WhatsApp, Google Maps, social networks) have their own rules.",
      ],
    },
    {
      id: "limits",
      heading: "What the site does not do",
      paragraphs: [
        "The site currently has no online payment. It does not ask for a card number, a card code, or an IBAN. Payment is agreed directly with the shop, usually by bank transfer. This limit is in force at present and may change at any time. Our company reserves the right to change it at any time without prior notice, and we will update this privacy policy accordingly.",
        "Orders are not entered into a customer database: the details are used to build a WhatsApp message and prepare the order. Published reviews are stored in a separate database.",
        "We do not sell your data and do not send it to advertisers. The only recipients are the technical providers needed to run the site, and the services you choose to use yourself.",
      ],
    },
    {
      id: "collection",
      heading: "Data we collect, purposes, and legal bases",
      paragraphs: [],
      subsections: [
        {
          heading: "Checkout",
          paragraphs: [
            "The checkout form collects name, phone, email, city, address when delivery is selected, delivery method, payment method, notes, and cart contents. The data passes through our server to create the WhatsApp link. The message contains the name, phone, city, address, items, choices, and notes; the email is not included.",
            "Purpose: to prepare, confirm, and follow up the order. Legal basis: performance of a contract or a prior agreement (Article 6 of the Saudi PDPL; Article 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Contact, gifts, and bulk orders",
          paragraphs: [
            "The contact form asks only for a name and a message. It opens WhatsApp directly in your browser and does not pass through our servers.",
            "The gift form collects name, city, phone, purpose, quantity, product type, organisation, occasion, budget, date, and details. The bulk form collects name, city, phone, quantity, variety, and grade. A copy is emailed to [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) through our server, and the same message opens in WhatsApp.",
            "Purpose: to reply and prepare a quote. Legal basis: your request and the prior agreement (Article 6 PDPL; Article 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Customer reviews",
          paragraphs: [
            "The review form collects name, WhatsApp number, job, nationality, country, text, rating, and language. The WhatsApp number and internal notes are never shown publicly.",
            "Purpose: to moderate and then publish the review with your name, job, and country. Legal basis: your explicit consent (Article 5 PDPL; Article 6(1)(a) GDPR).",
          ],
        },
        {
          heading: "Technical data",
          paragraphs: [
            "The host automatically records IP address, browser type, pages visited, timestamps, and error messages. Purpose: to run and secure the site. Legal basis: our legitimate interest in keeping the service available, within the limits set by law (Article 6 PDPL; Article 6(1)(f) GDPR).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "Who receives the data",
      paragraphs: [
        "Vercel hosts the site and runs the functions that build order messages. Neon stores reviews in a PostgreSQL database in eu-central-1. Hostinger sends request emails. Google and Meta tools are loaded only after your consent. Authorities may receive data where a binding law requires it.",
        "No other merchant or data broker receives this information. WhatsApp messages and email are handled under Meta's and your email provider's terms.",
      ],
    },
    {
      id: "transfers",
      heading: "Transfers outside Saudi Arabia",
      paragraphs: [
        "Data is processed in Saudi Arabia, in the European Union (the review database), and by providers whose infrastructure may be in the United States or elsewhere (Vercel, Google, Meta, Hostinger).",
        "We require these providers to apply safeguards accepted under the PDPL and, for the EEA and the UK, under the GDPR: adequacy decisions or standard contractual clauses. Write to us to learn which mechanism applies to each provider.",
        "For people in the EEA and the UK, the controller remains the Saudi entity named at the start of this policy. No European representative is currently published here; if a representative is required under Article 27 GDPR, their details will appear here before the related processing.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep data",
      paragraphs: [
        "Orders: shop conversations are deleted within 24 months of the last contact, unless a dispute or legal duty requires keeping them. WhatsApp/Meta copies follow their own retention rules.",
        "Gift and bulk requests: request emails are kept for 24 months, then deleted unless there is a dispute.",
        "Reviews: an unpublished review is deleted within 30 days. A published review remains available on the site unless you ask us to remove it.",
        "Technical logs: kept only for the short period the host needs to diagnose incidents.",
        "Consent choice: kept in your browser until you change it or clear site storage.",
        "Cart: kept in your browser until you place the order or clear site storage.",
        "Admin session: a session cookie limited to authorised staff, removed on logout or when the browser closes.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies, local storage, and analytics",
      paragraphs: [
        "The cart and the consent choice use browser local storage. Both are needed for the service you asked for and do not require prior consent.",
        "The admin area uses a session cookie for authorised staff only. It is not used to track visitors.",
        "Google Tag Manager and the tools inside it (GA4, and possibly Meta Pixel) load only after your consent. Refusing is as easy as accepting. You can change your choice at any time through “Cookie settings” in the footer.",
        "Links to Google Maps and social networks load nothing until you click them.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "Publishing reviews",
      paragraphs: [
        "A review is stored only if you tick the box allowing us to publish your name, job, and country. That tick is your explicit consent.",
        "You can withdraw it at any time by writing to [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com). The review is then removed within 30 days. Withdrawal does not make the earlier publication unlawful.",
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      paragraphs: ["You have the right to:"],
      list: [
        "access your data and get a copy;",
        "correct it;",
        "delete it;",
        "withdraw consent;",
        "object to processing based on legitimate interests;",
        "request restriction of processing;",
        "receive the data you provided in a readable format and pass it to another controller where the law provides for this;",
        "complain to the Saudi Data & AI Authority (SDAIA), or to the data protection authority in your country of residence in the EEA, or to the ICO in the UK.",
      ],
      paragraphsAfterList: [
        "Write to [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) or [+966 59 610 1097](https://wa.me/966596101097). Under the PDPL we answer within 30 days, with a possible 30-day extension where the request takes disproportionate effort; we will tell you in advance. Under the GDPR the period is one month, extendable by two months. We may ask for identity verification.",
      ],
    },
    {
      id: "security",
      heading: "Security and incidents",
      paragraphs: [
        "The site uses HTTPS, protected admin access, server-side form validation, and security logs. Admin backups are kept in a restricted space.",
        "If a data incident is likely to harm your rights, we notify SDAIA within 72 hours where Saudi law requires it, and inform affected people where the risk is high. Under the GDPR, the authority is notified within 72 hours and affected people are informed when the risk is high.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      paragraphs: [
        "The site is not aimed at people under 16. We do not knowingly collect their data. A parent or guardian who sees such data can ask for immediate deletion.",
      ],
    },
    {
      id: "marketing",
      heading: "Marketing and automated decisions",
      paragraphs: [
        "We send no promotional messages without prior consent. We make no decision with legal or similarly significant effects solely by automated processing.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: [
        "Every change is published here with a new date. For significant changes we add a visible notice on the site.",
      ],
    },
  ],
};

const fr: PrivacyContent = {
  intro:
    "Cette politique explique quelles données le site traite, pourquoi, à qui elles sont transmises et combien de temps elles sont conservées. Elle s'applique à ennakhlaelmubaraka.com, à toutes ses langues et à nos échanges de commande par WhatsApp et par e-mail.",
  effectiveDate: "Dernière mise à jour : 19 novembre 2026",
  sections: [
    {
      id: "controller",
      heading: "Responsable et portée",
      paragraphs: [
        "Le responsable du traitement est مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah), entreprise saoudienne immatriculée sous le numéro 7043497630, sise magasin n° 49, Marché central des dattes, Al Wabra, Médine 42371, Arabie saoudite.",
        "Pour toute question ou demande relative à vos données : [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) ou [+966 59 610 1097](https://wa.me/966596101097). Les demandes de cadeaux et de gros volumes utilisent aussi [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com).",
        "Cette politique couvre le site et ses canaux de commande. Les services tiers que vous ouvrez depuis le site (WhatsApp, Google Maps, réseaux sociaux) ont leurs propres règles.",
      ],
    },
    {
      id: "limits",
      heading: "Ce que le site ne fait pas",
      paragraphs: [
        "Le site n'accepte actuellement aucun paiement en ligne. Il ne demande ni numéro de carte bancaire, ni code, ni IBAN. Le paiement est convenu directement avec la boutique, généralement par virement. Cette limite est en vigueur à ce jour et peut changer à tout moment. Notre société se réserve le droit de la modifier à tout moment sans préavis, et nous mettons cette politique de confidentialité à jour en conséquence.",
        "Les commandes ne sont pas inscrites dans une base de données clients : les informations servent à composer un message WhatsApp et à préparer la commande. Les avis publiés sont, eux, enregistrés dans une base distincte.",
        "Nous ne vendons pas vos données et ne les transmettons pas à des annonceurs. Les seuls destinataires sont les prestataires techniques nécessaires au site et les services que vous décidez d'utiliser.",
      ],
    },
    {
      id: "collection",
      heading: "Données collectées, finalités et bases légales",
      paragraphs: [],
      subsections: [
        {
          heading: "Commande",
          paragraphs: [
            "Le formulaire de commande recueille le nom, le téléphone, l'e-mail, la ville, l'adresse si la livraison est choisie, le mode de livraison, le moyen de paiement, les notes et le contenu du panier. Ces données passent par notre serveur pour créer le lien WhatsApp. Le message contient le nom, le téléphone, la ville, l'adresse, les articles, les choix et les notes ; l'e-mail n'y figure pas.",
            "Finalité : préparer, confirmer et suivre la commande. Base légale : l'exécution d'un contrat ou d'un accord préalable (art. 6 du PDPL saoudien ; art. 6(1)(b) du RGPD).",
          ],
        },
        {
          heading: "Contact, cadeaux et gros volumes",
          paragraphs: [
            "Le formulaire de contact ne demande qu'un nom et un message. Il ouvre directement WhatsApp dans votre navigateur, sans passer par nos serveurs.",
            "Le formulaire cadeau recueille le nom, la ville, le téléphone, l'objet, la quantité, le type de produit, l'organisation, l'occasion, le budget, la date et les détails. Le formulaire gros volumes recueille le nom, la ville, le téléphone, la quantité, la variété et la catégorie. Une copie est envoyée à [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) par notre serveur, et le même message s'ouvre dans WhatsApp.",
            "Finalité : répondre et préparer un devis. Base légale : votre demande et l'accord préalable (art. 6 du PDPL ; art. 6(1)(b) du RGPD).",
          ],
        },
        {
          heading: "Avis clients",
          paragraphs: [
            "Le formulaire d'avis recueille le nom, le numéro WhatsApp, la fonction, la nationalité, le pays, le texte, la note et la langue. Le numéro WhatsApp et les notes internes ne sont jamais rendus publics.",
            "Finalité : modérer puis publier l'avis avec votre nom, votre fonction et votre pays. Base légale : votre consentement explicite (art. 5 du PDPL ; art. 6(1)(a) du RGPD).",
          ],
        },
        {
          heading: "Données techniques",
          paragraphs: [
            "L'hébergeur enregistre automatiquement l'adresse IP, le navigateur, les pages consultées, les horodatages et les erreurs. Finalité : faire fonctionner et sécuriser le site. Base légale : notre intérêt légitime à maintenir le service, dans les limites prévues par la loi (art. 6 du PDPL ; art. 6(1)(f) du RGPD).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "Destinataires",
      paragraphs: [
        "Vercel héberge le site et exécute les fonctions qui préparent les messages de commande. Neon stocke les avis dans une base PostgreSQL située à eu-central-1. Hostinger envoie les e-mails de demande. Les outils de Google et Meta ne sont chargés qu'après votre accord. Les autorités peuvent recevoir des données si une loi impérative l'impose.",
        "Aucun autre commerçant ni courtier de données ne reçoit ces informations. Les messages WhatsApp et les e-mails sont traités selon les conditions de Meta et de votre fournisseur de messagerie.",
      ],
    },
    {
      id: "transfers",
      heading: "Transferts hors d'Arabie saoudite",
      paragraphs: [
        "Les données sont traitées en Arabie saoudite, dans l'Union européenne (base des avis) et chez des fournisseurs dont l'infrastructure peut se trouver aux États-Unis ou ailleurs (Vercel, Google, Meta, Hostinger).",
        "Nous exigeons de ces fournisseurs des garanties admises par le PDPL et, pour l'EEE et le Royaume-Uni, par le RGPD : décisions d'adéquation ou clauses contractuelles types. Vous pouvez nous écrire pour connaître le mécanisme applicable à chaque prestataire.",
        "Pour les personnes de l'EEE et du Royaume-Uni, le responsable reste l'entité saoudienne nommée au début de cette politique. Aucun représentant européen n'est actuellement publié ici ; si un représentant est requis au titre de l'article 27 du RGPD, ses coordonnées figureront ici avant le traitement concerné.",
      ],
    },
    {
      id: "retention",
      heading: "Durées de conservation",
      paragraphs: [
        "Commandes : nous supprimons les conversations de la boutique dans les 24 mois suivant le dernier contact, sauf si un litige ou une obligation légale exige de les garder. Les copies détenues par WhatsApp/Meta suivent leurs propres règles.",
        "Demandes de cadeaux et de gros volumes : les e-mails sont conservés 24 mois puis supprimés, sauf litige.",
        "Avis : un avis non publié est supprimé sous 30 jours. Un avis publié reste disponible sur le site sauf si vous demandez son retrait.",
        "Journaux techniques : conservés pour la courte durée nécessaire à l'hébergeur pour diagnostiquer les incidents.",
        "Choix de consentement : conservé dans votre navigateur jusqu'à ce que vous le changiez ou effaciez le stockage du site.",
        "Panier : conservé dans votre navigateur jusqu'à la commande ou le vidage du stockage.",
        "Session d'administration : cookie de session limité au personnel autorisé, supprimé à la déconnexion ou à la fermeture du navigateur.",
      ],
    },
    {
      id: "cookies",
      heading: "Témoins, stockage local et mesure d'audience",
      paragraphs: [
        "Le panier et le choix de consentement utilisent le stockage local du navigateur. Ces deux éléments sont nécessaires au service que vous avez demandé et ne requièrent pas de consentement préalable.",
        "L'espace d'administration utilise un cookie de session pour le personnel autorisé uniquement. Il ne sert pas à suivre les visiteurs.",
        "Google Tag Manager et les outils qu'il contient (GA4, et selon sa configuration Meta Pixel) ne sont chargés qu'après votre accord. Un refus est aussi simple qu'une acceptation. Vous pouvez changer d'avis à tout moment via « Paramètres des témoins » en pied de page.",
        "Les liens vers Google Maps et les réseaux sociaux ne chargent rien tant que vous ne cliquez pas dessus.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "Publication des avis",
      paragraphs: [
        "Un avis n'est enregistré que si vous cochez la case autorisant la publication de votre nom, de votre fonction et de votre pays. Cette case constitue votre consentement explicite.",
        "Vous pouvez retirer ce consentement à tout moment en écrivant à [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com). L'avis est alors retiré sous 30 jours. Le retrait ne rend pas illicite la publication antérieure.",
      ],
    },
    {
      id: "rights",
      heading: "Vos droits",
      paragraphs: ["Vous avez le droit de :"],
      list: [
        "accéder à vos données et obtenir une copie ;",
        "les rectifier ;",
        "les supprimer ;",
        "retirer un consentement ;",
        "vous opposer à un traitement fondé sur un intérêt légitime ;",
        "demander la limitation du traitement ;",
        "recevoir les données que vous avez fournies dans un format lisible et les transmettre à un autre responsable lorsque la loi le prévoit ;",
        "introduire une réclamation auprès de l'Autorité saoudienne des données et de l'IA (SDAIA), auprès de l'autorité de protection des données de votre pays de résidence dans l'EEE, ou auprès de l'ICO au Royaume-Uni.",
      ],
      paragraphsAfterList: [
        "Écrivez-nous à [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) ou [+966 59 610 1097](https://wa.me/966596101097). Nous répondons sous 30 jours au titre du PDPL, avec possibilité de prolongation de 30 jours si le traitement demande un effort disproportionné ; nous vous en informons alors. Sous le RGPD, le délai est d'un mois, prolongeable de deux mois. Une vérification d'identité peut être demandée.",
      ],
    },
    {
      id: "security",
      heading: "Sécurité et incidents",
      paragraphs: [
        "Le site utilise HTTPS, un accès administratif protégé, une validation des formulaires côté serveur et des journaux de sécurité. Les sauvegardes administratives sont conservées dans un espace restreint.",
        "En cas d'incident susceptible de nuire à vos droits, nous notifions la SDAIA dans les 72 heures lorsque le droit saoudien l'exige, et informons les personnes concernées lorsque le risque est élevé. Sous le RGPD, l'autorité est notifiée dans les 72 heures et les personnes concernées sont informées en cas de risque élevé.",
      ],
    },
    {
      id: "children",
      heading: "Enfants",
      paragraphs: [
        "Le site ne s'adresse pas aux personnes de moins de 16 ans. Nous ne collectons pas sciemment leurs données. Un parent ou tuteur qui constate une telle collecte peut en demander la suppression immédiate.",
      ],
    },
    {
      id: "marketing",
      heading: "Marketing et décisions automatisées",
      paragraphs: [
        "Nous n'envoyons aucun message promotionnel sans consentement préalable. Nous ne prenons aucune décision produisant un effet juridique ou significatif uniquement par traitement automatique.",
      ],
    },
    {
      id: "changes",
      heading: "Modifications de la politique",
      paragraphs: [
        "Toute modification est publiée ici avec une nouvelle date. Pour les changements importants, nous ajoutons un avis visible sur le site.",
      ],
    },
  ],
};

const ur: PrivacyContent = {
  intro:
    "یہ پالیسی بتاتی ہے کہ سائٹ کون سا ڈیٹا کیوں جمع کرتی ہے، کس کو ملتا ہے، اور کب تک محفوظ رہتا ہے۔ یہ ennakhlaelmubaraka.com کی تمام زبانوں اور واٹس ایپ و ای میل کے ذریعے آرڈر کی بات چیت پر لاگو ہے۔",
  effectiveDate: "آخری تازہ کاری: ۱۹ نومبر ۲۰۲۶",
  sections: [
    {
      id: "controller",
      heading: "ذمہ دار ادارہ اور دائرہ کار",
      paragraphs: [
        "ڈیٹا کا ذمہ دار ادارہ مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah) ہے، جو سعودی عرب میں تجارتی رجسٹریشن نمبر 7043497630 کے تحت درج ہے۔ پتہ: دکان نمبر ۴۹، مرکزی کھجور منڈی، الورقاء، مدینہ ۴۲۳۷۱، سعودی عرب۔",
        "آپ کے ڈیٹا کے بارے میں کسی بھی سوال کے لیے: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) یا [+966 59 610 1097](https://wa.me/966596101097)۔ تحفے اور بلک آرڈر [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) پر بھی پہنچتے ہیں۔",
        "یہ پالیسی سائٹ اور اس کے آرڈر چینلز کو شامل ہے۔ سائٹ سے کھولی جانے والی بیرونی سروسز (واٹس ایپ، گوگل میپس، سوشل میڈیا) کے اپنے اصول ہیں۔",
      ],
    },
    {
      id: "limits",
      heading: "سائٹ جو نہیں کرتی",
      paragraphs: [
        "سائٹ فی الحال آن لائن ادائیگی نہیں لیتی۔ وہ کارڈ نمبر، کارڈ کوڈ یا IBAN نہیں مانگتی۔ ادائیگی براہِ راست دکان کے ساتھ طے ہوتی ہے، عموماً بینک ٹرانسفر کے ذریعے۔ یہ حد فی الحال نافذ ہے اور کسی بھی وقت تبدیل ہو سکتی ہے۔ ہماری کمپنی اسے کسی بھی وقت بغیر پیشگی اطلاع کے تبدیل کرنے کا حق محفوظ رکھتی ہے، اور ہم اسی کے مطابق رازداری کی پالیسی کو اپ ڈیٹ کرتے ہیں۔",
        "آرڈر کسٹمر ڈیٹا بیس میں درج نہیں ہوتے: معلومات واٹس ایپ پیغام بنانے اور آرڈر تیار کرنے کے لیے استعمال ہوتی ہیں۔ شائع ہونے والے جائزے الگ ڈیٹا بیس میں محفوظ ہیں۔",
        "ہم آپ کا ڈیٹا نہیں بیچتے اور اشتہار دہندگان کو نہیں بھیجتے۔ وصول کرنے والے صرف سائٹ چلانے کے لیے ضروری تکنیکی فراہم کنندگان اور وہ سروسز ہیں جو آپ خود استعمال کرتے ہیں۔",
      ],
    },
    {
      id: "collection",
      heading: "جمع کیا جانے والا ڈیٹا، مقاصد اور قانونی بنیاد",
      paragraphs: [],
      subsections: [
        {
          heading: "آرڈر",
          paragraphs: [
            "آرڈر فارم نام، فون نمبر، ای میل، شہر، ڈیلیوری منتخب ہونے پر پتہ، ڈیلیوری کا طریقہ، ادائیگی کا طریقہ، نوٹس اور کارٹ کا مواد جمع کرتا ہے۔ یہ ڈیٹا واٹس ایپ لنک بنانے کے لیے ہمارے سرور سے گزرتا ہے۔ پیغام میں نام، فون، شہر، پتہ، اشیا، انتخاب اور نوٹس ہوتے ہیں؛ ای میل شامل نہیں۔",
            "مقصد: آرڈر تیار کرنا، تصدیق کرنا اور اس کی پیروی کرنا۔ قانونی بنیاد: معاہدے یا پہلے معاہدے پر عمل (سعودی PDPL کی دفعہ ۶؛ GDPR کی دفعہ ۶/۱/ب)۔",
          ],
        },
        {
          heading: "رابطہ، تحفے اور بلک آرڈر",
          paragraphs: [
            "رابطہ فارم صرف نام اور پیغام مانگتا ہے۔ یہ براہِ راست آپ کے براؤزر میں واٹس ایپ کھولتا ہے اور ہمارے سرور سے نہیں گزرتا۔",
            "تحفہ فارم نام، شہر، فون، مقصد، تعداد، مصنوعات کی قسم، ادارہ، موقع، بجٹ، تاریخ اور تفصیلات جمع کرتا ہے۔ بلک فارم نام، شہر، فون، تعداد، قسم اور گریڈ جمع کرتا ہے۔ کاپی ہمارے سرور کے ذریعے [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) کو ای میل ہوتی ہے اور وہی پیغام واٹس ایپ میں کھلتا ہے۔",
            "مقصد: جواب دینا اور قیمت کا تخمینہ تیار کرنا۔ قانونی بنیاد: آپ کی درخواست اور پہلا معاہدہ (PDPL دفعہ ۶؛ GDPR دفعہ ۶/۱/ب)۔",
          ],
        },
        {
          heading: "کسٹمر جائزے",
          paragraphs: [
            "جائزہ فارم نام، واٹس ایپ نمبر، پیشہ، قومیت، ملک، متن، ریٹنگ اور زبان جمع کرتا ہے۔ واٹس ایپ نمبر اور اندرونی نوٹس کبھی عوامی نہیں دکھائے جاتے۔",
            "مقصد: جائزے کی جانچ کے بعد اسے آپ کے نام، پیشے اور ملک کے ساتھ شائع کرنا۔ قانونی بنیاد: آپ کی واضح رضامندی (PDPL دفعہ ۵؛ GDPR دفعہ ۶/۱/أ)۔",
          ],
        },
        {
          heading: "تکنیکی ڈیٹا",
          paragraphs: [
            "میزبان خودکار طور پر IP پتہ، براؤزر کی قسم، دیکھی گئی صفحات، اوقات اور غلطی کے پیغامات درج کرتا ہے۔ مقصد: سائٹ چلانا اور محفوظ رکھنا۔ قانونی بنیاد: سروس جاری رکھنے کا ہمارا جائز مفاد، قانون کی حدود میں (PDPL دفعہ ۶؛ GDPR دفعہ ۶/۱/و)۔",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "ڈیٹا کس کو ملتا ہے",
      paragraphs: [
        "Vercel سائٹ کی میزبانی کرتا ہے اور آرڈر پیغام بنانے والے افعال چلاتا ہے۔ Neon جائزوں کو eu-central-1 میں PostgreSQL ڈیٹا بیس میں رکھتا ہے۔ Hostinger درخواست کے ای میل بھیجتا ہے۔ Google اور Meta کے ٹولز صرف آپ کی رضامندی کے بعد لوڈ ہوتے ہیں۔ جب قانونی طور پر لازم ہو تو حکام کو ڈیٹا مل سکتا ہے۔",
        "یہ معلومات کسی دوسرے تاجر یا ڈیٹا بروکر کو نہیں ملتی۔ واٹس ایپ پیغامات اور ای میل Meta اور آپ کے ای میل فراہم کنندہ کی شرائط کے تحت ہیں۔",
      ],
    },
    {
      id: "transfers",
      heading: "سعودی عرب سے باہر منتقلی",
      paragraphs: [
        "ڈیٹا سعودی عرب، یورپی یونین (جائزوں کا ڈیٹا بیس) اور ان فراہم کنندگان کے پاس پروسیس ہوتا ہے جن کا ڈھانچہ امریکہ یا دوسرے مقامات پر ہو سکتا ہے (Vercel، Google، Meta، Hostinger)۔",
        "ہم ان فراہم کنندگان سے PDPL اور EEA/UK کے GDPR کے تحت قابلِ قبول ضمانتیں مانگتے ہیں: adequacy فیصلے یا معیاری معاہدہ شقیں۔ ہر فراہم کنندہ کے لیے طریقہ کار جاننے کے لیے ہمیں لکھیں۔",
        "EEA اور برطانیہ کے افراد کے لیے ذمہ دار وہی سعودی ادارہ ہے جو اس پالیسی کے آغاز میں درج ہے۔ یہاں فی الحال کوئی یورپی نمائندہ شائع نہیں ہے؛ اگر GDPR کی دفعہ ۲۷ کے تحت نمائندہ مطلوب ہو تو متعلقہ پروسیسنگ سے پہلے اس کے رابطے یہاں شائع ہوں گے۔",
      ],
    },
    {
      id: "retention",
      heading: "ذخیرہ کی مدت",
      paragraphs: [
        "آرڈر: آخری رابطے کے ۲۴ ماہ کے اندر دکان کی گفتگو حذف کر دی جاتی ہے، جب تک تنازعہ یا قانونی ذمہ داری اسے رکھنے کی متقاضی نہ ہو۔ واٹس ایپ/Meta کی کاپیاں ان کے اپنے اصولوں کے تابع ہیں۔",
        "تحفے اور بلک آرڈر: درخواست کے ای میل ۲۴ ماہ رکھے جاتے ہیں، پھر حذف کیے جاتے ہیں، سوائے تنازعے کی صورت میں۔",
        "جائزے: غیر شائع جائزہ ۳۰ دن کے اندر حذف ہوتا ہے۔ شائع جائزہ سائٹ پر اس وقت تک دستیاب رہتا ہے جب تک آپ اسے ہٹانے کی درخواست نہ کریں۔",
        "تکنیکی لاگ: میزبان کو حادثات کی تشخیص کے لیے درکار مختصر مدت تک رکھی جاتی ہیں۔",
        "رضامندی کا انتخاب: جب تک آپ اسے تبدیل نہ کریں یا سائٹ کا اسٹوریج صاف نہ کریں، آپ کے براؤزر میں رہتا ہے۔",
        "کارٹ: آرڈر مکمل ہونے یا اسٹوریج صاف ہونے تک براؤزر میں رہتا ہے۔",
        "ایڈمن سیشن: صرف مجاز عملے کے لیے سیشن کوکی، لاگ آؤٹ یا براؤزر بند ہونے پر حذف ہوتی ہے۔",
      ],
    },
    {
      id: "cookies",
      heading: "کوکیز، لوکل اسٹوریج اور تجزیہ",
      paragraphs: [
        "کارٹ اور رضامندی کا انتخاب براؤزر کے لوکل اسٹوریج میں رہتے ہیں۔ دونوں اُس سروس کے لیے ضروری ہیں جو آپ نے مانگی ہے اور ان کے لیے پہلے رضامندی نہیں چاہیے۔",
        "ایڈمن زون صرف مجاز عملے کے لیے سیشن کوکی استعمال کرتا ہے۔ اسے زائرین کی نگرانی کے لیے نہیں استعمال کیا جاتا۔",
        "Google Tag Manager اور اس کے اندر موجود ٹولز (GA4، اور ممکنہ طور پر Meta Pixel) صرف آپ کی رضامندی کے بعد لوڈ ہوتے ہیں۔ انکار اتنا ہی آسان ہے جتنا قبول کرنا۔ آپ فوٹر میں «کوکی ترتیبات» کے ذریعے کسی بھی وقت اپنا فیصلہ بدل سکتے ہیں۔",
        "گوگل میپس اور سوشل میڈیا کے لنکس آپ کے کلک کرنے سے پہلے کچھ لوڈ نہیں کرتے۔",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "جائزوں کی اشاعت",
      paragraphs: [
        "جائزہ صرف اس صورت میں محفوظ ہوتا ہے جب آپ وال باکس پر نشان لگائیں جس سے آپ کے نام، پیشے اور ملک کی اشاعت کی اجازت ملے۔ یہی آپ کی واضح رضامندی ہے۔",
        "آپ کسی بھی وقت [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) پر لکھ کر رضامندی واپس لے سکتے ہیں۔ پھر جائزہ ۳۰ دن کے اندر ہٹا دیا جاتا ہے۔ واپس لینے سے پہلے کی اشاعت غیر قانونی نہیں ہو جاتی۔",
      ],
    },
    {
      id: "rights",
      heading: "آپ کے حقوق",
      paragraphs: ["آپ کو یہ حقوق حاصل ہیں:"],
      list: [
        "اپنے ڈیٹا تک رسائی اور کاپی حاصل کرنا؛",
        "اسے درست کرنا؛",
        "اسے حذف کرنا؛",
        "رضامندی واپس لینا؛",
        "جائز مفاد پر مبنی پروسیسنگ پر اعتراض کرنا؛",
        "پروسیسنگ کی پابندی کا مطالبہ کرنا؛",
        "فراہم کردہ ڈیٹا قابلِ خواندہ شکل میں حاصل کرنا اور قانون کی اجازت ہو تو دوسرے ذمہ دار کو منتقل کرنا؛",
        "سعودی ڈیٹا و AI اتھارٹی (SDAIA)، EEA میں اپنے ملک کے ڈیٹا تحفظ اتھارٹی، یا برطانیہ کے ICO کے پاس شکایت درج کرنا۔",
      ],
      paragraphsAfterList: [
        "ہمیں [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) یا [+966 59 610 1097](https://wa.me/966596101097) پر لکھیں۔ PDPL کے تحت ہم ۳۰ دن میں جواب دیتے ہیں، اور غیر متناسب کوشش کی صورت میں ۳۰ دن کی توسیع ممکن ہے؛ ہم پہلے آپ کو بتائیں گے۔ GDPR کے تحت مدت ایک ماہ ہے، دو ماہ تک بڑھائی جا سکتی ہے۔ ہم شناخت کی تصدیق مانگ سکتے ہیں۔",
      ],
    },
    {
      id: "security",
      heading: "سیکیورٹی اور واقعات",
      paragraphs: [
        "سائٹ HTTPS، محفوظ ایڈمن رسائی، سرور پر فارم کی تصدیق اور سیکیورٹی لاگ استعمال کرتی ہے۔ ایڈمن بیک اپ محدود جگہ میں رکھے جاتے ہیں۔",
        "اگر کوئی ڈیٹا واقعہ آپ کے حقوق کو نقصان پہنچا سکتا ہے تو ہم سعودی قانون کے تقاضے کے مطابق ۷۲ گھنٹے میں SDAIA کو مطلع کرتے ہیں، اور زیادہ خطرے کی صورت میں متاثرہ افراد کو بتاتے ہیں۔ GDPR کے تحت اتھارٹی کو ۷۲ گھنٹے میں اور متاثرہ افراد کو زیادہ خطرے پر مطلع کیا جاتا ہے۔",
      ],
    },
    {
      id: "children",
      heading: "بچے",
      paragraphs: [
        "یہ سائٹ ۱۶ سال سے کم عمر افراد کے لیے نہیں ہے۔ ہم جان بوجھ کر ان کا ڈیٹا جمع نہیں کرتے۔ اگر کوئی والدین ایسا ڈیٹا دیکھیں تو فوری حذف کی درخواست کر سکتے ہیں۔",
      ],
    },
    {
      id: "marketing",
      heading: "مارکیٹنگ اور خودکار فیصلے",
      paragraphs: [
        "ہم پہلے رضامندی کے بغیر کوئی اشتہاری پیغام نہیں بھیجتے۔ اور صرف خودکار پروسیسنگ کے ذریعے کوئی قانونی یا اہم اثر والا فیصلہ نہیں کرتے۔",
      ],
    },
    {
      id: "changes",
      heading: "پالیسی میں تبدیلی",
      paragraphs: [
        "ہر تبدیلی نئی تاریخ کے ساتھ یہاں شائع کی جاتی ہے۔ اہم تبدیلیوں کے لیے سائٹ پر واضح اطلاع شامل کی جاتی ہے۔",
      ],
    },
  ],
};

const id: PrivacyContent = {
  intro:
    "Kebijakan ini menjelaskan data apa yang diproses situs, untuk apa, kepada siapa data dikirim, dan berapa lama disimpan. Berlaku untuk ennakhlaelmubaraka.com, semua versi bahasa, serta percakapan pesanan melalui WhatsApp dan email.",
  effectiveDate: "Terakhir diperbarui: 19 November 2026",
  sections: [
    {
      id: "controller",
      heading: "Pengelola dan cakupan",
      paragraphs: [
        "Pengelola data adalah مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah), usaha Saudi yang terdaftar dengan nomor registrasi dagang 7043497630, beralamat di Toko No. 49, Pasar Kurma Pusat, Al Wabra, Madinah 42371, Arab Saudi.",
        "Untuk pertanyaan atau permintaan terkait data Anda: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) atau [+966 59 610 1097](https://wa.me/966596101097). Permintaan hadiah dan pesanan grosir juga dikirim ke [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com).",
        "Kebijakan ini mencakup situs dan kanal pemesanannya. Layanan pihak ketiga yang Anda buka dari situs (WhatsApp, Google Maps, media sosial) memiliki aturan sendiri.",
      ],
    },
    {
      id: "limits",
      heading: "Yang tidak dilakukan situs",
      paragraphs: [
        "Saat ini situs tidak menerima pembayaran online. Situs tidak meminta nomor kartu, kode kartu, atau IBAN. Pembayaran disepakati langsung dengan toko, biasanya lewat transfer bank. Batasan ini berlaku saat ini dan dapat berubah kapan saja. Perusahaan kami berhak mengubahnya kapan saja tanpa pemberitahuan sebelumnya, dan kami memperbarui kebijakan privasi sesuai hal tersebut.",
        "Pesanan tidak dimasukkan ke database pelanggan: datanya dipakai untuk menyusun pesan WhatsApp dan menyiapkan pesanan. Ulasan yang ditampilkan disimpan di database terpisah.",
        "Kami tidak menjual data Anda dan tidak mengirimnya ke pengiklan. Penerimanya hanya penyedia teknis yang diperlukan untuk menjalankan situs, serta layanan yang Anda pilih sendiri.",
      ],
    },
    {
      id: "collection",
      heading: "Data yang dikumpulkan, tujuan, dan dasar hukum",
      paragraphs: [],
      subsections: [
        {
          heading: "Pemesanan",
          paragraphs: [
            "Formulir pemesanan mengumpulkan nama, telepon, email, kota, alamat jika pengiriman dipilih, metode pengiriman, metode pembayaran, catatan, dan isi keranjang. Data melewati server kami untuk membuat tautan WhatsApp. Pesan berisi nama, telepon, kota, alamat, barang, pilihan, dan catatan; email tidak disertakan.",
            "Tujuan: menyiapkan, mengonfirmasi, dan menindaklanjuti pesanan. Dasar hukum: pelaksanaan kontrak atau perjanjian sebelumnya (Pasal 6 PDPL Saudi; Pasal 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Kontak, hadiah, dan pesanan grosir",
          paragraphs: [
            "Formulir kontak hanya meminta nama dan pesan. Formulir ini membuka WhatsApp langsung di browser Anda dan tidak melewati server kami.",
            "Formulir hadiah mengumpulkan nama, kota, telepon, tujuan, jumlah, jenis produk, organisasi, acara, anggaran, tanggal, dan detail. Formulir grosir mengumpulkan nama, kota, telepon, jumlah, varietas, dan grade. Salinan dikirim melalui server kami ke [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com), dan pesan yang sama dibuka di WhatsApp.",
            "Tujuan: menjawab dan menyiapkan penawaran. Dasar hukum: permintaan Anda dan perjanjian sebelumnya (Pasal 6 PDPL; Pasal 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Ulasan pelanggan",
          paragraphs: [
            "Formulir ulasan mengumpulkan nama, nomor WhatsApp, pekerjaan, kebangsaan, negara, teks, rating, dan bahasa. Nomor WhatsApp dan catatan internal tidak pernah ditampilkan ke publik.",
            "Tujuan: meninjau lalu menerbitkan ulasan dengan nama, pekerjaan, dan negara Anda. Dasar hukum: persetujuan eksplisit Anda (Pasal 5 PDPL; Pasal 6(1)(a) GDPR).",
          ],
        },
        {
          heading: "Data teknis",
          paragraphs: [
            "Penyedia hosting mencatat alamat IP, jenis browser, halaman yang dikunjungi, waktu, dan pesan error. Tujuan: menjalankan dan mengamankan situs. Dasar hukum: kepentingan sah kami untuk menjaga layanan tetap berjalan, dalam batas yang ditetapkan hukum (Pasal 6 PDPL; Pasal 6(1)(f) GDPR).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "Penerima data",
      paragraphs: [
        "Vercel menghosting situs dan menjalankan fungsi yang membuat pesan pesanan. Neon menyimpan ulasan di database PostgreSQL di eu-central-1. Hostinger mengirim email permintaan. Alat Google dan Meta hanya dimuat setelah persetujuan Anda. Otoritas dapat menerima data jika undang-undang mengharuskannya.",
        "Informasi ini tidak diberikan ke pedagang lain atau broker data. Pesan WhatsApp dan email tunduk pada ketentuan Meta dan penyedia email Anda.",
      ],
    },
    {
      id: "transfers",
      heading: "Transfer ke luar Arab Saudi",
      paragraphs: [
        "Data diproses di Arab Saudi, di Uni Eropa (database ulasan), dan oleh penyedia yang infrastrukturnya dapat berada di Amerika Serikat atau tempat lain (Vercel, Google, Meta, Hostinger).",
        "Kami meminta penyedia menerapkan jaminan yang diterima menurut PDPL dan, untuk EEA serta Inggris, menurut GDPR: keputusan kecukupan atau klausul kontrak standar. Tulis kepada kami untuk mengetahui mekanisme yang berlaku pada tiap penyedia.",
        "Bagi orang di EEA dan Inggris, pengelola tetap badan Saudi yang disebutkan di awal kebijakan ini. Saat ini belum ada perwakilan Eropa yang dipublikasikan di sini; jika perwakilan diperlukan berdasarkan Pasal 27 GDPR, datanya akan ditampilkan di sini sebelum pemrosesan terkait.",
      ],
    },
    {
      id: "retention",
      heading: "Lama penyimpanan",
      paragraphs: [
        "Pesanan: percakapan toko dihapus dalam 24 bulan sejak kontak terakhir, kecuali sengketa atau kewajiban hukum mengharuskan penyimpanan. Salinan WhatsApp/Meta tunduk pada aturan mereka sendiri.",
        "Permintaan hadiah dan grosir: email disimpan 24 bulan lalu dihapus, kecuali ada sengketa.",
        "Ulasan: ulasan yang tidak diterbitkan dihapus dalam 30 hari. Ulasan yang diterbitkan tetap tersedia di situs kecuali Anda meminta penghapusannya.",
        "Log teknis: disimpan hanya selama periode singkat yang dibutuhkan penyedia hosting untuk mendiagnosis insiden.",
        "Pilihan persetujuan: disimpan di browser sampai Anda mengubahnya atau membersihkan penyimpanan situs.",
        "Keranjang: disimpan di browser sampai pesanan selesai atau penyimpanan dibersihkan.",
        "Sesi admin: cookie sesi hanya untuk staf berwenang, dihapus saat logout atau browser ditutup.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookie, penyimpanan lokal, dan analitik",
      paragraphs: [
        "Keranjang dan pilihan persetujuan memakai penyimpanan lokal browser. Keduanya diperlukan untuk layanan yang Anda minta dan tidak memerlukan persetujuan sebelumnya.",
        "Area admin menggunakan cookie sesi hanya untuk staf berwenang. Cookie ini tidak dipakai untuk melacak pengunjung.",
        "Google Tag Manager dan alat di dalamnya (GA4, dan mungkin Meta Pixel) hanya dimuat setelah persetujuan Anda. Menolak sama mudahnya dengan menerima. Anda dapat mengubah pilihan kapan saja lewat «Pengaturan cookie» di footer.",
        "Tautan ke Google Maps dan media sosial tidak memuat apa pun sebelum Anda mengkliknya.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "Publikasi ulasan",
      paragraphs: [
        "Ulasan hanya disimpan jika Anda mencentang kotak yang mengizinkan publikasi nama, pekerjaan, dan negara Anda. Centangan itu adalah persetujuan eksplisit Anda.",
        "Anda dapat menarik persetujuan kapan saja dengan menulis ke [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com). Ulasan lalu dihapus dalam 30 hari. Penarikan tidak membuat publikasi sebelumnya melanggar hukum.",
      ],
    },
    {
      id: "rights",
      heading: "Hak Anda",
      paragraphs: ["Anda memiliki hak untuk:"],
      list: [
        "mengakses data Anda dan mendapat salinannya;",
        "membetulkannya;",
        "menghapusnya;",
        "menarik persetujuan;",
        "keberatan atas pemrosesan berdasarkan kepentingan sah;",
        "meminta pembatasan pemrosesan;",
        "menerima data yang Anda berikan dalam format yang dapat dibaca dan meneruskannya ke pengelola lain bila hukum mengizinkan;",
        "mengajukan keluhan ke Saudi Data & AI Authority (SDAIA), otoritas perlindungan data di negara tempat tinggal Anda di EEA, atau ICO di Inggris.",
      ],
      paragraphsAfterList: [
        "Tulis ke [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) atau [+966 59 610 1097](https://wa.me/966596101097). Menurut PDPL kami menjawab dalam 30 hari, dengan perpanjangan 30 hari bila permintaan memerlukan upaya tidak proporsional; kami memberi tahu Anda terlebih dahulu. Menurut GDPR jangka waktunya satu bulan, dapat diperpanjang dua bulan. Kami dapat meminta verifikasi identitas.",
      ],
    },
    {
      id: "security",
      heading: "Keamanan dan insiden",
      paragraphs: [
        "Situs memakai HTTPS, akses admin yang dilindungi, validasi formulir di server, dan log keamanan. Backup admin disimpan di ruang terbatas.",
        "Jika insiden data dapat merugikan hak Anda, kami memberi tahu SDAIA dalam 72 jam bila hukum Saudi mewajibkannya, dan memberi tahu orang yang terdampak bila risikonya tinggi. Menurut GDPR, otoritas diberi tahu dalam 72 jam dan orang yang terdampak diberi tahu bila risikonya tinggi.",
      ],
    },
    {
      id: "children",
      heading: "Anak-anak",
      paragraphs: [
        "Situs ini tidak ditujukan untuk orang di bawah 16 tahun. Kami tidak sengaja mengumpulkan data mereka. Orang tua atau wali yang melihat data tersebut dapat meminta penghapusan segera.",
      ],
    },
    {
      id: "marketing",
      heading: "Pemasaran dan keputusan otomatis",
      paragraphs: [
        "Kami tidak mengirim pesan promosi tanpa persetujuan sebelumnya. Kami tidak membuat keputusan berakibat hukum atau signifikan hanya dengan pemrosesan otomatis.",
      ],
    },
    {
      id: "changes",
      heading: "Perubahan kebijakan",
      paragraphs: [
        "Setiap perubahan diterbitkan di sini dengan tanggal baru. Untuk perubahan penting kami menambahkan pemberitahuan yang terlihat di situs.",
      ],
    },
  ],
};

const bn: PrivacyContent = {
  intro:
    "এই নীতিতে ব্যাখ্যা করা হয়েছে সাইট কোন তথ্য প্রক্রিয়া করে, কেন, কার কাছে পাঠায় এবং কতক্ষণ রাখে। এটি ennakhlaelmubaraka.com-এর সমস্ত ভাষা সংস্করণ এবং WhatsApp ও ইমেইলে অর্ডার সংক্রান্ত কথোপকথনের ক্ষেত্রে প্রযোজ্য।",
  effectiveDate: "সর্বশেষ হালনাগাদ: ১৯ নভেম্বর ২০২৬",
  sections: [
    {
      id: "controller",
      heading: "দায়িত্বশীল প্রতিষ্ঠান ও পরিধি",
      paragraphs: [
        "তথ্যের দায়িত্বশীল প্রতিষ্ঠান مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah), সaudi Arabia-তে বাণিজ্যিক নিবন্ধন নম্বর 7043497630 সহ নিবন্ধিত। ঠিকানা: দোকান নং ৪৯, কেন্দ্রীয় খজুর বাজার, আল ওয়াবরা, মদিনা ৪২৩৭১, সaudi Arabia।",
        "আপনার তথ্য সম্পর্কে যেকোনো প্রশ্নের জন্য: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) বা [+966 59 610 1097](https://wa.me/966596101097)। উপহার ও বাল্ক অর্ডার [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com)-এও পৌঁছায়।",
        "এই নীতিটি সাইট এবং তার অর্ডার চ্যানেলগুলিকে অন্তর্ভুক্ত করে। সাইট থেকে খোলা তৃতীয় পক্ষের পরিষেবা (WhatsApp, Google Maps, সোশ্যাল মিডিয়া) তাদের নিজস্ব নিয়ম দ্বারা পরিচালিত হয়।",
      ],
    },
    {
      id: "limits",
      heading: "সাইট যা করে না",
      paragraphs: [
        "সাইটটি বর্তমানে অনলাইন পেমেন্ট গ্রহণ করে না। এটি কার্ড নম্বর, কার্ড কোড বা IBAN চায় না। পেমেন্ট সরাসরি দোকানের সাথে ঠিক করা হয়, সাধারণত ব্যাংক ট্রান্সফারের মাধ্যমে। এই সীমা বর্তমানে কার্যকর এবং যেকোনো সময় পরিবর্তন হতে পারে। আমাদের কোম্পানি পূর্ব নোটিশ ছাড়াই যেকোনো সময় এটি পরিবর্তন করার অধিকার সংরক্ষণ করে এবং আমরা সেই অনুযায়ী গোপনীয়তা নীতি হালনাগাদ করি।",
        "অর্ডারগুলো কাস্টমার ডাটাবেসে লিপিবদ্ধ হয় না: তথ্য WhatsApp বার্তা তৈরি ও অর্ডার প্রস্তুত করতে ব্যবহৃত হয়। প্রকাশিত রিভিউ আলাদা ডাটাবেসে রাখা হয়।",
        "আমরা আপনার তথ্য বিক্রি করি না এবং বিজ্ঞাপনদাতার কাছে পাঠাই না। একমাত্র প্রাপকরা হলেন সাইট চালানোর জন্য প্রয়োজনীয় প্রযুক্তি সরবরাহকারী এবং আপনি নিজে যে পরিষেবা বেছে নেন।",
      ],
    },
    {
      id: "collection",
      heading: "সংগৃহীত তথ্য, উদ্দেশ্য ও আইনি ভিত্তি",
      paragraphs: [],
      subsections: [
        {
          heading: "অর্ডার",
          paragraphs: [
            "অর্ডার ফর্মে নাম, ফোন, ইমেইল, শহর, ডেলিভারি বেছে নিলে ঠিকানা, ডেলিভারি পদ্ধতি, পেমেন্ট পদ্ধতি, নোট এবং কার্টের বিষয়বস্তু সংগ্রহ করা হয়। তথ্যগুলো WhatsApp লিংক তৈরির জন্য আমাদের সার্ভারের মধ্য দিয়ে যায়। বার্তায় নাম, ফোন, শহর, ঠিকানা, পণ্য, পছন্দ ও নোট থাকে; ইমেইল থাকে না।",
            "উদ্দেশ্য: অর্ডার প্রস্তুত, নিশ্চিত এবং অনুসরণ করা। আইনি ভিত্তি: চুক্তি বা পূর্ববর্তী চুক্তি পালন (সৌদি PDPL ধারা ৬; GDPR ধারা ৬(১)(b))।",
          ],
        },
        {
          heading: "যোগাযোগ, উপহার ও বাল্ক অর্ডার",
          paragraphs: [
            "যোগাযোগ ফর্মে শুধু নাম ও বার্তা চাওয়া হয়। এটি সরাসরি আপনার ব্রাউজারে WhatsApp খোলে এবং আমাদের সার্ভারের মধ্য দিয়ে যায় না।",
            "উপহার ফর্মে নাম, শহর, ফোন, উদ্দেশ্য, পরিমাণ, পণ্যের ধরন, প্রতিষ্ঠান, অনুষ্ঠান, বাজেট, তারিখ ও বিশদ সংগ্রহ করা হয়। বাল্ক ফর্মে নাম, শহর, ফোন, পরিমাণ, জাত ও গ্রেড সংগ্রহ করা হয়। আমাদের সার্ভারের মাধ্যমে একটি কপি [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com)-এ ইমেইল করা হয় এবং একই বার্তা WhatsApp-এ খোলে।",
            "উদ্দেশ্য: উত্তর দেওয়া ও মূল্য প্রস্তাব তৈরি করা। আইনি ভিত্তি: আপনার অনুরোধ ও পূর্বের চুক্তি (PDPL ধারা ৬; GDPR ধারা ৬(১)(b))।",
          ],
        },
        {
          heading: "গ্রাহক রিভিউ",
          paragraphs: [
            "রিভিউ ফর্মে নাম, WhatsApp নম্বর, পেশা, জাতীয়তা, দেশ, পাঠ্য, রেটিং ও ভাষা সংগ্রহ করা হয়। WhatsApp নম্বর ও অভ্যন্তরীণ নোট কখনো প্রকাশ করা হয় না।",
            "উদ্দেশ্য: রিভিউ যাচাই করে আপনার নাম, পেশা ও দেশ সহ প্রকাশ করা। আইনি ভিত্তি: আপনার স্পষ্ট সম্মতি (PDPL ধারা ৫; GDPR ধারা ৬(১)(a))।",
          ],
        },
        {
          heading: "প্রযুক্তিগত তথ্য",
          paragraphs: [
            "হোস্ট স্বয়ংক্রিয়ভাবে IP ঠিকানা, ব্রাউজারের ধরন, দেখা পৃষ্ঠা, সময় ও ত্রুটি বার্তা রেকর্ড করে। উদ্দেশ্য: সাইট চালানো ও নিরাপদ রাখা। আইনি ভিত্তি: পরিষেবা চালু রাখার আমাদের বৈধ স্বার্থ, আইন দ্বারা নির্ধারিত সীমার মধ্যে (PDPL ধারা ৬; GDPR ধারা ৬(১)(f))।",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "তথ্য কার কাছে যায়",
      paragraphs: [
        "Vercel সাইট হোস্ট করে এবং অর্ডার বার্তা তৈরির ফাংশন চালায়। Neon ইউরোপীয় ইউনিয়নের eu-central-1 অঞ্চলে PostgreSQL ডাটাবেসে রিভিউ রাখে। Hostinger অনুরোধের ইমেইল পাঠায়। Google ও Meta-র টুল শুধু আপনার সম্মতির পরে লোড হয়। আইন বাধ্য করলে কর্তৃপক্ষ তথ্য পেতে পারে।",
        "এই তথ্য অন্য কোনো ব্যবসায়ী বা ডাটা ব্রোকারের কাছে যায় না। WhatsApp বার্তা ও ইমেইল Meta এবং আপনার ইমেইল প্রদানকারীর শর্ত দ্বারা পরিচালিত হয়।",
      ],
    },
    {
      id: "transfers",
      heading: "সৌদি আরবের বাইরে স্থানান্তর",
      paragraphs: [
        "তথ্য সৌদি আরব, ইউরোপীয় ইউনিয়ন (রিভিউ ডাটাবেস) এবং এমন সরবরাহকারীদের কাছে প্রক্রিয়া করা হয় যাদের অবকাঠামো মার্কিন যুক্তরাষ্ট্র বা অন্যত্র হতে পারে (Vercel, Google, Meta, Hostinger)।",
        "আমরা সরবরাহকারীদের কাছে PDPL এবং EEA/UK-এর GDPR অনুযায়ী গ্রহণযোগ্য সুরক্ষা দাবি করি: উপযুক্ততা সিদ্ধান্ত বা মানক চুক্তি ধারা। প্রতিটি সরবরাহকারীর ক্ষেত্রে কোন পদ্ধতি প্রযোজ্য তা জানতে আমাদের লিখুন।",
        "EEA ও যুক্তরাষ্ট্রের ব্যক্তিদের জন্য দায়িত্বশীল এই নীতির শুরুতে উল্লিখিত সৌদি প্রতিষ্ঠানই। এখানে বর্তমানে কোনো ইউরোপীয় প্রতিনিধি প্রকাশিত নেই; GDPR ধারা ২৭ অনুযায়ী প্রতিনিধি প্রয়োজন হলে সংশ্লিষ্ট প্রক্রিয়াকরণের আগে তার তথ্য এখানে প্রকাশ করা হবে।",
      ],
    },
    {
      id: "retention",
      heading: "সংরক্ষণের সময়",
      paragraphs: [
        "অর্ডার: শেষ যোগাযোগের ২৪ মাসের মধ্যে দোকানের কথোপকথন মুছে ফেলা হয়, যদি না কোনো বিরোধ বা আইনি বাধ্যবাধকতা রাখার দাবি করে। WhatsApp/Meta-র কপি তাদের নিজস্ব নিয়ম দ্বারা পরিচালিত হয়।",
        "উপহার ও বাল্ক অনুরোধ: অনুরোধের ইমেইল ২৪ মাস রাখা হয়, তারপর মুছে ফেলা হয়, বিরোধ ছাড়া।",
        "রিভিউ: অপ্রকাশিত রিভিউ ৩০ দিনের মধ্যে মুছে ফেলা হয়। প্রকাশিত রিভিউ আপনি মুছে ফেলার অনুরোধ না করা পর্যন্ত সাইটে উপলব্ধ থাকে।",
        "প্রযুক্তিগত লগ: হোস্টের দুর্ঘটনা নির্ণয়ের জন্য প্রয়োজনীয় স্বল্প সময়ের জন্য রাখা হয়।",
        "সম্মতির পছন্দ: আপনি পরিবর্তন না করা বা সাইটের স্টোরেজ না মুছা পর্যন্ত ব্রাউজারে থাকে।",
        "কার্ট: অর্ডার সম্পূর্ণ না হওয়া বা স্টোরেজ মুছা পর্যন্ত ব্রাউজারে থাকে।",
        "অ্যাডমিন সেশন: শুধু অনুমোদিত কর্মীদের জন্য সেশন কুকি, লগআউট বা ব্রাউজার বন্ধ হলে মুছে যায়।",
      ],
    },
    {
      id: "cookies",
      heading: "কুকি, লোকাল স্টোরেজ ও বিশ্লেষণ",
      paragraphs: [
        "কার্ট ও সম্মতির পছন্দ ব্রাউজারের লোকাল স্টোরেজ ব্যবহার করে। এ দুটি আপনি চাইছেন এমন পরিষেবার জন্য প্রয়োজনীয় এবং আগে সম্মতি চায় না।",
        "অ্যাডমিন এলাকা শুধু অনুমোদিত কর্মীদের জন্য সেশন কুকি ব্যবহার করে। এটি দর্শকদের ট্র্যাক করতে ব্যবহৃত হয় না।",
        "Google Tag Manager এবং তার ভেতরের টুল (GA4, এবং সম্ভবত Meta Pixel) শুধু আপনার সম্মতির পরে লোড হয়। অস্বীকার করা গ্রহণের মতোই সহজ। আপনি ফুটারের «কুকি সেটিংস» দিয়ে যেকোনো সময় পছন্দ বদলাতে পারেন।",
        "Google Maps ও সোশ্যাল মিডিয়ার লিংক আপনি ক্লিক না করা পর্যন্ত কিছু লোড করে না।",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "রিভিউ প্রকাশ",
      paragraphs: [
        "রিভিউ শুধু তখনই সংরক্ষিত হয় যখন আপনি সেই বক্সে টিক দেন যা আপনার নাম, পেশা ও দেশ প্রকাশের অনুমতি দেয়। সেই টিকই আপনার স্পষ্ট সম্মতি।",
        "আপনি [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com)-এ লিখে যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন। পরে রিভিউটি ৩০ দিনের মধ্যে সরানো হয়। প্রত্যাহারে আগের প্রকাশ অবৈধ হয় না।",
      ],
    },
    {
      id: "rights",
      heading: "আপনার অধিকার",
      paragraphs: ["আপনার নিম্নলিখিত অধিকার রয়েছে:"],
      list: [
        "আপনার তথ্য দেখা এবং তার কপি পেওয়া;",
        "তা সংশোধন করা;",
        "তা মুছে ফেলা;",
        "সম্মতি প্রত্যাহার করা;",
        "বৈধ স্বার্থ ভিত্তিক প্রক্রিয়াকরণে আপত্তি করা;",
        "প্রক্রিয়াকরণ সীমিত করার অনুরোধ করা;",
        "প্রদত্ত তথ্য পাঠযোগ্য বিন্যাসে পাওয়া এবং আইন অনুমতি দিলে অন্য দায়িত্বশীলের কাছে হস্তান্তর করা;",
        "সৌদি ডাটা ও এআই অথরিটি (SDAIA), EEA-তে আপনার বাসস্থান দেশের ডাটা সুরক্ষা কর্তৃপক্ষ, বা যুক্তরাষ্ট্রের ICO-র কাছে অভিযোগ দায়ের করা।",
      ],
      paragraphsAfterList: [
        "আমাদের [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) বা [+966 59 610 1097](https://wa.me/966596101097)-এ লিখুন। PDPL অনুযায়ী আমরা ৩০ দিনের মধ্যে উত্তর দিই; অনুপাতহীন প্রচেষ্টার ক্ষেত্রে আরও ৩০ দিন বাড়ানো যায়, সেক্ষেত্রে আগে জানিয়ে দিই। GDPR অনুযায়ী সময় এক মাস, দুই মাস পর্যন্ত বাড়ানো যায়। আমরা পরিচয় যাচাই চাইতে পারি।",
      ],
    },
    {
      id: "security",
      heading: "নিরাপত্তা ও ঘটনা",
      paragraphs: [
        "সাইট HTTPS, সুরক্ষিত অ্যাডমিন প্রবেশ, সার্ভার-পার্শ্ব ফর্ম যাচাই এবং নিরাপত্তা লগ ব্যবহার করে। অ্যাডমিন ব্যাকআপ সীমিত স্থানে রাখা হয়।",
        "কোনো তথ্য ঘটনা আপনার অধিকার ক্ষতি করতে পারলে সৌদি আইন দাবি করলে আমরা ৭২ ঘণ্টার মধ্যে SDAIA-কে জানাই এবং উচ্চ ঝুঁকিতে ভুক্তদের অবহিত করি। GDPR অনুযায়ী কর্তৃপক্ষকে ৭২ ঘণ্টার মধ্যে এবং উচ্চ ঝুঁকিতে ভুক্তদের অবহিত করা হয়।",
      ],
    },
    {
      id: "children",
      heading: "শিশুরা",
      paragraphs: [
        "সাইটটি ১৬ বছরের কম বয়সীদের জন্য নয়। আমরা ইচ্ছাকৃতভাবে তাদের তথ্য সংগ্রহ করি না। কোনো অভিভাবক এমন তথ্য দেখলে অবিলম্বে মুছে ফেলার অনুরোধ করতে পারেন।",
      ],
    },
    {
      id: "marketing",
      heading: "মার্কেটিং ও স্বয়ংক্রিয় সিদ্ধান্ত",
      paragraphs: [
        "পূর্ব সম্মতি ছাড়া আমরা কোনো প্রচারমূলক বার্তা পাঠাই না। শুধু স্বয়ংক্রিয় প্রক্রিয়াকরণ দ্বারা কোনো আইনি বা তাৎপর্যপূর্ণ সিদ্ধান্ত নিই না।",
      ],
    },
    {
      id: "changes",
      heading: "নীতিতে পরিবর্তন",
      paragraphs: [
        "প্রতিটি পরিবর্তন নতুন তারিখ সহ এখানে প্রকাশিত হয়। গুরুত্বপূর্ণ পরিবর্তনের জন্য সাইটে দৃশ্যমান নোট যোগ করা হয়।",
      ],
    },
  ],
};

const tr: PrivacyContent = {
  intro:
    "Bu politika, sitenin hangi veriyi neden işlediğini, kime gönderdiğini ve ne kadar sakladığını açıklar. ennakhlaelmubaraka.com'un tüm dil sürümlerini ve WhatsApp ile e-posta üzerinden sipariş yazışmalarını kapsar.",
  effectiveDate: "Son güncelleme: 19 Kasım 2026",
  sections: [
    {
      id: "controller",
      heading: "Sorumlu kuruluş ve kapsam",
      paragraphs: [
        "Veri sorumlusu, 7043497630 ticaret sicil numarasıyla kayıtlı Suudi işletme مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah)'tır. Adres: Dükkan No. 49, Merkezi Hurma Pazarı, Al Wabra, Medine 42371, Suudi Arabistan.",
        "Verilerinizle ilgili soru veya talepler için: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) veya [+966 59 610 1097](https://wa.me/966596101097). Hediye ve toplu siparişler [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) adresine de ulaşır.",
        "Bu politika siteyi ve sipariş kanallarını kapsar. Siteden açtığınız üçüncü taraf hizmetlerin (WhatsApp, Google Haritalar, sosyal ağlar) kendi kuralları vardır.",
      ],
    },
    {
      id: "limits",
      heading: "Sitenin yapmadığı şeyler",
      paragraphs: [
        "Site şu anda çevrimiçi ödeme kabul etmemektedir. Kart numarası, kart kodu veya IBAN istenmez. Ödeme doğrudan mağaza ile kararlaştırılır, genellikle banka havalesiyle. Bu sınır şu anda yürürlüktedir ve herhangi bir zamanda değişebilir. Şirketimiz, önceden bildirimde bulunmaksızın bu sınırı dilediği zaman değiştirme hakkını saklı tutar ve gizlilik politikasını buna göre günceller.",
        "Siparişler bir müşteri veritabanına yazılmaz: bilgiler WhatsApp mesajı oluşturmak ve siparişi hazırlamak için kullanılır. Yayımlanan yorumlar ayrı bir veritabanında tutulur.",
        "Verilerinizi satmıyoruz ve reklamverenlere göndermiyoruz. Tek alıcılar siteyi çalıştırmak için gerekli teknik sağlayıcılar ve sizin kullanmayı seçtiğiniz hizmetlerdir.",
      ],
    },
    {
      id: "collection",
      heading: "Toplanan veriler, amaçlar ve yasal dayanak",
      paragraphs: [],
      subsections: [
        {
          heading: "Sipariş",
          paragraphs: [
            "Sipariş formu ad, telefon, e-posta, şehir, teslimat seçilirse adres, teslimat yöntemi, ödeme yöntemi, notlar ve sepet içeriğini toplar. Veriler WhatsApp bağlantısını oluşturmak için sunucumuzdan geçer. Mesajda ad, telefon, şehir, adres, ürünler, seçimler ve notlar bulunur; e-posta yer almaz.",
            "Amaç: siparişi hazırlamak, onaylamak ve takip etmek. Yasal dayanak: sözleşmenin veya önceki anlaşmanın yerine getirilmesi (Suudi PDPL md. 6; GDPR md. 6(1)(b)).",
          ],
        },
        {
          heading: "İletişim, hediye ve toplu sipariş",
          paragraphs: [
            "İletişim formu yalnızca ad ve mesaj ister. Mesaj doğrudan tarayıcınızda WhatsApp'ı açar ve sunucularımızdan geçmez.",
            "Hediye formu ad, şehir, telefon, amaç, miktar, ürün türü, kuruluş, vesile, bütçe, tarih ve ayrıntıları toplar. Toplu sipariş formu ad, şehir, telefon, miktar, çeşit ve sınıfı toplar. Sunucumuz aracılığıyla [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com) adresine bir kopya gönderilir ve aynı mesaj WhatsApp'ta açılır.",
            "Amaç: yanıt vermek ve teklif hazırlamak. Yasal dayanak: talebiniz ve önceki anlaşma (PDPL md. 6; GDPR md. 6(1)(b)).",
          ],
        },
        {
          heading: "Müşteri yorumları",
          paragraphs: [
            "Yorum formu ad, WhatsApp numarası, meslek, uyruk, ülke, metin, puan ve dili toplar. WhatsApp numarası ve iç notlar hiçbir zaman herkese açık gösterilmez.",
            "Amaç: yorumu inceleyip adınız, mesleğiniz ve ülkenizle yayımlamak. Yasal dayanak: açık rızanız (PDPL md. 5; GDPR md. 6(1)(a)).",
          ],
        },
        {
          heading: "Teknik veriler",
          paragraphs: [
            "Barındırma sağlayıcısı IP adresini, tarayıcı türünü, ziyaret edilen sayfaları, zaman damgalarını ve hata mesajlarını otomatik kaydeder. Amaç: siteyi çalıştırmak ve güvenliğini sağlamak. Yasal dayanak: hizmeti sürdürme konusundaki meşru menfaatimiz, yasanın belirlediği sınırlar içinde (PDPL md. 6; GDPR md. 6(1)(f)).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "Verileri kimler alır",
      paragraphs: [
        "Vercel siteyi barındırır ve sipariş mesajlarını oluşturan işlevleri çalıştırır. Neon, yorumları eu-central-1 bölgesindeki PostgreSQL veritabanında saklar. Hostinger talep e-postalarını gönderir. Google ve Meta araçları yalnızca rızanızdan sonra yüklenir. Bağlayıcı bir yasa gerektirdiğinde yetkililer veri alabilir.",
        "Bu bilgiler başka bir satıcıya veya veri komisyoncusuna verilmez. WhatsApp mesajları ve e-postalar Meta'nın ve e-posta sağlayıcınızın koşullarına tabidir.",
      ],
    },
    {
      id: "transfers",
      heading: "Suudi Arabistan dışına aktarım",
      paragraphs: [
        "Veriler Suudi Arabistan'da, Avrupa Birliği'nde (yorum veritabanı) ve altyapısı Amerika Birleşik Devletleri veya başka yerlerde bulunabilen sağlayıcılarda (Vercel, Google, Meta, Hostinger) işlenir.",
        "Bu sağlayıcılardan PDPL'ye ve AEA ile Birleşik Krallık için GDPR'ye uygun güvenceler isteriz: yeterlilik kararları veya standart sözleşme hükümleri. Hangi mekanizmanın uygulandığını öğrenmek için bize yazabilirsiniz.",
        "AEA ve Birleşik Krallık'taki kişiler için veri sorumlusu bu politikanın başında belirtilen Suudi kuruluştur. Burada şu anda yayımlanmış bir Avrupa temsilcisi yoktur; GDPR md. 27 gereği bir temsilci atanması gerekirse iletişim bilgileri ilgili işlemeden önce burada yayımlanır.",
      ],
    },
    {
      id: "retention",
      heading: "Saklama süreleri",
      paragraphs: [
        "Siparişler: mağaza yazışmaları son iletişimden itibaren 24 ay içinde silinir; bir anlaşmazlık veya yasal yükümlülük saklanmasını gerektiriyorsa hariç. WhatsApp/Meta kopyaları kendi kurallarına tabidir.",
        "Hediye ve toplu siparişler: talep e-postaları 24 ay saklanır, ardından anlaşmazlık yoksa silinir.",
        "Yorumlar: yayımlanmamış bir yorum 30 gün içinde silinir. Yayımlanmış bir yorum, siz kaldırılmasını isteyene kadar sitede kalır.",
        "Teknik kayıtlar: barındırma sağlayıcısının olayları teşhis etmesi için gereken kısa süre boyunca tutulur.",
        "Rıza seçimi: değiştirene veya site depolamasını temizleyene kadar tarayıcınızda kalır.",
        "Sepet: sipariş tamamlanana veya depolama temizlenene kadar tarayıcınızda kalır.",
        "Yönetici oturumu: yalnızca yetkili personel için oturum çerezi; çıkışta veya tarayıcı kapatıldığında silinir.",
      ],
    },
    {
      id: "cookies",
      heading: "Çerezler, yerel depolama ve analitik",
      paragraphs: [
        "Sepet ve rıza seçimi tarayıcının yerel depolamasını kullanır. İkisi de istediğiniz hizmet için gereklidir ve önceden rıza gerektirmez.",
        "Yönetici alanı yalnızca yetkili personel için oturum çerezi kullanır. Ziyaretçileri izlemek için kullanılmaz.",
        "Google Tag Manager ve içindeki araçlar (GA4 ve muhtemelen Meta Pixel) yalnızca rızanızdan sonra yüklenir. Reddetmek, kabul etmek kadar kolaydır. Kararınızı altbilgideki «Çerez ayarları» ile istediğiniz zaman değiştirebilirsiniz.",
        "Google Haritalar ve sosyal ağ bağlantıları siz tıklamadıkça hiçbir şey yüklemez.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "Yorumların yayımlanması",
      paragraphs: [
        "Bir yorum, yalnızca adınızın, mesleğinizin ve ülkenizin yayımlanmasına izin veren kutuyu işaretlerseniz kaydedilir. Bu işaret açık rızanızdır.",
        "Bu rızayı [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) adresine yazarak istediğiniz zaman geri çekebilirsiniz. Yorum daha sonra 30 gün içinde kaldırılır. Geri çekme, önceki yayımlamayı yasa dışı yapmaz.",
      ],
    },
    {
      id: "rights",
      heading: "Haklarınız",
      paragraphs: ["Aşağıdaki haklara sahipsiniz:"],
      list: [
        "verilerinize erişmek ve kopyasını almak;",
        "verileri düzeltmek;",
        "verileri silmek;",
        "rızayı geri çekmek;",
        "meşru menfaate dayalı işleme itiraz etmek;",
        "işlemenin kısıtlanmasını istemek;",
        "verdiğiniz verileri okunabilir biçimde almak ve yasa izin veriyorsa başka bir sorumluya aktarmak;",
        "Suudi Veri ve Yapay Zekâ Otoritesi'ne (SDAIA), AEA'da ikamet ettiğiniz ülkenin veri koruma otoritesine veya Birleşik Krallık'ta ICO'ya şikâyet sunmak.",
      ],
      paragraphsAfterList: [
        "Bize [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) veya [+966 59 610 1097](https://wa.me/966596101097) adresinden yazın. PDPL kapsamında 30 gün içinde yanıt veririz; talebin orantısız çaba gerektirmesi hâlinde 30 gün uzatma mümkündür ve bunu önceden bildiririz. GDPR kapsamında süre bir aydır, iki ay uzatılabilir. Kimlik doğrulaması isteyebiliriz.",
      ],
    },
    {
      id: "security",
      heading: "Güvenlik ve olaylar",
      paragraphs: [
        "Site HTTPS, korumalı yönetici erişimi, sunucu tarafında form doğrulaması ve güvenlik kayıtları kullanır. Yönetici yedekleri kısıtlı bir alanda tutulur.",
        "Bir veri olayı haklarınıza zararverecekse Suudi yasası gerektirdiğinde SDAIA'yı 72 saat içinde bilgilendiririz ve risk yüksekse ilgili kişilere haber veririz. GDPR kapsamında otorite 72 saat içinde, ilgili kişiler ise yüksek risk hâlinde bilgilendirilir.",
      ],
    },
    {
      id: "children",
      heading: "Çocuklar",
      paragraphs: [
        "Site 16 yaşın altındaki kişilere yönelik değildir. Verilerini bilerek toplamayız. Böyle bir veriyi gören ebeveyn veya vasisi hemen silinmesini isteyebilir.",
      ],
    },
    {
      id: "marketing",
      heading: "Pazarlama ve otomatik kararlar",
      paragraphs: [
        "Önceden rıza olmadan tanıtım mesajı göndermeyiz. Yalnızca otomatik işlemeyle hukuki veya önemli etkisi olan karar almayız.",
      ],
    },
    {
      id: "changes",
      heading: "Politikada değişiklik",
      paragraphs: [
        "Her değişiklik yeni bir tarihle burada yayımlanır. Önemli değişikliklerde sitede görünür bir bildirim ekleriz.",
      ],
    },
  ],
};

const ms: PrivacyContent = {
  intro:
    "Dasar ini menjelaskan data apa yang diproses laman, mengapa, kepada siapa dihantar, dan berapa lama disimpan. Ia terpakai pada ennakhlaelmubaraka.com, semua versi bahasa, serta perbualan pesanan melalui WhatsApp dan e-mel.",
  effectiveDate: "Kemas kini terakhir: 19 November 2026",
  sections: [
    {
      id: "controller",
      heading: "Pihak bertanggungjawab dan skop",
      paragraphs: [
        "Pihak bertanggungjawab ialah مؤسسة النخلة المباركة للتجارة (Al Nakhlah Al Mubarakah), perniagaan Saudi yang didaftarkan dengan nombor pendaftaran dagangan 7043497630, beralamat di Kedai No. 49, Pasar Kurma Pusat, Al Wabra, Madinah 42371, Arab Saudi.",
        "Untuk sebarang soalan atau permintaan mengenai data anda: [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) atau [+966 59 610 1097](https://wa.me/966596101097). Permintaan hadiah dan pesanan pukal juga sampai ke [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com).",
        "Dasar ini merangkumi laman dan saluran pesanannya. Perkhidmatan pihak ketiga yang anda buka dari laman (WhatsApp, Google Maps, rangkaian sosial) mempunyai peraturan sendiri.",
      ],
    },
    {
      id: "limits",
      heading: "Apa yang tidak dilakukan laman",
      paragraphs: [
        "Laman ini pada masa ini tidak menerima bayaran dalam talian. Ia tidak meminta nombor kad, kod kad atau IBAN. Bayaran dipersetujui terus dengan kedai, biasanya melalui pemindahan bank. Had ini berkuat kuasa pada masa ini dan boleh berubah bila-bila masa. Syarikat kami berhak menukarnya bila-bila masa tanpa notis terlebih dahulu, dan kami mengemas kini dasar privasi sewajarnya.",
        "Pesanan tidak dimasukkan ke dalam pangkalan data pelanggan: maklumat digunakan untuk membina mesej WhatsApp dan menyediakan pesanan. Ulasan yang diterbitkan disimpan dalam pangkalan data berasingan.",
        "Kami tidak menjual data anda dan tidak menghantarnya kepada pengiklan. Penerimanya hanya penyedia teknikal yang diperlukan untuk menjalankan laman, serta perkhidmatan yang anda pilih sendiri.",
      ],
    },
    {
      id: "collection",
      heading: "Data yang dikumpul, tujuan dan asas undang-undang",
      paragraphs: [],
      subsections: [
        {
          heading: "Pesanan",
          paragraphs: [
            "Borang pesanan mengumpul nama, telefon, e-mel, bandar, alamat jika penghantaran dipilih, kaedah penghantaran, kaedah bayaran, nota dan kandungan bakul. Data melalui pelayan kami untuk mencipta pautan WhatsApp. Mesej mengandungi nama, telefon, bandar, alamat, barang, pilihan dan nota; e-mel tidak disertakan.",
            "Tujuan: menyediakan, mengesahkan dan mengikut pesanan. Asas undang-undang: pelaksanaan kontrak atau perjanjian terdahulu (Perkara 6 PDPL Saudi; Perkara 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Hubungan, hadiah dan pesanan pukal",
          paragraphs: [
            "Borang hubungan hanya meminta nama dan mesej. Ia membuka WhatsApp terus dalam pelayar anda dan tidak melalui pelayan kami.",
            "Borang hadiah mengumpul nama, bandar, telefon, tujuan, kuantiti, jenis produk, organisasi, majlis, bajet, tarikh dan butiran. Borang pukal mengumpul nama, bandar, telefon, kuantiti, varieti dan gred. Satu salinan dihantar melalui pelayan kami ke [commandes@ennakhlaelmubaraka.com](mailto:commandes@ennakhlaelmubaraka.com), dan mesej yang sama dibuka dalam WhatsApp.",
            "Tujuan: menjawab dan menyediakan sebut harga. Asas undang-undang: permintaan anda dan perjanjian terdahulu (Perkara 6 PDPL; Perkara 6(1)(b) GDPR).",
          ],
        },
        {
          heading: "Ulasan pelanggan",
          paragraphs: [
            "Borang ulasan mengumpul nama, nombor WhatsApp, pekerjaan, kewarganegaraan, negara, teks, penarafan dan bahasa. Nombor WhatsApp dan nota dalaman tidak pernah ditunjukkan secara awam.",
            "Tujuan: menyemak lalu menerbitkan ulasan dengan nama, pekerjaan dan negara anda. Asas undang-undang: kebenaran nyata anda (Perkara 5 PDPL; Perkara 6(1)(a) GDPR).",
          ],
        },
        {
          heading: "Data teknikal",
          paragraphs: [
            "Hos secara automatik merekod alamat IP, jenis pelayar, halaman yang dilawat, masa dan mesej ralat. Tujuan: menjalankan dan melindungi laman. Asas undang-undang: kepentingan sah kami untuk mengekalkan perkhidmatan, dalam had yang ditetapkan undang-undang (Perkara 6 PDPL; Perkara 6(1)(f) GDPR).",
          ],
        },
      ],
    },
    {
      id: "recipients",
      heading: "Siapa yang menerima data",
      paragraphs: [
        "Vercel menghos laman dan menjalankan fungsi yang membina mesej pesanan. Neon menyimpan ulasan dalam pangkalan data PostgreSQL di eu-central-1. Hostinger menghantar e-mel permintaan. Alat Google dan Meta hanya dimuat selepas kebenaran anda. Pihak berkuasa boleh menerima data jika undang-undang menghendakinya.",
        "Maklumat ini tidak diberikan kepada peniaga lain atau broker data. Mesej WhatsApp dan e-mel dikendalikan mengikut terma Meta dan penyedia e-mel anda.",
      ],
    },
    {
      id: "transfers",
      heading: "Pemindahan keluar Arab Saudi",
      paragraphs: [
        "Data diproses di Arab Saudi, Kesatuan Eropah (pangkalan data ulasan) dan oleh penyedia yang infrastrukturnya mungkin di Amerika Syarikat atau tempat lain (Vercel, Google, Meta, Hostinger).",
        "Kami meminta penyedia menggunakan jaminan yang diterima oleh PDPL dan, untuk EEA serta UK, oleh GDPR: keputusan kecukupan atau klausa kontrak standard. Tulis kepada kami untuk mengetahui mekanisme yang terpakai pada setiap penyedia.",
        "Bagi orang di EEA dan UK, pihak bertanggungjawab kekal entiti Saudi yang dinyatakan di awal dasar ini. Tiada wakil Eropah yang diterbitkan di sini setakat ini; jika wakil diperlukan di bawah Perkara 27 GDPR, butirannya akan diterbitkan di sini sebelum pemprosesan berkaitan.",
      ],
    },
    {
      id: "retention",
      heading: "Tempoh penyimpanan",
      paragraphs: [
        "Pesanan: perbualan kedai dipadam dalam tempoh 24 bulan selepas hubungan terakhir, kecuali pertikaian atau kewajipan undang-undang memerlukannya disimpan. Salinan WhatsApp/Meta tertakluk pada peraturan mereka sendiri.",
        "Permintaan hadiah dan pukal: e-mel disimpan 24 bulan kemudian dipadam, kecuali ada pertikaian.",
        "Ulasan: ulasan yang tidak diterbitkan dipadam dalam 30 hari. Ulasan yang diterbitkan kekal tersedia di laman kecuali anda meminta pengalihkeluarannya.",
        "Log teknikal: disimpan hanya untuk tempoh singkat yang diperlukan hos bagi mendiagnosis insiden.",
        "Pilihan kebenaran: disimpan dalam pelayar sehingga anda menukarnya atau membersihkan storan laman.",
        "Bakul: disimpan dalam pelayar sehingga pesanan siap atau storan dibersihkan.",
        "Sesi pentadbir: kuki sesi hanya untuk kakitangan diberi kuasa, dibuang pada log keluar atau apabila pelayar ditutup.",
      ],
    },
    {
      id: "cookies",
      heading: "Kuki, storan tempatan dan analitik",
      paragraphs: [
        "Bakul dan pilihan kebenaran menggunakan storan tempatan pelayar. Kedua-duanya diperlukan untuk perkhidmatan yang anda minta dan tidak memerlukan kebenaran terlebih dahulu.",
        "Kawasan pentadbir menggunakan kuki sesi hanya untuk kakitangan diberi kuasa. Ia tidak digunakan untuk menjejak pelawat.",
        "Google Tag Manager dan alat di dalamnya (GA4, dan mungkin Meta Pixel) hanya dimuat selepas kebenaran anda. Menolak sama mudahnya dengan menerima. Anda boleh menukar pilihan bila-bila masa melalui «Tetapan kuki» di kaki laman.",
        "Pautan ke Google Maps dan rangkaian sosial tidak memuat apa-apa sebelum anda klik.",
      ],
    },
    {
      id: "testimonial-consent",
      heading: "Penerbitan ulasan",
      paragraphs: [
        "Ulasan hanya disimpan jika anda menandakan kotak yang membenarkan penerbitan nama, pekerjaan dan negara anda. Tanda itu ialah kebenaran nyata anda.",
        "Anda boleh menarik kebenaran bila-bila masa dengan menulis ke [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com). Ulasan kemudian dialihkeluar dalam 30 hari. Penarikan tidak menjadikan penerbitan sebelum ini tidak sah.",
      ],
    },
    {
      id: "rights",
      heading: "Hak anda",
      paragraphs: ["Anda mempunyai hak untuk:"],
      list: [
        "mengakses data anda dan mendapat salinannya;",
        "membetulkannya;",
        "memadamkannya;",
        "menarik kebenaran;",
        "membantah pemprosesan berdasarkan kepentingan sah;",
        "meminta sekatan pemprosesan;",
        "menerima data yang diberikan dalam format boleh dibaca dan memindahkannya kepada pengawal lain jika undang-undang membenarkan;",
        "mengemukakan aduan kepada Pihak Berkuasa Data & AI Saudi (SDAIA), pihak berkuasa perlindungan data di negara kediaman anda di EEA, atau ICO di UK.",
      ],
      paragraphsAfterList: [
        "Tulis kepada [nakhla.mubaraka26@gmail.com](mailto:nakhla.mubaraka26@gmail.com) atau [+966 59 610 1097](https://wa.me/966596101097). Di bawah PDPL kami menjawab dalam 30 hari, dengan kemungkinan lanjutan 30 hari jika permintaan memerlukan usaha tidak seimbang; kami akan memaklumkan anda terlebih dahulu. Di bawah GDPR tempohnya satu bulan, boleh dilanjutkan dua bulan. Kami mungkin meminta pengesahan identiti.",
      ],
    },
    {
      id: "security",
      heading: "Keselamatan dan insiden",
      paragraphs: [
        "Laman menggunakan HTTPS, akses pentadbir yang dilindungi, pengesahan borang di pelayan dan log keselamatan. Sandaran pentadbir disimpan di ruang terhad.",
        "Jika insiden data berkemungkinan mendatangkan mudarat kepada hak anda, kami memaklumkan SDAIA dalam 72 jam apabila undang-undang Saudi mengkehendakinya, dan memaklumkan orang yang terkesan apabila risiko tinggi. Di bawah GDPR, pihak berkuasa dimaklumkan dalam 72 jam dan orang yang terkesan dimaklumkan jika risiko tinggi.",
      ],
    },
    {
      id: "children",
      heading: "Kanak-kanak",
      paragraphs: [
        "Laman ini tidak ditujukan kepada orang di bawah 16 tahun. Kami tidak sengaja mengumpul data mereka. Ibu bapa atau penjaga yang melihat data sedemikian boleh meminta pemadaman segera.",
      ],
    },
    {
      id: "marketing",
      heading: "Pemasaran dan keputusan automatik",
      paragraphs: [
        "Kami tidak menghantar mesej promosi tanpa kebenaran terlebih dahulu. Kami tidak membuat keputusan berkesan undang-undang atau penting hanya melalui pemprosesan automatik.",
      ],
    },
    {
      id: "changes",
      heading: "Perubahan dasar",
      paragraphs: [
        "Setiap perubahan diterbitkan di sini dengan tarikh baharu. Untuk perubahan penting kami menambah notis yang kelihatan di laman.",
      ],
    },
  ],
};

const policies: Record<Locale, PrivacyContent> = {
  ar,
  en,
  fr,
  ur,
  id,
  bn,
  tr,
  ms,
};

export function getPrivacyContent(locale: Locale): PrivacyContent {
  return policies[locale];
}
