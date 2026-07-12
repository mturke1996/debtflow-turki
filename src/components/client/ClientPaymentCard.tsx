import { CalendarToday, Receipt } from "@mui/icons-material";
import type { Payment } from "@/types";
import { RowActionBar, RowActionButton } from "@/components/ui/ActionButtons";

type ClientPaymentCardProps = {
  payment: Payment;
  methodLabel: string;
  invoiceNumber?: string;
  amountLabel: string;
  dateLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function ClientPaymentCard({
  payment,
  methodLabel,
  invoiceNumber,
  amountLabel,
  dateLabel,
  onEdit,
  onDelete,
}: ClientPaymentCardProps) {
  return (
    <article className="ledger-card ledger-card--credit">
      <div className="ledger-card__main">
        <div className="ledger-card__avatar ledger-card__avatar--credit" aria-hidden>
          ✓
        </div>
        <div className="ledger-card__body">
          <div className="ledger-card__header">
            <h3 className="ledger-card__title">{methodLabel}</h3>
            <span className="ledger-card__amount num ledger-card__amount--credit">{amountLabel}</span>
          </div>
          <div className="ledger-card__meta">
            <span className="ledger-card__meta-item">
              <CalendarToday sx={{ fontSize: 13 }} />
              {dateLabel}
            </span>
            {invoiceNumber ? (
              <span className="ledger-card__meta-item ledger-card__meta-item--muted">
                <Receipt sx={{ fontSize: 13 }} />
                #{invoiceNumber}
              </span>
            ) : null}
          </div>
          {payment.notes ? <p className="ledger-card__notes">{payment.notes}</p> : null}
        </div>
      </div>
      <RowActionBar>
        <RowActionButton variant="edit" onClick={onEdit} />
        <RowActionButton variant="delete" onClick={onDelete} />
      </RowActionBar>
    </article>
  );
}
