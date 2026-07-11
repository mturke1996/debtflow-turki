import dayjs from "dayjs";
import { TrendingDown } from "@mui/icons-material";
import { formatCurrency } from "@/utils/calculations";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientSectionShell } from "@/components/client/ClientSectionShell";
import { LedgerRow } from "@/components/client/LedgerRow";
import type { Expense } from "@/types";

type ClientExpensesSectionProps = {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalExpenses: number;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onExportPdf: () => void;
};

export const ClientExpensesSection = ({
  open,
  onClose,
  expenses,
  searchQuery,
  onSearchChange,
  totalExpenses,
  onAdd,
  onEdit,
  onDelete,
  onExportPdf,
}: ClientExpensesSectionProps) => (
  <ClientSectionShell
    open={open}
    onClose={onClose}
    title={`المصروفات (${expenses.length})`}
    searchQuery={searchQuery}
    onSearchChange={onSearchChange}
    searchPlaceholder="ابحث في المصروفات..."
    summaryLabel="إجمالي المصروفات"
    summaryTotal={formatCurrency(totalExpenses)}
    onAdd={onAdd}
    onExportPdf={onExportPdf}
  >
    {expenses.length === 0 ? (
      <EmptyState
        icon={TrendingDown}
        title="لا توجد مصروفات"
        description="سجّل أول مصروف لبدء متابعة حساب العميل"
        actionLabel="إضافة مصروف"
        onAction={onAdd}
      />
    ) : (
      expenses.map((expense) => (
        <LedgerRow
          key={expense.id}
          title={expense.description}
          date={dayjs(expense.date).format("DD/MM/YYYY")}
          amount={formatCurrency(expense.amount)}
          badge={normalizeCategoryLabel(expense.category)}
          notes={expense.notes || undefined}
          tone="debit"
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense.id)}
        />
      ))
    )}
  </ClientSectionShell>
);
