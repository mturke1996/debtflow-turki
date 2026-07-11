import { useMemo, type ReactNode } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { formatCurrency } from "@/utils/calculations";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import type { Expense, Payment } from "@/types";

dayjs.locale("ar");

type HomeLedgerGlanceProps = {
  payments: Payment[];
  expenses: Expense[];
  totalPaid: number;
  totalRemaining: number;
};

const Panel = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: "12px",
        border: "1px solid var(--line)",
        bgcolor: isDark ? "var(--panel)" : "#fff",
        boxShadow: "var(--shadow-hairline)",
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {children}
    </Box>
  );
};

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h3"
    sx={{
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: "text.secondary",
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
);

export const HomeLedgerGlance = ({
  payments,
  expenses,
  totalPaid,
  totalRemaining,
}: HomeLedgerGlanceProps) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const muted = theme.palette.secondary.main;

  const months = useMemo(() => {
    const rows: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, "month");
      rows.push({ key: m.format("YYYY-MM"), label: m.format("MMM"), total: 0 });
    }
    for (const p of payments) {
      const key = dayjs(p.paymentDate).format("YYYY-MM");
      const row = rows.find((r) => r.key === key);
      if (row) row.total += p.amount;
    }
    return rows;
  }, [payments]);

  const maxMonth = Math.max(...months.map((m) => m.total), 1);
  const hasMonthData = months.some((m) => m.total > 0);
  const periodTotal = months.reduce((s, m) => s + m.total, 0);

  const compositionTotal = totalPaid + totalRemaining;
  const paidShare = compositionTotal > 0 ? (totalPaid / compositionTotal) * 100 : 0;
  const remainShare = compositionTotal > 0 ? (totalRemaining / compositionTotal) * 100 : 0;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      const cat = normalizeCategoryLabel(exp.category);
      map.set(cat, (map.get(cat) || 0) + exp.amount);
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const catMax = Math.max(...categories.map((c) => c.amount), 1);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "1fr", md: "1.35fr 1fr" },
        gridTemplateRows: { md: "auto auto" },
      }}
    >
      {/* Monthly collection — primary visual */}
      <Box sx={{ gridColumn: { md: "1 / 2" }, gridRow: { md: "1 / 3" } }}>
        <Panel>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
            <SectionLabel>التحصيل · 6 أشهر</SectionLabel>
            {hasMonthData && (
              <Typography className="num" sx={{ fontSize: "0.85rem", fontWeight: 800 }}>
                {formatCurrency(periodTotal)}
              </Typography>
            )}
          </Box>

          {!hasMonthData ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                لا توجد مدفوعات بعد
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 1,
                height: { xs: 168, md: 220 },
                mt: 1,
              }}
            >
              {months.map((m) => {
                const h = Math.max((m.total / maxMonth) * 100, m.total > 0 ? 6 : 2);
                return (
                  <Box
                    key={m.key}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography
                      className="num"
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        opacity: m.total > 0 ? 1 : 0,
                        lineHeight: 1,
                      }}
                    >
                      {m.total >= 1000 ? `${Math.round(m.total / 1000)}k` : m.total > 0 ? m.total : ""}
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 36,
                        height: `${h}%`,
                        borderRadius: "4px 4px 2px 2px",
                        bgcolor: m.total > 0 ? accent : "var(--line)",
                        transition: "height 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        lineHeight: 1,
                      }}
                    >
                      {m.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Panel>
      </Box>

      {/* Composition split */}
      <Panel>
        <SectionLabel>التحصيل والديون</SectionLabel>
        {compositionTotal <= 0 ? (
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ py: 2 }}>
            لا توجد بيانات
          </Typography>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                height: 10,
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "var(--panel-muted)",
                mb: 2,
              }}
            >
              {paidShare > 0 && (
                <Box sx={{ width: `${paidShare}%`, bgcolor: "var(--pastel-green-fg)", transition: "width 0.55s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              )}
              {remainShare > 0 && (
                <Box sx={{ width: `${remainShare}%`, bgcolor: accent, transition: "width 0.55s cubic-bezier(0.16, 1, 0.3, 1)" }} />
              )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {[
                { label: "ما تم تحصيله", value: totalPaid, share: paidShare, color: "var(--pastel-green-fg)" },
                { label: "ديون لم تُسدَّد", value: totalRemaining, share: remainShare, color: accent },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: row.color }} />
                    <Typography variant="body2" fontWeight={700}>
                      {row.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography className="num" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary" }}>
                      {row.share.toFixed(0)}%
                    </Typography>
                    <Typography className="num" variant="body2" fontWeight={800}>
                      {formatCurrency(row.value)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            {totalRemaining <= 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1.5, lineHeight: 1.5 }}
              >
                لا توجد ديون مفتوحة في قسم الديون
              </Typography>
            )}
          </Box>
        )}
      </Panel>

      {/* Expense categories */}
      <Panel>
        <SectionLabel>مصروفات حسب الفئة</SectionLabel>
        {categories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ py: 2 }}>
            لا توجد مصروفات
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.35 }}>
            {categories.map((cat) => (
              <Box key={cat.name}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.55 }}>
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: "55%" }}>
                    {cat.name}
                  </Typography>
                  <Typography className="num" variant="caption" fontWeight={800} color="text.secondary">
                    {formatCurrency(cat.amount)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 5,
                    borderRadius: 1,
                    bgcolor: "var(--panel-muted)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${(cat.amount / catMax) * 100}%`,
                      bgcolor: muted,
                      borderRadius: 1,
                      transition: "width 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
};
