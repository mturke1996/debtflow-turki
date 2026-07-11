import type { Invoice, Payment, Debt, StandaloneDebt, FinancialSummary, MonthlyData } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { calculateStandaloneDebtTotals } from './standaloneDebts';

dayjs.locale('ar');

export const formatCurrency = (amount: number): string => {
  let formatted: string;

  if (amount % 1 === 0) {
    formatted = amount.toString();
  } else {
    formatted = amount.toFixed(3).replace(/\.?0+$/, '');
  }

  return `${formatted} د.ل`;
};

export const calculateInvoiceTotal = (
  items: { quantity: number; unitPrice: number }[],
  taxRate: number = 0
): { subtotal: number; taxAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
};

/**
 * ملخص مالي للفواتير والتحصيل.
 * «إجمالي الديون» و«المتبقي» من standaloneDebts فقط (قسم الديون).
 * ديون الفواتير (debts collection) لا تدخل في بطاقات الديون.
 */
export const calculateFinancialSummary = (
  invoices: Invoice[],
  payments: Payment[],
  standaloneDebts: StandaloneDebt[] = []
): FinancialSummary => {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const { totalRemaining, totalAmount: totalDebt } =
    calculateStandaloneDebtTotals(standaloneDebts);

  const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

  const monthlyMap = new Map<string, MonthlyData>();

  invoices.forEach((invoice) => {
    const date = dayjs(invoice.issueDate);
    const key = `${date.year()}-${date.month()}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: date.month() + 1,
        year: date.year(),
        totalInvoiced: 0,
        totalCollected: 0,
        totalDebt: 0,
      });
    }

    const monthData = monthlyMap.get(key)!;
    monthData.totalInvoiced += invoice.total;
  });

  payments.forEach((payment) => {
    const date = dayjs(payment.paymentDate);
    const key = `${date.year()}-${date.month()}`;

    if (monthlyMap.has(key)) {
      const monthData = monthlyMap.get(key)!;
      monthData.totalCollected += payment.amount;
    }
  });

  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return {
    totalDebt,
    totalPaid,
    totalRemaining,
    overdueAmount: 0,
    collectionRate,
    monthlyData,
  };
};

export const getInvoiceStatus = (invoice: Invoice, dueDate: string): Invoice['status'] => {
  if (invoice.status === 'paid') return 'paid';
  if (dayjs(dueDate).isBefore(dayjs(), 'day')) return 'overdue';
  return invoice.status;
};

export const calculateDebtProgress = (totalAmount: number, paidAmount: number): number => {
  if (totalAmount === 0) return 0;
  return (paidAmount / totalAmount) * 100;
};
