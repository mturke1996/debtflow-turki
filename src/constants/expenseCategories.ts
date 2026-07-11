/**
 * 12 فئة عملية لمصروفات المقاولات والإنشاءات
 * (مواد · حديد · عمالة · باطن · معدات · نقل · تشطيب · كهروميكانيك · موقع · تراخيص · صيانة · إدارية)
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  "مواد بناء",
  "حديد وتسليح",
  "عمالة",
  "مقاولات فرعية",
  "معدات وإيجار",
  "نقل ووقود",
  "تشطيبات",
  "كهروميكانيك",
  "حفر وسقالة",
  "تراخيص وتأمين",
  "صيانة وحراسة",
  "مصروفات إدارية",
] as const;

export type DefaultExpenseCategory = (typeof DEFAULT_EXPENSE_CATEGORIES)[number];

export const DEFAULT_EXPENSE_CATEGORY: DefaultExpenseCategory = "مواد بناء";

export type ExpenseCategoryMeta = {
  hint: string;
  tone: string;
};

export const EXPENSE_CATEGORY_META: Record<DefaultExpenseCategory, ExpenseCategoryMeta> = {
  "مواد بناء": {
    hint: "إسمنت، رمل، زلط، بلك، عزل، خرسانة جاهزة",
    tone: "#0f766e",
  },
  "حديد وتسليح": {
    hint: "حديد تسليح، شبك، مسامير، قطع حديد",
    tone: "#475569",
  },
  عمالة: {
    hint: "أجور يومية، عمال، حرفيين، إضافي، وجبات",
    tone: "#2563eb",
  },
  "مقاولات فرعية": {
    hint: "سباكة، كهرباء، حدادة، نجارة، دهان، ألومنيوم",
    tone: "#7c3aed",
  },
  "معدات وإيجار": {
    hint: "حفارات، رافعات، مولدات، خلاطات، أدوات كهربائية",
    tone: "#b45309",
  },
  "نقل ووقود": {
    hint: "نقل مواد، شحن، دiesel، بنزين، أجور نقل",
    tone: "#0369a1",
  },
  تشطيبات: {
    hint: "بلاط، رخام، جبس، أرضيات، أبواب، ديكور",
    tone: "#c026d3",
  },
  كهروميكانيك: {
    hint: "كابلات، لوحات، مواسير، صرف، تكييف موقت",
    tone: "#ca8a04",
  },
  "حفر وسقالة": {
    hint: "حفر، ردم، سقالة، شدات، قوالب خشبية",
    tone: "#dc2626",
  },
  "تراخيص وتأمين": {
    hint: "بلدية، مخططات، فحص، تأمين، رسوم حكومية",
    tone: "#64748b",
  },
  "صيانة وحراسة": {
    hint: "حراسة موقع، نظافة، صيانة دورية، مياه موقع",
    tone: "#0d9488",
  },
  "مصروفات إدارية": {
    hint: "إشراف، اتصالات، قرطاسية، ضيافة، إيجار مكتب",
    tone: "#57534e",
  },
};

export function getCategoryMeta(category: string): ExpenseCategoryMeta | null {
  const normalized = normalizeCategoryLabel(category);
  if ((DEFAULT_EXPENSE_CATEGORIES as readonly string[]).includes(normalized)) {
    return EXPENSE_CATEGORY_META[normalized as DefaultExpenseCategory];
  }
  return null;
}

/** توحيد الفئات القديمة مع القائمة الجديدة */
export const LEGACY_CATEGORY_MAP: Record<string, DefaultExpenseCategory | string> = {
  مواد: "مواد بناء",
  إسمنت: "مواد بناء",
  رمل: "مواد بناء",
  زلط: "مواد بناء",
  طوب: "مواد بناء",
  بلك: "مواد بناء",
  عزل: "مواد بناء",
  خرسانة: "مواد بناء",
  // حديد
  حديد: "حديد وتسليح",
  تسليح: "حديد وتسليح",
  "حديد تسليح": "حديد وتسليح",
  // عمالة
  عمال: "عمالة",
  "عمالة يومية": "عمالة",
  أجور: "عمالة",
  // مقاولات
  مقاولات: "مقاولات فرعية",
  مقاول: "مقاولات فرعية",
  "مقاولات باطنة": "مقاولات فرعية",
  سباكة: "مقاولات فرعية",
  // معدات
  معدات: "معدات وإيجار",
  آليات: "معدات وإيجار",
  أدوات: "معدات وإيجار",
  "معدات ثقيلة": "معدات وإيجار",
  إيجار: "معدات وإيجار",
  // نقل
  نقل: "نقل ووقود",
  وقود: "نقل ووقود",
  توصيل: "نقل ووقود",
  // تشطيبات
  دهانات: "تشطيبات",
  دهان: "تشطيبات",
  بلاط: "تشطيبات",
  نجارة: "تشطيبات",
  تشطيب: "تشطيبات",
  رخام: "تشطيبات",
  // كهروميكانيك
  كهرباء: "كهروميكانيك",
  كهربا: "كهروميكانيك",
  ماء: "كهروميكانيك",
  مياه: "كهروميكانيك",
  "كهرباء وماء": "كهروميكانيك",
  مرافق: "كهروميكانيك",
  // موقع
  سقالات: "حفر وسقالة",
  سقالة: "حفر وسقالة",
  حفر: "حفر وسقالة",
  "سقالات وحراسة": "حفر وسقالة",
  // تراخيص
  تراخيص: "تراخيص وتأمين",
  رسوم: "تراخيص وتأمين",
  تأمين: "تراخيص وتأمين",
  "تراخيص ورسوم": "تراخيص وتأمين",
  // صيانة
  حراسة: "صيانة وحراسة",
  نظافة: "صيانة وحراسة",
  صيانة: "صيانة وحراسة",
  // إدارية
  إدارية: "مصروفات إدارية",
  "مصروفات عامة": "مصروفات إدارية",
  أخرى: "مصروفات إدارية",
};

export function normalizeCategoryLabel(category: string): string {
  const trimmed = category?.trim();
  if (!trimmed) return DEFAULT_EXPENSE_CATEGORY;
  return LEGACY_CATEGORY_MAP[trimmed] ?? trimmed;
}

export function isDefaultCategory(category: string): boolean {
  const normalized = normalizeCategoryLabel(category);
  return (DEFAULT_EXPENSE_CATEGORIES as readonly string[]).includes(normalized);
}
