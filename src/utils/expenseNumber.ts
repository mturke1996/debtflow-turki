import type { Expense } from "@/types";

/** توليد رقم مصروف تسلسلي: EXP-0001, EXP-0002, ... */
export function getNextExpenseNumber(expenses: Expense[]): string {
  const maxNumber = expenses.reduce((max, expense) => {
    if (!expense.expenseNumber) return max;
    const match = expense.expenseNumber.match(/EXP-(\d+)/);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);
  return `EXP-${String(maxNumber + 1).padStart(4, "0")}`;
}
