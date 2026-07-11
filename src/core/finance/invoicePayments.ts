import dayjs from "dayjs";
import type { Invoice, Payment } from "@/types";

export function sumInvoicePayments(payments: Payment[], invoiceId: string): number {
  if (!invoiceId) return 0;
  return payments
    .filter((p) => p.invoiceId === invoiceId)
    .reduce((sum, p) => sum + p.amount, 0);
}

export type InvoicePaymentSummary = {
  paid: number;
  remaining: number;
  progressPct: number;
};

export function getInvoicePaymentSummary(
  invoice: Invoice,
  payments: Payment[]
): InvoicePaymentSummary {
  const paid = sumInvoicePayments(payments, invoice.id);
  const remaining = Math.max(0, invoice.total - paid);
  const progressPct =
    invoice.total > 0 ? Math.min(100, Math.round((paid / invoice.total) * 100)) : 0;
  return { paid, remaining, progressPct };
}

export function deriveInvoiceStatus(
  invoice: Invoice,
  paidTotal: number
): Invoice["status"] {
  if (invoice.status === "cancelled") return "cancelled";
  if (paidTotal >= invoice.total && invoice.total > 0) return "paid";
  if (paidTotal > 0) return "partially_paid";
  if (invoice.status === "draft") return "draft";
  if (dayjs(invoice.dueDate).isBefore(dayjs(), "day")) return "overdue";
  return invoice.status === "sent" ? "sent" : "sent";
}
