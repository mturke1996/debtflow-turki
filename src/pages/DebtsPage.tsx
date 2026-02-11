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
      const newDebt: StandaloneDebt = {
        id: crypto.randomUUID(),
        clientId: form.clientId,
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
    if (window.confirm("هل أنت متأكد من حذف هذا الدين؟")) {
      await deleteStandaloneDebt(debtId);
    }
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
    <Box sx={{ pb: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            الديون (أشخاص ومحلات)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إضافة، تعديل، حذف، ودفع جزء من الدين بسرعة
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ 
            borderRadius: 2.5,
            bgcolor: '#1a3a5c',
            fontWeight: 700,
            boxShadow: '0 4px 14px -3px rgba(26, 58, 92, 0.35)',
            '&:hover': {
              bgcolor: '#0e2440',
              boxShadow: '0 8px 22px -4px rgba(26, 58, 92, 0.4)',
            },
          }}
        >
          إضافة دين
        </Button>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                إجمالي الديون
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formatCurrency(stats.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                المدفوع
              </Typography>
              <Typography variant="h6" fontWeight={800} color="success.main">
                {formatCurrency(stats.totalPaid)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                المتبقي
              </Typography>
              <Typography variant="h6" fontWeight={800} color="warning.main">
                {formatCurrency(stats.totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              placeholder="ابحث بالاسم، الملاحظة، أو الشخص/المحل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="الحالة"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "paid")
              }
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="paid">مدفوع</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Debts list */}
      <Stack spacing={2.5}>
        {filteredDebts.map((debt) => {
          const client = clients.find((c) => c.id === debt.clientId);
          return (
            <Card
              key={debt.id}
              sx={{
                borderRadius: 2.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
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
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(debt.id)}
                      sx={{ bgcolor: "error.light", color: "white" }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {filteredDebts.length === 0 && (
          <Card sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد ديون مسجلة
            </Typography>
          </Card>
        )}
      </Stack>

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
    </Box>
  );
};

