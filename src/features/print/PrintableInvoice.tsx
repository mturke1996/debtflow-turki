import { ReactNode, forwardRef } from "react";
import { Box, Typography, Stack } from "@mui/material";
import type { Invoice, Client } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { COMPANY_INFO, PRINT_COMPANY_INFO } from "@/constants/companyInfo";

const PRIMARY = "#0f766e";

interface PrintableInvoiceProps {
  invoice: Invoice;
  client: Client;
}

function Money({ amount, bold }: { amount: number; bold?: boolean }) {
  return (
    <Typography
      component="span"
      className="money-ar font-num tabular-nums"
      fontWeight={bold ? 800 : 600}
      sx={{ fontSize: "inherit", color: "inherit" }}
    >
      {formatCurrency(amount)}
    </Typography>
  );
}

function cleanNotes(notes?: string) {
  return notes?.replace(/__TEMP_CLIENT__name:.+?__phone:.+?__/g, "").trim();
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, client }, ref) => {
    const phones = COMPANY_INFO.phones.join(" · ");
    const contactLine = [COMPANY_INFO.addressSingle, phones].filter(Boolean).join(" · ");
    const displayNotes = cleanNotes(invoice.notes);

    const isPaid = invoice.status === "paid";
    const statusLabel = isPaid
      ? "مدفوعة"
      : invoice.status === "partially_paid"
        ? "مدفوعة جزئياً"
        : "غير مدفوعة";
    const statusColor = isPaid ? "#0d9668" : "#b45309";

    return (
      <Box
        ref={ref}
        className="invoice-doc"
        sx={{
          width: "100%",
          maxWidth: "210mm",
          mx: "auto",
          bgcolor: "#fff",
          color: "#0F1A35",
          fontFamily: 'var(--font-ar, "Cairo", sans-serif)',
          overflow: "hidden",
          "@media print": {
            width: "210mm",
            minHeight: "297mm",
            "@page": { size: "A4", margin: 0 },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            px: { xs: 2, sm: 3 },
            py: { xs: 2.25, sm: 2.75 },
            background: `linear-gradient(152deg, #042f2e 0%, ${PRIMARY} 52%, #134e4a 100%)`,
            color: "#fff",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <Box
                component="img"
                src={COMPANY_INFO.logoSrc}
                alt=""
                sx={{
                  width: 52,
                  height: 52,
                  objectFit: "contain",
                  borderRadius: 1,
                  flexShrink: 0,
                  bgcolor: "rgba(255,255,255,0.12)",
                  p: 0.75,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" }, lineHeight: 1.35 }}>
                  {PRINT_COMPANY_INFO.name}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.72rem", fontWeight: 600, mt: 0.25 }}>
                  {COMPANY_INFO.tagline}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: "end", flexShrink: 0 }}>
              <Typography
                sx={{
                  display: "inline-flex",
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 1,
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                فاتورة
              </Typography>
              <Typography fontWeight={800} sx={{ fontSize: "0.95rem", mt: 0.75 }} dir="ltr" className="font-num">
                #{invoice.invoiceNumber}
              </Typography>
            </Box>
          </Stack>
          {contactLine ? (
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", fontWeight: 600, mt: 1.75 }}>
              {contactLine}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#F8F7F4", border: "1px solid rgba(15,26,53,0.08)" }}>
              <Typography sx={{ color: "#5C667D", fontSize: "0.65rem", fontWeight: 800, mb: 0.75 }}>
                فاتورة إلى
              </Typography>
              <Typography fontWeight={800} sx={{ fontSize: "0.92rem" }}>
                {client.name}
              </Typography>
              {client.address ? (
                <Typography sx={{ color: "#5C667D", fontSize: "0.75rem", mt: 0.75 }}>{client.address}</Typography>
              ) : null}
              {client.phone ? (
                <Typography sx={{ color: "#5C667D", fontSize: "0.75rem", mt: 0.5 }} dir="ltr" className="font-num">
                  {client.phone}
                </Typography>
              ) : null}
            </Box>
            <Stack spacing={1}>
              <MetaRow label="تاريخ الإصدار" value={formatDate(invoice.issueDate)} />
              <MetaRow label="تاريخ الاستحقاق" value={formatDate(invoice.dueDate)} />
              <MetaRow label="الحالة" value={statusLabel} valueColor={statusColor} />
            </Stack>
          </Box>

          <Box sx={{ borderRadius: 2, border: "1px solid rgba(15,26,53,0.08)", overflow: "hidden", mb: 2.5 }}>
            <Stack direction="row" sx={{ bgcolor: PRIMARY, color: "#fff", px: 1.5, py: 1.15 }}>
              <Typography sx={{ flex: 1, fontSize: "0.72rem", fontWeight: 800 }}>الوصف</Typography>
              <Typography sx={{ width: 48, textAlign: "center", fontSize: "0.72rem", fontWeight: 800 }}>الكمية</Typography>
              <Typography sx={{ width: 84, textAlign: "center", fontSize: "0.72rem", fontWeight: 800 }}>السعر</Typography>
              <Typography sx={{ width: 92, textAlign: "center", fontSize: "0.72rem", fontWeight: 800 }}>الإجمالي</Typography>
            </Stack>
            {invoice.items.length === 0 ? (
              <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                <Typography sx={{ color: "#5C667D", fontSize: "0.8rem" }}>لا توجد بنود بعد</Typography>
              </Box>
            ) : (
              invoice.items.map((item, index) => (
                <Stack
                  key={item.id ?? index}
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: 1.5,
                    py: 1.2,
                    bgcolor: index % 2 === 0 ? "#fff" : "#FAFAF8",
                    borderTop: index > 0 ? "1px solid rgba(15,26,53,0.06)" : "none",
                  }}
                >
                  <Typography sx={{ flex: 1, fontSize: "0.78rem", fontWeight: 600, minWidth: 0, pr: 1 }}>
                    {item.description || "—"}
                  </Typography>
                  <Typography sx={{ width: 48, textAlign: "center", fontSize: "0.78rem" }} className="font-num">
                    {item.quantity}
                  </Typography>
                  <Typography sx={{ width: 84, textAlign: "center", fontSize: "0.78rem" }}>
                    <Money amount={item.unitPrice} />
                  </Typography>
                  <Typography sx={{ width: 92, textAlign: "center", fontSize: "0.78rem" }}>
                    <Money amount={item.total} bold />
                  </Typography>
                </Stack>
              ))
            )}
          </Box>

          <Stack alignItems={{ xs: "stretch", sm: "flex-start" }} sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 340,
                ms: { sm: "auto" },
                p: 2,
                borderRadius: 2,
                bgcolor: "#F8F7F4",
                border: "1px solid rgba(15,26,53,0.08)",
              }}
            >
              <Stack spacing={1.1}>
                <TotalRow label="المجموع الفرعي" value={<Money amount={invoice.subtotal} />} />
                {invoice.taxAmount > 0 ? (
                  <TotalRow label={`الضريبة (${invoice.taxRate}%)`} value={<Money amount={invoice.taxAmount} />} />
                ) : null}
                <Box sx={{ height: "1px", bgcolor: "rgba(15,26,53,0.1)", my: 0.25 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography fontWeight={800}>الإجمالي</Typography>
                  <Typography fontWeight={900} sx={{ color: PRIMARY, fontSize: "1.15rem" }}>
                    <Money amount={invoice.total} bold />
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {displayNotes ? (
            <Box sx={{ p: 2, borderRadius: 2, borderInlineStart: `3px solid ${PRIMARY}`, bgcolor: "#F8F7F4", mb: 2 }}>
              <Typography sx={{ color: "#5C667D", fontSize: "0.68rem", fontWeight: 800, mb: 0.75 }}>
                ملاحظات
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.65 }}>{displayNotes}</Typography>
            </Box>
          ) : null}

          <Box sx={{ textAlign: "center", pt: 2, borderTop: "1px solid rgba(15,26,53,0.08)" }}>
            <Typography fontWeight={800} sx={{ color: PRIMARY, fontSize: "0.78rem" }}>
              {PRINT_COMPANY_INFO.name}
            </Typography>
            {contactLine ? (
              <Typography sx={{ color: "#5C667D", fontSize: "0.68rem", mt: 0.5 }}>{contactLine}</Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";

function MetaRow({ label, value, valueColor }: { label: string; value: ReactNode; valueColor?: string }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: "#F8F7F4", border: "1px solid rgba(15,26,53,0.06)" }}
    >
      <Typography sx={{ color: "#5C667D", fontSize: "0.72rem", fontWeight: 600 }}>{label}</Typography>
      <Typography fontWeight={800} sx={{ fontSize: "0.75rem", color: valueColor || "#0F1A35" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function TotalRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography sx={{ color: "#5C667D", fontSize: "0.8rem" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.82rem" }}>{value}</Typography>
    </Stack>
  );
}

export function InvoicePreviewFrame({
  label = "معاينة الفاتورة",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "var(--shadow-soft)",
        "@media print": { border: 0, boxShadow: "none" },
      }}
    >
      <Box
        className="no-print"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "var(--panel-muted)",
        }}
      >
        <Typography variant="caption" fontWeight={800} color="text.secondary">
          {label}
        </Typography>
        <span className="chip-sharp" style={{ padding: "2px 8px", fontSize: "0.6rem", fontWeight: 700 }}>
          A4
        </span>
      </Box>
      <Box sx={{ maxHeight: { xs: "70vh", sm: "none" }, overflow: { xs: "auto", sm: "visible" } }}>
        {children}
      </Box>
    </Box>
  );
}
