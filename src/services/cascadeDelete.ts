import {
  clientsService,
  invoicesService,
  paymentsService,
  debtsService,
  expensesService,
  standaloneDebtsService,
  expenseInvoicesService,
  debtPartiesService,
} from '@/services/firebaseService';
import type {
  Client,
  Invoice,
  Payment,
  Debt,
  Expense,
  StandaloneDebt,
  ExpenseInvoice,
  DebtParty,
} from '@/types';

type StoreSnapshot = {
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  debts: Debt[];
  expenses: Expense[];
  standaloneDebts: StandaloneDebt[];
  expenseInvoices: ExpenseInvoice[];
  debtParties: DebtParty[];
};

async function deleteAll(ids: string[], deleter: (id: string) => Promise<void>) {
  await Promise.all(ids.map((id) => deleter(id)));
}

/** حذف عميل وجميع سجلاته المرتبطة من Firestore */
export async function cascadeDeleteClient(clientId: string, snap: StoreSnapshot) {
  const invoiceIds = snap.invoices.filter((i) => i.clientId === clientId).map((i) => i.id);

  const paymentIds = new Set<string>();
  snap.payments
    .filter((p) => p.clientId === clientId || invoiceIds.includes(p.invoiceId))
    .forEach((p) => paymentIds.add(p.id));

  const debtIds = snap.debts
    .filter((d) => d.clientId === clientId || invoiceIds.includes(d.invoiceId))
    .map((d) => d.id);

  const expenseIds = snap.expenses.filter((e) => e.clientId === clientId).map((e) => e.id);
  const standaloneIds = snap.standaloneDebts.filter((d) => d.clientId === clientId).map((d) => d.id);
  const partyIds = snap.debtParties.filter((p) => p.clientId === clientId).map((p) => p.id);
  const expenseInvoiceIds = snap.expenseInvoices
    .filter((ei) => ei.clientId === clientId)
    .map((ei) => ei.id);

  await deleteAll([...paymentIds], (id) => paymentsService.delete(id));
  await deleteAll(debtIds, (id) => debtsService.delete(id));
  await deleteAll(invoiceIds, (id) => invoicesService.delete(id));
  await deleteAll(expenseIds, (id) => expensesService.delete(id));
  await deleteAll(standaloneIds, (id) => standaloneDebtsService.delete(id));
  await deleteAll(partyIds, (id) => debtPartiesService.delete(id));
  await deleteAll(expenseInvoiceIds, (id) => expenseInvoicesService.delete(id));
  await clientsService.delete(clientId);
}

/** حذف فاتورة + مدفوعاتها + سجل دين الفاتورة */
export async function cascadeDeleteInvoice(invoiceId: string, snap: StoreSnapshot) {
  const paymentIds = snap.payments.filter((p) => p.invoiceId === invoiceId).map((p) => p.id);
  const debtIds = snap.debts.filter((d) => d.invoiceId === invoiceId).map((d) => d.id);

  await deleteAll(paymentIds, (id) => paymentsService.delete(id));
  await deleteAll(debtIds, (id) => debtsService.delete(id));
  await invoicesService.delete(invoiceId);
}

/** حذف طرف + ديونه المستقلة */
export async function cascadeDeleteDebtParty(partyId: string, snap: StoreSnapshot) {
  const debtIds = snap.standaloneDebts.filter((d) => d.partyId === partyId).map((d) => d.id);
  await deleteAll(debtIds, (id) => standaloneDebtsService.delete(id));
  await debtPartiesService.delete(partyId);
}
