import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  PictureAsPdf,
  Search,
  Share,
  TrendingDown,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { useDataStore } from "@/store/useDataStore";
import { formatCurrency } from "@/utils/calculations";
import { normalizeCategoryLabel, getCategoryMeta } from "@/constants/expenseCategories";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppCard } from "@/components/ui/AppCard";
import { QuickExpenseSheet } from "@/components/expense/QuickExpenseSheet";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { exportScopedExcel } from "@/services/exportService";
import type { Expense } from "@/types";
import toast from "react-hot-toast";

dayjs.locale("ar");

const STATUS_FILTERS = [
  { id: "all", label: "الكل" },
  { id: "open", label: "مفتوحة" },
  { id: "closed", label: "مغلقة" },
] as const;

export const ExpensesPage = () => {
  const { expenses, clients, deleteExpense } = useDataStore();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const rows = useMemo(() => {
    return expenses
      .map((expense) => {
        const client = clients.find((c) => c.id === expense.clientId);
        return { expense, client };
      })
      .filter(({ expense, client }) => {
        const q = search.trim().toLowerCase();
        if (q) {
          const hay = [
            expense.description,
            expense.category,
            expense.notes,
            client?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (statusFilter === "open" && expense.isClosed) return false;
        if (statusFilter === "closed" && !expense.isClosed) return false;
        if (clientFilter !== "all" && expense.clientId !== clientFilter) return false;
        return true;
      })
      .sort((a, b) => dayjs(b.expense.date).valueOf() - dayjs(a.expense.date).valueOf());
  }, [expenses, clients, search, statusFilter, clientFilter]);

  const totalFiltered = useMemo(
    () => rows.reduce((s, r) => s + r.expense.amount, 0),
    [rows]
  );

  const handleDelete = async (expense: Expense) => {
    const ok = await confirm({
      title: "حذف مصروف",
      message: `هل أنت متأكد من حذف «${expense.description}»؟`,
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteExpense(expense.id);
      toast.success("تم حذف المصروف");
    } catch {
      toast.error("تعذّر حذف المصروف");
    }
  };

  const handleExportExcel = () => {
    exportScopedExcel(
      "المصروفات",
      rows.map(({ expense, client }) => ({
        العميل: client?.name ?? "—",
        الوصف: expense.description,
        الفئة: normalizeCategoryLabel(expense.category),
        المبلغ: expense.amount,
        التاريخ: dayjs(expense.date).format("DD/MM/YYYY"),
        الحالة: expense.isClosed ? "مغلق" : "مفتوح",
        ملاحظات: expense.notes ?? "",
      }))
    );
  };

  return (
    <>
      <ListPageLayout
        title="المصروفات"
        subtitle={`${rows.length} مصروف · ${formatCurrency(totalFiltered)}`}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            مصروف جديد
          </Button>
        }
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="بحث بالوصف، الفئة، أو العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                onClick={() => setStatusFilter(f.id)}
                color={statusFilter === f.id ? "primary" : "default"}
                variant={statusFilter === f.id ? "filled" : "outlined"}
                sx={{ fontWeight: 700 }}
              />
            ))}
            <TextField
              select
              size="small"
              label="العميل"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              sx={{ minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="all">كل العملاء</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              size="small"
              startIcon={<Share />}
              onClick={handleExportExcel}
              sx={{ ml: "auto", fontWeight: 700 }}
            >
              Excel
            </Button>
          </Stack>

          {rows.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="لا توجد مصروفات"
              description="ابدأ بتسجيل أول مصروف من الزر العائم أو «مصروف جديد»"
              actionLabel="إضافة مصروف"
              onAction={() => setSheetOpen(true)}
            />
          ) : (
            <Stack spacing={1.25}>
              {rows.map(({ expense, client }) => {
                const meta = getCategoryMeta(expense.category);
                return (
                  <AppCard
                    key={expense.id}
                    onClick={() => client && navigate(`/clients/${client.id}`)}
                    sx={{ cursor: client ? "pointer" : "default" }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1.5,
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "action.hover",
                          color: meta?.tone ?? "primary.main",
                        }}
                      >
                        <TrendingDown fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Typography variant="body2" fontWeight={800} noWrap sx={{ flex: 1 }}>
                            {expense.description}
                          </Typography>
                          <Chip
                            size="small"
                            label={expense.isClosed ? "مغلق" : "مفتوح"}
                            color={expense.isClosed ? "default" : "success"}
                            sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700 }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {client?.name ?? "—"} · {normalizeCategoryLabel(expense.category)}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 13, color: "text.disabled" }} />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(expense.date).format("DD MMM YYYY")}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="subtitle2"
                          fontWeight={800}
                          className="num"
                          color="error.main"
                          sx={{ mt: 0.75 }}
                        >
                          {formatCurrency(expense.amount)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton
                          size="small"
                          aria-label="تعديل"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(expense);
                            setSheetOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="حذف"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(expense);
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </AppCard>
                );
              })}
            </Stack>
          )}
        </Stack>
      </ListPageLayout>

      <QuickExpenseSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
        editExpense={editing}
      />
    </>
  );
};
