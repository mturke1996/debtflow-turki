import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Description, Receipt } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import { useDataStore } from "@/store/useDataStore";
import { formatDate, formatCurrency, getStatusLabel, getInvoiceStatusStyle } from "@/utils/formatters";
import { PageHero } from "@/components/ui/PageHero";
import { HeroCtaButton, FilterChip, RowActionBar, RowActionButton } from "@/components/ui/ActionButtons";
import toast from "react-hot-toast";

const FILTER_TABS = [
  { id: "all", label: "الكل" },
  { id: "paid", label: "مدفوعة" },
  { id: "partially_paid", label: "جزئية" },
  { id: "draft", label: "مسودة" },
  { id: "overdue", label: "متأخرة" },
] as const;

function getClientName(invoice: { clientId: string; tempClientName?: string; notes?: string }, clients: { id: string; name: string }[]) {
  const client = clients.find((c) => c.id === invoice.clientId);
  if (client) return client.name;
  if (invoice.tempClientName) return invoice.tempClientName;
  if (invoice.notes) {
    const match = invoice.notes.match(/__TEMP_CLIENT__name:(.+?)__phone:(.+?)__/);
    if (match) return match[1].trim();
  }
  return "عميل غير معروف";
}

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const { invoices, clients, deleteInvoice } = useDataStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return invoices.filter((inv) => {
      const clientName = getClientName(inv, clients);
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) || clientName.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, clients, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + inv.total, 0);
    return { total, paid, pending: total - paid };
  }, [invoices]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 32 }}>
      <PageHero
        accent="amber"
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Receipt sx={{ fontSize: 14 }} />
            الفواتير
          </span>
        }
        title={`${invoices.length} فاتورة`}
        subtitle={
          <>
            إجمالي مفوتر:{" "}
            <span className="num" style={{ fontWeight: 800 }}>
              {formatCurrency(stats.total)}
            </span>
          </>
        }
        trailing={<HeroCtaButton onClick={() => navigate("/invoices/new")}>إنشاء فاتورة</HeroCtaButton>}
        footerStats={[
          { label: "المفوتر", value: formatCurrency(stats.total) },
          { label: "المحصّل", value: formatCurrency(stats.paid), valueClassName: "hero-stat-value--gold" },
          { label: "المستحق", value: formatCurrency(stats.pending), valueClassName: "hero-stat-value--gold" },
        ]}
      />

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="بحث برقم الفاتورة أو اسم العميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "var(--ink-faint)" }} />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "var(--panel)" } }}
        />
          <div className="filter-scroll">
            {FILTER_TABS.map((tab) => (
              <FilterChip
                key={tab.id}
                label={tab.label}
                active={filterStatus === tab.id}
                onClick={() => setFilterStatus(tab.id)}
              />
            ))}
          </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="widget-tile" style={{ padding: "40px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--line)",
              }}
            >
              <Description sx={{ fontSize: 28 }} />
            </div>
            <div style={{ fontWeight: 700, color: "var(--ink)" }}>لا توجد فواتير</div>
            <div style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--ink-muted)" }}>
              {searchQuery || filterStatus !== "all"
                ? "لا توجد فواتير مطابقة لهذا الفلتر."
                : "ابدأ بإنشاء أول فاتورة."}
            </div>
              {!searchQuery && filterStatus === "all" ? (
                <div style={{ marginTop: 16 }}>
                  <HeroCtaButton onClick={() => navigate("/invoices/new")}>إنشاء فاتورة</HeroCtaButton>
                </div>
              ) : null}
          </div>
        ) : (
          filtered.map((inv) => {
            const chip = getInvoiceStatusStyle(inv.status);
            const clientName = getClientName(inv, clients);
            return (
              <div
                key={inv.id}
                className="widget-tile"
                style={{
                  padding: "16px",
                  borderInlineEndWidth: 3,
                  borderInlineEndColor: chip.border,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      #{inv.invoiceNumber}
                    </div>
                    <div style={{ marginTop: 4, fontSize: "0.7rem", color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {clientName} · {formatDate(inv.issueDate)}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "start" }}>
                    <div className="num" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--accent-text)" }}>
                      {formatCurrency(inv.total)}
                    </div>
                    <span className="status-badge" style={{ marginTop: 4, background: chip.bg, color: chip.color }}>
                      {getStatusLabel(inv.status)}
                    </span>
                  </div>
                </div>

                <RowActionBar>
                  <RowActionButton variant="view" onClick={() => navigate(`/invoices/${inv.id}`)} />
                  <RowActionButton variant="edit" onClick={() => navigate(`/invoices/new?edit=${inv.id}`)} />
                  <RowActionButton
                    variant="delete"
                    onClick={async () => {
                      if (!window.confirm(`هل أنت متأكد من حذف الفاتورة #${inv.invoiceNumber}؟`)) return;
                      const toastId = toast.loading("جاري الحذف...");
                      try {
                        await deleteInvoice(inv.id);
                        toast.success("تم الحذف", { id: toastId });
                      } catch {
                        toast.error("تعذّر الحذف", { id: toastId });
                      }
                    }}
                  />
                </RowActionBar>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
