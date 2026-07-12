import { CalendarToday } from "@mui/icons-material";
import type { ReactNode } from "react";
import { RowActionBar, RowActionButton } from "@/components/ui/ActionButtons";

type LedgerRowTone = "debit" | "credit" | "neutral";

type LedgerRowProps = {
  title: string;
  date: string;
  amount: string;
  badge?: string;
  notes?: string;
  tone?: LedgerRowTone;
  onEdit: () => void;
  onDelete: () => void;
  extra?: ReactNode;
};

const toneClass = {
  debit: "ledger-card--debit",
  credit: "ledger-card--credit",
  neutral: "",
} as const;

const amountClass = {
  debit: "ledger-card__amount--debit",
  credit: "ledger-card__amount--credit",
  neutral: "",
} as const;

function rowInitial(title: string) {
  const t = title.trim();
  return t ? t.charAt(0) : "—";
}

export const LedgerRow = ({
  title,
  date,
  amount,
  badge,
  notes,
  tone = "neutral",
  onEdit,
  onDelete,
  extra,
}: LedgerRowProps) => (
  <article className={`ledger-card client-ledger-row ${toneClass[tone]}`}>
    <div className="ledger-card__main">
      <div className={`ledger-card__avatar ledger-card__avatar--${tone}`} aria-hidden>
        {rowInitial(title)}
      </div>

      <div className="ledger-card__body">
        <div className="ledger-card__header">
          <h3 className="ledger-card__title">{title}</h3>
          <span className={`ledger-card__amount num ${amountClass[tone]}`}>{amount}</span>
        </div>

        <div className="ledger-card__meta">
          <span className="ledger-card__meta-item">
            <CalendarToday sx={{ fontSize: 13 }} />
            {date}
          </span>
          {badge ? <span className="ledger-card__badge">{badge}</span> : null}
        </div>

        {notes ? <p className="ledger-card__notes">{notes}</p> : null}
        {extra ? <div className="ledger-card__extra">{extra}</div> : null}
      </div>
    </div>

    <RowActionBar>
      <RowActionButton variant="edit" onClick={onEdit} />
      <RowActionButton variant="delete" onClick={onDelete} />
    </RowActionBar>
  </article>
);
