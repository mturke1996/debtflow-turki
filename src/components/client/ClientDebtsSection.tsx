import { CreditCard } from "@mui/icons-material";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientSectionShell } from "@/components/client/ClientSectionShell";
import { DebtPartyRow, type PartyWithStats } from "@/components/client/DebtPartyRow";
import { formatCurrency } from "@/utils/calculations";

type ClientDebtsSectionProps = {
  open: boolean;
  onClose: () => void;
  parties: PartyWithStats[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalRemaining: number;
  onAdd: () => void;
  onOpenParty: (party: PartyWithStats) => void;
};

export const ClientDebtsSection = ({
  open,
  onClose,
  parties,
  searchQuery,
  onSearchChange,
  totalRemaining,
  onAdd,
  onOpenParty,
}: ClientDebtsSectionProps) => (
  <ClientSectionShell
    open={open}
    onClose={onClose}
    title={`الديون (${parties.length})`}
    searchQuery={searchQuery}
    onSearchChange={onSearchChange}
    searchPlaceholder="ابحث في الأطراف..."
    summaryLabel="إجمالي المتبقي"
    summaryTotal={formatCurrency(totalRemaining)}
    onAdd={onAdd}
    addLabel="طرف جديد"
  >
    {parties.length === 0 ? (
      <EmptyState
        icon={CreditCard}
        title="لا توجد ديون"
        description="أضف طرفاً أو ديناً لمتابعة الالتزامات"
        actionLabel="إضافة دين"
        onAction={onAdd}
      />
    ) : (
      parties.map((party, i) => (
        <DebtPartyRow
          key={`${party.type}_${party.name}_${i}`}
          party={party}
          onClick={() => onOpenParty(party)}
        />
      ))
    )}
  </ClientSectionShell>
);
