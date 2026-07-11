import { useMemo, useState } from "react";
import {
  Add,
  Delete,
  Edit,
  Payment,
  Person,
  Store,
  Search,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useDataStore } from "@/store/useDataStore";
import type { StandaloneDebt } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import { ListPageLayout } from "@/components/ui/ListPageLayout";
import { SearchField } from "@/components/ui/SearchField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { AppCard } from "@/components/ui/AppCard";
import { AccountBalance, Paid, WarningAmber } from "@mui/icons-material";

export const DebtsPage = () => {
  const {
    clients,
    standaloneDebts,
    addStandaloneDebt,
    updateStandaloneDebt,
    deleteStandaloneDebt,
  } = useDataStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paid">(
    "all"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<StandaloneDebt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<StandaloneDebt | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [form, setForm] = useState({
    clientId: "",
    description: "",
    amount: "",
    date: dayjs().format("YYYY-MM-DD"),
    notes: "",
  });

  const filteredDebts = useMemo(() => {
    return standaloneDebts
      .filter((debt) => {
        const client = clients.find((c) => c.id === debt.clientId);
        const matchesSearch =
          debt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          debt.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ? true : debt.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
  }, [standaloneDebts, clients, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalAmount = standaloneDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = standaloneDebts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalRemaining = standaloneDebts.reduce(
      (sum, d) => sum + d.remainingAmount,
      0
    );
    return { totalAmount, totalPaid, totalRemaining };
  }, [standaloneDebts]);

  const handleOpenDialog = (debt?: StandaloneDebt) => {
    if (debt) {
      setEditingDebt(debt);
      setForm({
        clientId: debt.clientId,
        description: debt.description,
        amount: String(debt.amount),
        date: debt.date,
        notes: debt.notes || "",
      });
    } else {
      setEditingDebt(null);
      setForm({
        clientId: "",
        description: "",
        amount: "",
        date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount) || 0;
    if (!form.clientId || !form.description || amount <= 0) return;

    if (editingDebt) {
      const clampedPaid = Math.min(editingDebt.paidAmount, amount);
      const newRemaining = Math.max(0, amount - clampedPaid);
      await updateStandaloneDebt(editingDebt.id, {
        clientId: form.clientId,
        description: form.description,
        amount,
        paidAmount: clampedPaid,
        remainingAmount: newRemaining,
        status: newRemaining <= 0 ? "paid" : "active",
        date: form.date,
        notes: form.notes,
      });
    } else {
      const client = clients.find((c) => c.id === form.clientId);
      const newDebt: StandaloneDebt = {
        id: crypto.randomUUID(),
        clientId: form.clientId,
        partyId: form.clientId,
        partyType: client?.type === "company" ? "company" : "person",
        partyName: client?.name ?? "",
        description: form.description,
        amount,
        paidAmount: 0,
        remainingAmount: amount,
        status: "active",
        date: form.date,
        notes: form.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addStandaloneDebt(newDebt);
    }

    setDialogOpen(false);
    setEditingDebt(null);
    setForm({
      clientId: "",
      description: "",
      amount: "",
      date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    });
  };

  const handleDelete = async (debtId: string) => {
    await deleteStandaloneDebt(debtId);
  };

  const handleOpenPayDialog = (debt: StandaloneDebt) => {
    setSelectedDebt(debt);
    setPayAmount("");
    setPayDialogOpen(true);
  };

  const handlePay = async () => {
    if (!selectedDebt) return;
    const pay = parseFloat(payAmount) || 0;
    if (pay <= 0 || pay > selectedDebt.remainingAmount) return;
    const newPaid = selectedDebt.paidAmount + pay;
    const newRemaining = Math.max(0, selectedDebt.amount - newPaid);
    await updateStandaloneDebt(selectedDebt.id, {
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newRemaining <= 0 ? "paid" : "active",
    });
    setPayDialogOpen(false);
    setSelectedDebt(null);
  };

  const statusChip = (status: StandaloneDebt["status"]) => {
    const config =
      status === "paid"
        ? { label: "مدفوع", color: "success" as const }
        : { label: "نشط", color: "warning" as const };
    return <Chip size="small" label={config.label} color={config.color} />;
  };

  return (
    <>
      <ListPageLayout
        kicker="السجلات"
        title={`الديون (${standaloneDebts.length})`}
        subtitle="إضافة، تعديل، حذف، ودفع جزء من الدين"
        maxWidth="md"
        action={
          <Button startIcon={<Add />} variant="contained" onClick={() => handleOpenDialog()}>
            إضافة دين
          </Button>
        }
        filters={
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard icon={AccountBalance} label="إجمالي الديون" value={formatCurrency(stats.totalAmount)} tone="primary" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard icon={Paid} label="المدفوع" value={formatCurrency(stats.totalPaid)} tone="success" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard icon={WarningAmber} label="المتبقي" value={formatCurrency(stats.totalRemaining)} tone="warning" />
              </Grid>
            </Grid>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث بالاسم أو الملاحظة..."
              />
              <TextField
                select
                label="الحالة"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "active" | "paid")
                }
                sx={{ minWidth: { sm: 180 } }}
                size="small"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="paid">مدفوع</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={2}>
          {filteredDebts.length === 0 ? (
            <EmptyState
              icon={AccountBalance}
              title="لا توجد ديون مسجلة"
              actionLabel="إضافة دين"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            filteredDebts.map((debt) => {
          const client = clients.find((c) => c.id === debt.clientId);
          return (
            <AppCard key={debt.id} padding={2.5}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.main",
                      width: 46,
                      height: 46,
                    }}
                  >
                    {client?.type === "company" ? <Store /> : <Person />}
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Typography variant="subtitle2" fontWeight={800} noWrap>
                        {debt.description}
                      </Typography>
                      {client && (
                        <Chip
                          size="small"
                          label={client.name}
                          variant="outlined"
                          sx={{ height: 22 }}
                        />
                      )}
                      {statusChip(debt.status)}
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {dayjs(debt.date).format("DD/MM/YYYY")}
                    </Typography>
                    {debt.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          px: 1.2,
                          py: 0.6,
                          borderRadius: 1.5,
                          bgcolor: "action.hover",
                          lineHeight: 1.6,
                        }}
                      >
                        💬 {debt.notes}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}
                    >
                      <Chip
                        label={`المبلغ: ${formatCurrency(debt.amount)}`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`مدفوع: ${formatCurrency(debt.paidAmount)}`}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`متبقي: ${formatCurrency(debt.remainingAmount)}`}
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1.2} sx={{ ml: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenPayDialog(debt)}
                      sx={{ bgcolor: "primary.light" }}
                    >
                      <Payment fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(debt)}
                      sx={{ bgcolor: "action.hover" }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <ConfirmDeleteButton
                      confirmMessage="هل أنت متأكد من حذف هذا الدين؟"
                      onConfirm={() => handleDelete(debt.id)}
                    />
                  </Stack>
                </Stack>
            </AppCard>
          );
            })
          )}
        </Stack>
      </ListPageLayout>

      {/* Add / Edit Debt Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullScreen
      >
        <DialogTitle>
          {editingDebt ? "تعديل الدين" : "إضافة دين جديد"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="العميل"
              value={form.clientId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, clientId: e.target.value }))
              }
              fullWidth
            >
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="اسم الشخص / المحل"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="المبلغ الكلي"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="التاريخ"
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="ملاحظات"
              multiline
              minRows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingDebt ? "حفظ التعديلات" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Partial payment dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)}>
        <DialogTitle>دفع جزء من الدين</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              المتبقي: {formatCurrency(selectedDebt?.remainingAmount || 0)}
            </Typography>
            <TextField
              label="قيمة الدفعة"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handlePay}>
            تأكيد الدفع
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

