import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';

dayjs.extend(relativeTime);

// تعيين اللغة العربية بشكل افتراضي
dayjs.locale('ar');

// تنسيق العملة - الدينار الليبي
export const formatCurrency = (amount: number): string => {
  // استخدام تنسيق مخصص للدينار الليبي
  const formatted = new Intl.NumberFormat('ar-LY', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
  
  return `${formatted} د.ل`;
};

// تنسيق التاريخ بالعربية
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

// تنسيق التاريخ والوقت
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY - hh:mm A');
};

// تنسيق التاريخ النسبي (منذ...)
export const formatRelativeDate = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

// تنسيق الأرقام
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-LY').format(num);
};

// تنسيق النسبة المئوية
export const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

// تنسيق رقم الهاتف الليبي
export const formatLibyanPhone = (phone: string): string => {
  // إزالة المسافات والرموز
  const cleaned = phone.replace(/\D/g, '');
  
  // تنسيق رقم الهاتف الليبي
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

// طرق الدفع بالعربية
export const paymentMethods = {
  cash: 'نقداً',
  check: 'شيك',
  bank_transfer: 'تحويل بنكي',
  credit_card: 'بطاقة ائتمان',
  mobile_payment: 'دفع إلكتروني',
} as const;

export type PaymentMethod = keyof typeof paymentMethods;

// حالات الفواتير بالعربية
export const invoiceStatuses = {
  draft: 'مسودة',
  sent: 'مرسلة',
  paid: 'مدفوعة',
  partially_paid: 'مدفوعة جزئياً',
  overdue: 'متأخرة',
  cancelled: 'ملغاة',
} as const;

export type InvoiceStatus = keyof typeof invoiceStatuses;

export const getStatusLabel = (status: string): string =>
  invoiceStatuses[status as InvoiceStatus] ?? 'نشطة';

export const getInvoiceStatusStyle = (status: string): { bg: string; color: string; border: string } => {
  switch (status) {
    case 'paid':
      return { bg: 'var(--pastel-green-bg)', color: 'var(--pastel-green-fg)', border: 'var(--pastel-green-fg)' };
    case 'partially_paid':
      return { bg: 'var(--pastel-amber-bg)', color: 'var(--pastel-amber-fg)', border: 'var(--pastel-amber-fg)' };
    case 'overdue':
      return { bg: 'var(--pastel-red-bg)', color: 'var(--pastel-red-fg)', border: 'var(--pastel-red-fg)' };
    case 'draft':
      return { bg: 'var(--panel-muted)', color: 'var(--ink-faint)', border: 'var(--ink-faint)' };
    default:
      return { bg: 'var(--accent-soft)', color: 'var(--accent-text)', border: 'var(--accent)' };
  }
};

// حالات الديون بالعربية
export const debtStatuses = {
  unpaid: 'غير مدفوع',
  partially_paid: 'مدفوع جزئياً',
  paid: 'مدفوع',
  overdue: 'متأخر',
} as const;

// أنواع العملاء بالعربية
export const clientTypes = {
  company: 'شركة',
  individual: 'فرد',
} as const;

// حالات المشاريع بالعربية
export const projectStatuses = {
  planning: 'تخطيط',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  on_hold: 'متوقف مؤقتاً',
  cancelled: 'ملغي',
} as const;

