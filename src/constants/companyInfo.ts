/**
 * هوية الشركة — مصدر واحد للواجهة وملفات PDF.
 * العنوان مرتبط بموقع Google Maps للمكتب.
 */
/** الاسم الكامل في ملفات PDF والطباعة */
export const PDF_COMPANY_FULL_NAME = "شركة المهندسة للأستشارات الهندسية";

export const COMPANY_INFO = {
  /** اسم الشركة في الواجهة والصفحة الرئيسية */
  companyName: "شركة المهندسة",
  /** السطر تحت اسم الشركة */
  engineerName: "المهندس محمد التركي",
  engineerNameEn: "Eng. Mohamed El-Turki",
  tagline: "إنشاءات وتعهدات",
  taglineEn: "Construction & Contracting",

  addressLines: ["تاجوراء", "طرابلس — ليبيا"],
  addressSingle: "تاجوراء، طرابلس — ليبيا",
  mapsUrl: "https://maps.app.goo.gl/ffUiMUmesWA24rWY9",

  phones: ["0911191263"] as string[],
  email: "" as string,
  website: "" as string,

  logoSrc: "/logo.png",
  logoAlt: "شعار شركة المهندسة",

  services: [
    "إدارة المشاريع والمتابعة الميدانية",
    "حسابات المصروفات والدفعات والديون",
    "إعداد الفواتير والمستخلصات الرسمية",
    "تقارير شاملة لكل عميل",
  ],

  footerNote: "وثيقة رسمية — يُعتد بالنسخ المطبوعة الموثّقة فقط.",
  copyright: "شركة المهندسة — المهندس محمد التركي",
} as const;

/** @deprecated استخدم COMPANY_INFO */
export const PDF_COMPANY_INFO = {
  brandName: PDF_COMPANY_FULL_NAME,
  fullName: PDF_COMPANY_FULL_NAME,
  engineerName: COMPANY_INFO.engineerName,
  taglineEn: COMPANY_INFO.taglineEn,
  addressLines: [...COMPANY_INFO.addressLines],
  addressSingle: COMPANY_INFO.addressSingle,
  phones: [...COMPANY_INFO.phones],
  email: COMPANY_INFO.email,
  website: COMPANY_INFO.website,
  services: [...COMPANY_INFO.services],
  footerNote: COMPANY_INFO.footerNote,
} as const;

export const PRINT_COMPANY_INFO = {
  name: PDF_COMPANY_FULL_NAME,
  subtitle: COMPANY_INFO.engineerName,
  address: COMPANY_INFO.addressSingle,
  phone: COMPANY_INFO.phones.join(" — "),
  email: COMPANY_INFO.email,
  taxNumber: "",
};
