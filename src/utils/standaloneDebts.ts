import type { StandaloneDebt } from '@/types';

/** إجماليات الديون من قسم «الديون» فقط — لا تشمل ديون الفواتير */
export function calculateStandaloneDebtTotals(standaloneDebts: StandaloneDebt[]) {
  const active = standaloneDebts.filter((d) => d.status !== 'paid');
  const totalRemaining = active.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalAmount = standaloneDebts.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = standaloneDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  return { totalRemaining, totalAmount, totalPaid, count: standaloneDebts.length };
}
