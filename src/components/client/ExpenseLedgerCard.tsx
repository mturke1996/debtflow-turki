import { CalendarToday } from "@mui/icons-material";
import type { Expense } from "@/types";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import { ExpenseQuantityChip } from "@/components/expense/ExpenseQuantityBlock";
import { RowActionBar, RowActionButton } from "@/components/ui/ActionButtons";

type ExpenseLedgerCardProps = {
  expense: Expense;
  dateLabel: string;
  amountLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

function descInitial(description: string) {
  const t = description.trim();
  return t ? t.charAt(0) : "—";
}

export function ExpenseLedgerCard({
  expense,
  dateLabel,
  amountLabel,
  onEdit,
  onDelete,
}: ExpenseLedgerCardProps) {
  const category = normalizeCategoryLabel(expense.category);
  const note =
    [expense.supplierInvoiceNumber ? `#${expense.supplierInvoiceNumber}` : "", expense.notes]
      .filter(Boolean)
      .join(" · ") || undefined;

  return (
    <article className="ledger-card ledger-card--debit">
      <div className="ledger-card__main">
        <div className="ledger-card__avatar ledger-card__avatar--debit" aria-hidden>
          {descInitial(expense.description)}
        </div>
        <div className="ledger-card__body">
          <div className="ledger-card__header">
            <h3 className="ledger-card__title">{expense.description}</h3>
            <span className="ledger-card__amount num ledger-card__amount--debit">{amountLabel}</span>
          </div>
          <div className="ledger-card__meta">
            <span className="ledger-card__meta-item">
              <CalendarToday sx={{ fontSize: 13 }} />
              {dateLabel}
            </span>
            {category ? <span className="ledger-card__badge ledger-card__badge--muted">{category}</span> : null}
          </div>
          {note ? <p className="ledger-card__notes">{note}</p> : null}
          <ExpenseQuantityChip
            quantity={expense.quantity}
            unit={expense.unit}
            unitPrice={expense.unitPrice}
            amount={expense.amount}
          />
        </div>
      </div>
      <RowActionBar>
        <RowActionButton variant="edit" onClick={onEdit} />
        <RowActionButton variant="delete" onClick={onDelete} />
      </RowActionBar>
    </article>
  );
}
