import { useMemo } from "react";
import {
  Add,
  ArrowForward,
  CalendarToday,
  DeleteOutline,
  Edit,
  Payment,
  PictureAsPdf,
  Search,
  TrendingDown,
} from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { FullScreenPortal } from "@/components/ui/FullScreenPortal";
import { ExpenseQuantityChip } from "@/components/expense/ExpenseQuantityBlock";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import { formatCurrency } from "@/utils/calculations";
import { paymentMethods } from "@/utils/formatters";
import type { Expense, Payment as PaymentType } from "@/types";

export type ClientLedgerVariant = "expenses" | "payments";

type ClientLedgerScreenProps = {
  open: boolean;
  variant: ClientLedgerVariant;
  clientName: string;
  onBack: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalAmount: number;
  items: Expense[] | PaymentType[];
  allCount: number;
  invoices?: { id: string; invoiceNumber: string }[];
  onAdd: () => void;
  onExportPdf: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onEditPayment?: (payment: PaymentType) => void;
  onDeletePayment?: (id: string) => void;
};

export function ClientLedgerScreen({
  open,
  variant,
  clientName,
  onBack,
  searchQuery,
  onSearchChange,
  totalAmount,
  items,
  allCount,
  invoices = [],
  onAdd,
  onExportPdf,
  onEditExpense,
  onDeleteExpense,
  onEditPayment,
  onDeletePayment,
}: ClientLedgerScreenProps) {
  const isExpenses = variant === "expenses";
  const Icon = isExpenses ? TrendingDown : Payment;
  const tone = isExpenses ? "debit" : "credit";
  const count = items.length;

  const serialById = useMemo(() => {
    if (!isExpenses) return new Map<string, number>();
    const oldestFirst = [...(items as Expense[])].sort((a, b) => {
      const byCreated = dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      if (byCreated !== 0) return byCreated;
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });
    return new Map(oldestFirst.map((e, i) => [e.id, i + 1]));
  }, [isExpenses, items]);

  return (
    <FullScreenPortal open={open} className="profile-sheet">
      <header className={`profile-sheet__header profile-sheet__header--${tone}`}>
        <div className="profile-sheet__top">
          <IconButton
            onClick={onBack}
            aria-label="رجوع"
            className="profile-sheet__back"
            size="small"
          >
            <ArrowForward sx={{ fontSize: 20, color: "#fff" }} />
          </IconButton>
          <div className="profile-sheet__titles">
            <p className="profile-sheet__title">{isExpenses ? "المصروفات" : "المدفوعات"}</p>
            <p className="profile-sheet__subtitle">{clientName}</p>
          </div>
          <button type="button" className="profile-sheet__add" onClick={onAdd}>
            <Add sx={{ fontSize: 15 }} />
            {isExpenses ? "جديد" : "دفعة"}
          </button>
        </div>

        <div className="profile-sheet__hero">
          <div className="profile-sheet__hero-icon" aria-hidden>
            <Icon sx={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div className="profile-sheet__hero-main">
            <p className="profile-sheet__hero-eyebrow">
              {isExpenses ? "إجمالي المصروفات" : "إجمالي المحصّل"}
            </p>
            <p className="profile-sheet__hero-value num">{formatCurrency(totalAmount)}</p>
            <p className="profile-sheet__hero-sub">
              {allCount} {isExpenses ? "مصروف" : "دفعة"}
            </p>
          </div>
          <div className="profile-sheet__hero-stats">
            <div className="profile-sheet__stat">
              <span>الكل</span>
              <strong className="num">{allCount}</strong>
            </div>
            <div className="profile-sheet__stat">
              <span>بعد البحث</span>
              <strong className="num">{count}</strong>
            </div>
          </div>
        </div>

        {allCount > 0 ? (
          <button type="button" className="profile-sheet__pdf" onClick={onExportPdf}>
            <PictureAsPdf sx={{ fontSize: 14 }} />
            تصدير PDF
          </button>
        ) : null}
      </header>

      <div className="profile-sheet__body">
        <div className="profile-sheet__search">
          <TextField
            fullWidth
            size="small"
            placeholder={
              isExpenses ? "وصف، تصنيف، ملاحظات…" : "مبلغ، طريقة دفع، ملاحظات…"
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "var(--ink-faint)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "var(--panel)",
              },
            }}
          />
        </div>

        <div className="profile-sheet__content">
          {count === 0 ? (
            <div className="profile-sheet__empty">
              <div
                className={`profile-sheet__empty-icon profile-sheet__empty-icon--${tone}`}
              >
                <Icon sx={{ fontSize: 28 }} />
              </div>
              <Typography fontWeight={800}>
                {isExpenses ? "لا توجد مصروفات" : "لا توجد مدفوعات"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {searchQuery
                  ? "لا نتائج مطابقة"
                  : isExpenses
                    ? "أضف أول مصروف"
                    : "أضف أول دفعة"}
              </Typography>
              {!searchQuery ? (
                <button type="button" className="profile-sheet__empty-cta" onClick={onAdd}>
                  <Add sx={{ fontSize: 16 }} />
                  {isExpenses ? "مصروف جديد" : "دفعة جديدة"}
                </button>
              ) : null}
            </div>
          ) : (
            <ul className={`profile-ledger profile-ledger--${tone}`}>
              {isExpenses
                ? (items as Expense[]).map((expense) => {
                    const serial = serialById.get(expense.id) ?? 0;
                    const category = normalizeCategoryLabel(expense.category);
                    return (
                      <li key={expense.id} className="profile-ledger__row">
                        <div className="profile-ledger__serial num">
                          {String(serial).padStart(2, "0")}
                        </div>
                        <div className="profile-ledger__body">
                          <div className="profile-ledger__line">
                            <div className="profile-ledger__info">
                              <p className="profile-ledger__title">{expense.description}</p>
                              <div className="profile-ledger__meta">
                                <span>
                                  <CalendarToday sx={{ fontSize: 11 }} />
                                  {dayjs(expense.date).format("DD/MM/YYYY")}
                                </span>
                                {category ? (
                                  <span className="profile-ledger__chip">{category}</span>
                                ) : null}
                              </div>
                              {expense.notes || expense.supplierInvoiceNumber ? (
                                <p className="profile-ledger__notes">
                                  {[
                                    expense.supplierInvoiceNumber
                                      ? `#${expense.supplierInvoiceNumber}`
                                      : "",
                                    expense.notes,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              ) : null}
                              <ExpenseQuantityChip
                                quantity={expense.quantity}
                                unit={expense.unit}
                                unitPrice={expense.unitPrice}
                                amount={expense.amount}
                              />
                            </div>
                            <div className="profile-ledger__aside">
                              <div className="profile-ledger__amount num">
                                {formatCurrency(expense.amount)}
                              </div>
                              <div className="profile-ledger__actions">
                                <button
                                  type="button"
                                  aria-label="تعديل"
                                  onClick={() => onEditExpense?.(expense)}
                                >
                                  <Edit sx={{ fontSize: 16 }} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="حذف"
                                  className="is-danger"
                                  onClick={() => onDeleteExpense?.(expense.id)}
                                >
                                  <DeleteOutline sx={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                : (items as PaymentType[]).map((payment, idx) => {
                    const invoice = invoices.find((i) => i.id === payment.invoiceId);
                    const methodLabel =
                      paymentMethods[payment.paymentMethod as keyof typeof paymentMethods] ??
                      payment.paymentMethod;
                    return (
                      <li key={payment.id} className="profile-ledger__row">
                        <div className="profile-ledger__serial num">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="profile-ledger__body">
                          <div className="profile-ledger__line">
                            <div className="profile-ledger__info">
                              <p className="profile-ledger__title">{methodLabel}</p>
                              <div className="profile-ledger__meta">
                                <span>
                                  <CalendarToday sx={{ fontSize: 11 }} />
                                  {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                                </span>
                                {invoice ? (
                                  <span className="profile-ledger__chip">
                                    #{invoice.invoiceNumber}
                                  </span>
                                ) : null}
                              </div>
                              {payment.notes ? (
                                <p className="profile-ledger__notes">{payment.notes}</p>
                              ) : null}
                            </div>
                            <div className="profile-ledger__aside">
                              <div className="profile-ledger__amount num">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="profile-ledger__actions">
                                <button
                                  type="button"
                                  aria-label="تعديل"
                                  onClick={() => onEditPayment?.(payment)}
                                >
                                  <Edit sx={{ fontSize: 16 }} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="حذف"
                                  className="is-danger"
                                  onClick={() => onDeletePayment?.(payment.id)}
                                >
                                  <DeleteOutline sx={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
            </ul>
          )}
        </div>
      </div>
    </FullScreenPortal>
  );
}
