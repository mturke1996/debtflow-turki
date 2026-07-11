import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import {
  People,
  Payment,
  TrendingUp,
  Receipt,
  AccountBalance,
  ReceiptLong,
  TrendingDown,
  ExpandMore,
  Insights,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { useDataStore } from "@/store/useDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateFinancialSummary, formatCurrency } from "@/utils/calculations";
import { CompanyHero } from "@/components/ui/CompanyHero";
import { KpiCard } from "@/components/ui/KpiCard";
import { ShortcutTile } from "@/components/ui/ShortcutTile";
import { HomeLedgerGlance } from "@/components/charts/HomeLedgerGlance";

dayjs.locale("ar");

export const HomePage = () => {
  const navigate = useNavigate();
  const { payments, clients, expenses, invoices, standaloneDebts } = useDataStore();
  const { user } = useAuthStore();
  const [ledgerOpen, setLedgerOpen] = useState(false);

  const summary = useMemo(
    () => calculateFinancialSummary(invoices, payments, standaloneDebts),
    [invoices, payments, standaloneDebts]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const collectedThisMonth = useMemo(() => {
    const start = dayjs().startOf("month");
    return payments
      .filter((p) => dayjs(p.paymentDate).isAfter(start) || dayjs(p.paymentDate).isSame(start, "day"))
      .reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  const userName = user?.displayName || user?.email.split("@")[0];
  const today = dayjs().format("dddd، D MMMM");

  const shortcuts = [
    { title: "العملاء", subtitle: `${clients.length} عميل`, icon: People, path: "/clients", tone: "primary" as const },
    { title: "المصروفات", subtitle: `${expenses.length} مصروف`, icon: TrendingDown, path: "/expenses", tone: "warning" as const },
    { title: "الفواتير", subtitle: `${invoices.length} فاتورة`, icon: Receipt, path: "/invoices", tone: "primary" as const },
    { title: "المدفوعات", subtitle: formatCurrency(collectedThisMonth), icon: Payment, path: "/payments", tone: "success" as const },
    { title: "الديون", subtitle: formatCurrency(summary.totalRemaining), icon: AccountBalance, path: "/debts", tone: "warning" as const },
    { title: "فواتير المصروفات", subtitle: "إغلاق وترحيل", icon: ReceiptLong, path: "/expense-invoices", tone: "neutral" as const },
  ];

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
      <CompanyHero greeting={`مرحباً ${userName} · ${today}`} />

      <Box
        sx={{
          display: "grid",
          gap: 1.35,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        }}
      >
        <KpiCard tone="success" icon={TrendingUp} label="المحصل" value={formatCurrency(summary.totalPaid)} />
        <KpiCard tone="error" icon={TrendingDown} label="إجمالي المصروفات" value={formatCurrency(totalExpenses)} />
        <KpiCard tone="warning" icon={AccountBalance} label="إجمالي الديون" value={formatCurrency(summary.totalRemaining)} />
        <KpiCard tone="primary" icon={Payment} label="تحصيل الشهر" value={formatCurrency(collectedThisMonth)} />
      </Box>

      <Accordion
        expanded={ledgerOpen}
        onChange={(_, open) => setLedgerOpen(open)}
        elevation={0}
        disableGutters
        sx={{
          borderRadius: "12px !important",
          border: "1px solid var(--line)",
          bgcolor: "background.paper",
          boxShadow: "var(--shadow-hairline)",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            minHeight: 52,
            px: 2,
            "& .MuiAccordionSummary-content": { my: 1.25 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                display: "grid",
                placeItems: "center",
                bgcolor: "var(--accent-soft)",
                color: "var(--accent-text)",
              }}
            >
              <Insights sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                نظرة دفترية
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ledgerOpen ? "اضغط للإخفاء" : "اختياري · اضغط للعرض"}
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
          <HomeLedgerGlance
            payments={payments}
            expenses={expenses}
            totalPaid={summary.totalPaid}
            totalRemaining={summary.totalRemaining}
          />
        </AccordionDetails>
      </Accordion>

      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "text.secondary",
            mb: 1.25,
            px: 0.25,
          }}
        >
          الوصول السريع
        </Typography>
        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
          {shortcuts.map((item) => (
            <ShortcutTile
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              tone={item.tone}
              onClick={() => navigate(item.path)}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
};
