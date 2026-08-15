import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Description,
  Receipt,
  PictureAsPdf,
  WhatsApp,
  Edit,
  DeleteOutline,
  CalendarToday,
  AccessTime,
  Inventory2,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import { useDataStore } from "@/store/useDataStore";
import {
  formatDate,
  formatCurrency,
  getStatusLabel,
  getInvoiceStatusStyle,
} from "@/utils/formatters";
import { PageHero } from "@/components/ui/PageHero";
import { HeroCtaButton, FilterChip } from "@/components/ui/ActionButtons";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { downloadPdf } from "@/utils/pdfService";
import { InvoiceStyledPDF } from "@/components/pdf/StyledPDFs";
import type { Invoice, Client } from "@/types";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const FILTER_TABS = [
  { id: "all", label: "الكل" },
  { id: "paid", label: "مدفوعة" },
  { id: "partially_paid", label: "جزئية" },
  { id: "draft", label: "مسودة" },
  { id: "overdue", label: "متأخرة" },
] as const;

function getClientObject(
  invoice: {
    clientId: string;
    tempClientName?: string;
    tempClientPhone?: string;
    tempClientAddress?: string;
    notes?: string;
  },
  clients: Client[]
): Client {
  const client = clients.find((c) => c.id === invoice.clientId);
  if (client) return client;

  let name = invoice.tempClientName || "عميل غير معروف";
  let phone = invoice.tempClientPhone || "";
  let address = invoice.tempClientAddress || "";

  if (invoice.notes) {
    const match = invoice.notes.match(
      /__TEMP_CLIENT__name:(.+?)__phone:(.+?)__/
    );
    if (match) {
      name = match[1].trim();
      phone = match[2]?.trim() || "";
    }
  }

  return {
    id: invoice.clientId || "temp",
    name,
    email: "",
    phone,
    address,
    type: "individual",
    createdAt: "",
    updatedAt: "",
  };
}

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const confirm = useConfirm();
  const { invoices, clients, deleteInvoice } = useDataStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return invoices.filter((inv) => {
      const client = getClientObject(inv, clients);
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        client.name.toLowerCase().includes(q) ||
        (inv.notes && inv.notes.toLowerCase().includes(q));
      const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, clients, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);
    return { total, paid, pending: total - paid };
  }, [invoices]);

  const handleViewPdf = (inv: Invoice) => {
    const client = getClientObject(inv, clients);
    downloadPdf(
      <InvoiceStyledPDF invoice={inv} client={client} />,
      `فاتورة-${inv.invoiceNumber}-${client.name}.pdf`
    );
  };

  const handleShareWhatsApp = (inv: Invoice) => {
    const client = getClientObject(inv, clients);
    const itemsText = inv.items
      .map(
        (it, idx) =>
          `  ${idx + 1}. ${it.description} (${it.quantity} × ${formatCurrency(it.unitPrice)}) = ${formatCurrency(it.total)}`
      )
      .join("\n");

    const message = [
      `📄 *فاتورة رسمية #${inv.invoiceNumber}*`,
      `👤 *العميل:* ${client.name}`,
      `📅 *تاريخ الإصدار:* ${dayjs(inv.issueDate).format("DD/MM/YYYY")}`,
      `⏳ *تاريخ الاستحقاق:* ${dayjs(inv.dueDate).format("DD/MM/YYYY")}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📋 *البنود (${inv.items.length}):*`,
      itemsText,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *الإجمالي المستحق:* *${formatCurrency(inv.total)}*`,
      `📌 *الحالة:* ${getStatusLabel(inv.status)}`,
      inv.notes ? `📝 *ملاحظات:* ${inv.notes}` : "",
      `━━━━━━━━━━━━━━━━━━━━`,
      `شكراً لتعاملكم معنا 🙏`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = (client.phone || "").replace(/[^0-9]/g, "");
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteInvoice = async (inv: Invoice) => {
    const client = getClientObject(inv, clients);
    const ok = await confirm({
      title: "حذف الفاتورة",
      message: `هل أنت متأكد من حذف الفاتورة #${inv.invoiceNumber} الخاصة بالعميل (${client.name}) نهائياً؟`,
      confirmLabel: "حذف الفاتورة",
      tone: "danger",
    });
    if (!ok) return;

    const toastId = toast.loading("جاري حذف الفاتورة...");
    try {
      await deleteInvoice(inv.id);
      toast.success("تم حذف الفاتورة بنجاح", { id: toastId });
    } catch (error: any) {
      toast.error(error?.message || "تعذّر حذف الفاتورة", { id: toastId });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 4 }}>
      <PageHero
        accent="amber"
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Receipt sx={{ fontSize: 16 }} />
            الفواتير الرسمية
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
        trailing={
          <HeroCtaButton onClick={() => navigate("/invoices/new")}>
            إنشاء فاتورة جديدة
          </HeroCtaButton>
        }
        footerStats={[
          { label: "إجمالي المفوتر", value: formatCurrency(stats.total) },
          {
            label: "المحصّل",
            value: formatCurrency(stats.paid),
            valueClassName: "hero-stat-value--gold",
          },
          {
            label: "المستحق المتبقي",
            value: formatCurrency(stats.pending),
            valueClassName: "hero-stat-value--gold",
          },
        ]}
      />

      <Stack spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          placeholder="بحث برقم الفاتورة أو اسم العميل أو الملاحظات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
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
      </Stack>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
        {filtered.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: "center",
              borderRadius: "20px",
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                display: "grid",
                placeItems: "center",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(201,165,78,0.15) 0%, rgba(201,165,78,0.05) 100%)",
                color: "#c9a54e",
                border: "1px solid rgba(201,165,78,0.25)",
              }}
            >
              <Description sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              لا توجد فواتير مطابقة
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 360, mx: "auto" }}
            >
              {searchQuery || filterStatus !== "all"
                ? "لا توجد نتائج تطابق خيارات البحث الحالية. جرّب تغيير الفلتر أو كلمات البحث."
                : "لم تقم بإنشاء أي فواتير حتى الآن. ابدأ بإنشاء فاتورتك الأولى."}
            </Typography>
            {!searchQuery && filterStatus === "all" && (
              <Box sx={{ mt: 2.5 }}>
                <HeroCtaButton onClick={() => navigate("/invoices/new")}>
                  إنشاء أول فاتورة
                </HeroCtaButton>
              </Box>
            )}
          </Card>
        ) : (
          filtered.map((inv) => {
            const chip = getInvoiceStatusStyle(inv.status);
            const client = getClientObject(inv, clients);
            const itemsSummary = inv.items
              .map((it) => it.description)
              .filter(Boolean)
              .slice(0, 2)
              .join("، ");

            return (
              <Card
                key={inv.id}
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${
                    isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.07)"
                  }`,
                  bgcolor: isDark ? alpha("#181b20", 0.75) : "#ffffff",
                  backdropFilter: "blur(12px)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isDark
                    ? "0 4px 20px rgba(0,0,0,0.25)"
                    : "0 2px 12px rgba(0,0,0,0.03)",
                  transition:
                    "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, border-color 200ms ease",
                  "@media (hover: hover) and (pointer: fine)": {
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: chip.border,
                      boxShadow: isDark
                        ? "0 12px 28px -6px rgba(0,0,0,0.5)"
                        : "0 10px 24px -4px rgba(0,0,0,0.08)",
                    },
                  },
                }}
              >
                {/* Accent status edge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: chip.color,
                  }}
                />

                <CardContent sx={{ p: { xs: 2.25, sm: 2.75 }, pr: { xs: 2.75, sm: 3.25 }, "&:last-child": { pb: { xs: 2.25, sm: 2.75 } } }}>
                  {/* Top Row: Ref Badge & Client + Total Amount & Status */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewPdf(inv)}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: "8px",
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)",
                            border: `1px solid ${theme.palette.divider}`,
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: "text.primary",
                          }}
                        >
                          <Receipt sx={{ fontSize: 13, opacity: 0.7 }} />
                          #{inv.invoiceNumber}
                        </Box>
                        <Chip
                          label={getStatusLabel(inv.status)}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            bgcolor: chip.bg,
                            color: chip.color,
                            border: `1px solid ${chip.border}`,
                            borderRadius: "8px",
                            px: 0.5,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="text.primary"
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          lineHeight: 1.3,
                        }}
                        noWrap
                      >
                        {client.name}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "left", flexShrink: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        className="num"
                        sx={{
                          fontSize: { xs: "1.125rem", sm: "1.3rem" },
                          color: "primary.main",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                        }}
                      >
                        {formatCurrency(inv.total)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ fontSize: "0.68rem" }}
                      >
                        المجموع الإجمالي
                      </Typography>
                    </Box>
                  </Box>

                  {/* Metadata Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: { xs: 1.5, sm: 2.5 },
                      mt: 1.75,
                      pt: 1.5,
                      borderTop: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <CalendarToday sx={{ fontSize: 14, color: "text.secondary", opacity: 0.8 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        الإصدار: {formatDate(inv.issueDate)}
                      </Typography>
                    </Box>

                    {inv.dueDate && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                        <AccessTime sx={{ fontSize: 14, color: "warning.main", opacity: 0.9 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          الاستحقاق: {formatDate(inv.dueDate)}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flex: 1, minWidth: 0 }}>
                      <Inventory2 sx={{ fontSize: 14, color: "text.secondary", opacity: 0.8 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                        {inv.items.length} بنود {itemsSummary ? `(${itemsSummary}...)` : ""}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Dedicated Action Toolbar: عرض (PDF) · مشاركة · تعديل · حذف */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(4, 1fr)",
                      },
                      gap: 1,
                      mt: 2,
                      pt: 1.75,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PictureAsPdf sx={{ fontSize: 17 }} />}
                      onClick={() => handleViewPdf(inv)}
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        py: 0.9,
                        bgcolor: isDark ? "primary.dark" : "primary.main",
                        "&:hover": {
                          bgcolor: isDark ? "primary.main" : "primary.dark",
                        },
                      }}
                    >
                      عرض PDF
                    </Button>

                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<WhatsApp sx={{ fontSize: 17 }} />}
                      onClick={() => handleShareWhatsApp(inv)}
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        py: 0.9,
                        borderColor: isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(22, 163, 74, 0.3)",
                        "&:hover": {
                          borderColor: "success.main",
                          bgcolor: isDark ? "rgba(74, 222, 128, 0.1)" : "rgba(22, 163, 74, 0.05)",
                        },
                      }}
                    >
                      مشاركة
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit sx={{ fontSize: 17 }} />}
                      onClick={() => navigate(`/invoices/new?edit=${inv.id}`)}
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        py: 0.9,
                        color: "text.primary",
                        borderColor: theme.palette.divider,
                        "&:hover": {
                          borderColor: "text.secondary",
                          bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        },
                      }}
                    >
                      تعديل
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutline sx={{ fontSize: 17 }} />}
                      onClick={() => handleDeleteInvoice(inv)}
                      sx={{
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        py: 0.9,
                        borderColor: isDark ? "rgba(248, 113, 113, 0.3)" : "rgba(220, 38, 38, 0.3)",
                        "&:hover": {
                          borderColor: "error.main",
                          bgcolor: isDark ? "rgba(248, 113, 113, 0.1)" : "rgba(220, 38, 38, 0.05)",
                        },
                      }}
                    >
                      حذف
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </Box>
  );
};

