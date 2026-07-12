import dayjs from "dayjs";
import { Payment } from "@mui/icons-material";
import { formatCurrency } from "@/utils/calculations";
import { paymentMethods } from "@/utils/formatters";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientSectionShell } from "@/components/client/ClientSectionShell";
import { LedgerRow } from "@/components/client/LedgerRow";
import type { Payment as PaymentType } from "@/types";

type ClientPaymentsSectionProps = {
  open: boolean;
  onClose: () => void;
  payments: PaymentType[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalPaid: number;
  onAdd: () => void;
  onEdit: (payment: PaymentType) => void;
  onDelete: (id: string) => void;
  onExportPdf: () => void;
};

const payLabel = (method: PaymentType["paymentMethod"]) =>
  paymentMethods[method as keyof typeof paymentMethods] ?? method;

export const ClientPaymentsSection = ({
  open,
  onClose,
  payments,
  searchQuery,
  onSearchChange,
  totalPaid,
  onAdd,
  onEdit,
  onDelete,
  onExportPdf,
}: ClientPaymentsSectionProps) => (
  <ClientSectionShell
    open={open}
    onClose={onClose}
    title={`المدفوعات (${payments.length})`}
    searchQuery={searchQuery}
    onSearchChange={onSearchChange}
    searchPlaceholder="ابحث في المدفوعات..."
    summaryLabel="إجمالي المدفوعات"
    summaryTotal={formatCurrency(totalPaid)}
    onAdd={onAdd}
    addLabel="دفعة"
    onExportPdf={onExportPdf}
  >
    {payments.length === 0 ? (
      <EmptyState
        icon={Payment}
        title="لا توجد مدفوعات"
        description="سجّل أول دفعة لتحديث رصيد العميل"
        actionLabel="إضافة دفعة"
        onAction={onAdd}
      />
    ) : (
      payments.map((payment) => (
        <LedgerRow
          key={payment.id}
          title={payLabel(payment.paymentMethod)}
          date={dayjs(payment.paymentDate).format("DD/MM/YYYY")}
          amount={formatCurrency(payment.amount)}
          notes={payment.notes || undefined}
          tone="credit"
          onEdit={() => onEdit(payment)}
          onDelete={() => onDelete(payment.id)}
        />
      ))
    )}
  </ClientSectionShell>
);
