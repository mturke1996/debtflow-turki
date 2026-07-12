import { CalendarToday, Receipt } from "@mui/icons-material";
import type { Payment } from "@/types";
import { RowActionBar, RowActionButton } from "@/components/ui/ActionButtons";

type PaymentLedgerCardProps = {
  clientName: string;
  payment: Payment;
  methodLabel: string;
  invoiceNumber?: string;
  amountLabel: string;
  dateLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

function clientInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : "؟";
}

export function PaymentLedgerCard({
  clientName,
  payment,
  methodLabel,
  invoiceNumber,
  amountLabel,
  dateLabel,
  onEdit,
  onDelete,
}: PaymentLedgerCardProps) {
  return (
    <article className="ledger-card ledger-card--credit">
      <div className="ledger-card__main">
        <div className="ledger-card__avatar" aria-hidden>
          {clientInitial(clientName)}
        </div>

        <div className="ledger-card__body">
          <div className="ledger-card__header">
            <h3 className="ledger-card__title">{clientName}</h3>
            <span className="ledger-card__amount num">{amountLabel}</span>
          </div>

          <div className="ledger-card__meta">
            <span className="ledger-card__meta-item">
              <CalendarToday sx={{ fontSize: 13 }} />
              {dateLabel}
            </span>
            <span className="ledger-card__badge">{methodLabel}</span>
            {invoiceNumber ? (
              <span className="ledger-card__meta-item ledger-card__meta-item--muted">
                <Receipt sx={{ fontSize: 13 }} />
                #{invoiceNumber}
              </span>
            ) : null}
          </div>

          {payment.notes ? (
            <p className="ledger-card__notes">{payment.notes}</p>
          ) : null}
        </div>
      </div>

      <RowActionBar>
        <RowActionButton variant="edit" onClick={onEdit} />
        <RowActionButton variant="delete" onClick={onDelete} />
      </RowActionBar>
    </article>
  );
}
