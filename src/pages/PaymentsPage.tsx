import { useState, useMemo } from "react";
import { TrendingUp, Payments } from "@mui/icons-material";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useDataStore } from "@/store/useDataStore";
import type { Payment } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import { formatDate, paymentMethods } from "@/utils/formatters";
import { downloadPdf } from "@/utils/pdfService";
import { loadStyledPDFs } from "@/components/pdf/lazyPdf";
import { PageHero } from "@/components/ui/PageHero";
import { HeroCtaButton, FilterChip } from "@/components/ui/ActionButtons";
import { SearchField } from "@/components/ui/SearchField";
import { FormDialog } from "@/components/ui/FormDialog";
import { PaymentLedgerCard } from "@/components/payment/PaymentLedgerCard";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const paymentSchema = z.object({
  clientId: z.string().min(1, "يجب اختيار عميل"),
  invoiceId: z.string().optional(),
  amount: z.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "credit_card"]),
  paymentDate: z.string(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const METHOD_FILTERS = [
  { id: "all", label: "الكل" },
  { id: "cash", label: "نقدي" },
  { id: "bank_transfer", label: "تحويل بنكي" },
  { id: "check", label: "شيك" },
  { id: "credit_card", label: "بطاقة" },
] as const;

function getClientName(
  payment: Payment,
  clients: { id: string; name: string }[],
  invoices: { id: string; tempClientName?: string }[]
) {
  const client = clients.find((c) => c.id === payment.clientId);
  if (client) return client.name;
  const invoice = invoices.find((i) => i.id === payment.invoiceId);
  if (invoice?.tempClientName) return invoice.tempClientName;
  return "عميل غير معروف";
}

export const PaymentsPage = () => {
  const { clients, invoices, payments, addPayment, updatePayment, deletePayment } = useDataStore();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: "",
      invoiceId: "",
      amount: 0,
      paymentMethod: "cash",
      paymentDate: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  const total = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);

  const collectedThisMonth = useMemo(() => {
    const start = dayjs().startOf("month");
    return payments
      .filter((p) => dayjs(p.paymentDate).isAfter(start) || dayjs(p.paymentDate).isSame(start, "day"))
      .reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return payments
      .filter((payment) => {
        const clientName = getClientName(payment, clients, invoices);
        const invoice = payment.invoiceId ? invoices.find((i) => i.id === payment.invoiceId) : null;
        const matchesSearch =
          clientName.toLowerCase().includes(q) ||
          invoice?.invoiceNumber.toLowerCase().includes(q) ||
          payment.notes?.toLowerCase().includes(q) ||
          q === "";
        const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
        return matchesSearch && matchesMethod;
      })
      .sort((a, b) => dayjs(b.paymentDate).diff(dayjs(a.paymentDate)));
  }, [payments, clients, invoices, searchQuery, methodFilter]);

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      reset({
        clientId: payment.clientId,
        invoiceId: payment.invoiceId || "",
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: dayjs(payment.paymentDate).format("YYYY-MM-DD"),
        notes: payment.notes || "",
      });
    } else {
      setEditingPayment(null);
      reset({
        clientId: "",
        invoiceId: "",
        amount: 0,
        paymentMethod: "cash",
        paymentDate: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
    reset();
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (saving) return;
    setSaving(true);
    const toastId = toast.loading(editingPayment ? "جاري التحديث..." : "جاري الحفظ...");
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          clientId: data.clientId,
          invoiceId: data.invoiceId || "",
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes || "",
        });
        toast.success("تم التحديث", { id: toastId });
      } else {
        await addPayment({
          id: crypto.randomUUID(),
          invoiceId: data.invoiceId || "",
          clientId: data.clientId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success("تمت الإضافة", { id: toastId });
      }
      handleCloseDialog();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ";
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    const ok = await confirm({
      title: "حذف دفعة",
      message: "هل أنت متأكد من حذف هذه الدفعة؟",
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    const toastId = toast.loading("جاري الحذف...");
    try {
      await deletePayment(payment.id);
      toast.success("تم الحذف", { id: toastId });
    } catch {
      toast.error("تعذّر الحذف", { id: toastId });
    }
  };

  const handleExportPdf = async () => {
    const { PaymentsSummaryStyledPDF } = await loadStyledPDFs();
    await downloadPdf(
      <PaymentsSummaryStyledPDF payments={payments} clients={clients} />,
      `تقرير-المدفوعات-${dayjs().format("YYYY-MM-DD")}.pdf`
    );
  };

  const methodLabel = (method: Payment["paymentMethod"]) =>
    paymentMethods[method as keyof typeof paymentMethods] ?? method;

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "background.paper" } };

  return (
    <>
      <div className="page-stack" style={{ paddingBottom: 32 }}>
        <PageHero
          accent="success"
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <TrendingUp sx={{ fontSize: 14 }} />
              المدفوعات
            </span>
          }
          title="إجمالي المحصّل"
          headline={formatCurrency(total)}
          trailing={
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
              {payments.length > 0 ? (
                <HeroCtaButton icon="share" compact onClick={() => void handleExportPdf()}>
                  تصدير PDF
                </HeroCtaButton>
              ) : null}
              <HeroCtaButton onClick={() => handleOpenDialog()}>دفعة جديدة</HeroCtaButton>
            </div>
          }
          footerStats={[
            { label: "عدد العمليات", value: payments.length },
            {
              label: "متوسط الدفعة",
              value: formatCurrency(payments.length ? total / payments.length : 0),
            },
            {
              label: "محصّل الشهر",
              value: formatCurrency(collectedThisMonth),
              valueClassName: "hero-stat-value--gold",
            },
          ]}
        />

        <section className="page-section">
          <div className="section-label" style={{ marginBottom: 10 }}>
            البحث والتصفية
          </div>
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="بحث بالعميل أو الفاتورة أو الملاحظات..."
            sx={{ mb: 1.5 }}
          />
          <div className="filter-scroll">
            {METHOD_FILTERS.map((tab) => (
              <FilterChip
                key={tab.id}
                label={tab.label}
                active={methodFilter === tab.id}
                onClick={() => setMethodFilter(tab.id)}
              />
            ))}
          </div>
        </section>

        <section className="page-section">
          <div className="section-label" style={{ marginBottom: 10 }}>
            السجل ({filteredPayments.length})
          </div>

          {filteredPayments.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-state-premium__icon empty-state-premium__icon--green">
                <Payments sx={{ fontSize: 28 }} />
              </div>
              <h3 className="empty-state-premium__title">لا توجد مدفوعات</h3>
              <p className="empty-state-premium__desc">
                {searchQuery || methodFilter !== "all"
                  ? "لا نتائج مطابقة — جرّب بحثاً أو فلتراً آخر."
                  : "المدفوعات ستظهر هنا فور إضافتها."}
              </p>
              {!searchQuery && methodFilter === "all" ? (
                <div style={{ marginTop: 16 }}>
                  <HeroCtaButton onClick={() => handleOpenDialog()}>دفعة جديدة</HeroCtaButton>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="ledger-list">
              {filteredPayments.map((payment) => {
                const clientName = getClientName(payment, clients, invoices);
                const invoice = invoices.find((i) => i.id === payment.invoiceId);
                return (
                  <PaymentLedgerCard
                    key={payment.id}
                    clientName={clientName}
                    payment={payment}
                    methodLabel={methodLabel(payment.paymentMethod)}
                    invoiceNumber={invoice?.invoiceNumber}
                    amountLabel={formatCurrency(payment.amount)}
                    dateLabel={formatDate(payment.paymentDate)}
                    onEdit={() => handleOpenDialog(payment)}
                    onDelete={() => void handleDelete(payment)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <FormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingPayment ? "تعديل الدفعة" : "دفعة جديدة"}
        subtitle="سجّل مبلغاً محصّلاً واربطه بالعميل أو فاتورة."
        onSubmit={handleSubmit(onSubmit)}
        submitLabel={editingPayment ? "حفظ التعديل" : "إضافة الدفعة"}
        loading={saving}
        submitColor="success"
      >
        <Stack spacing={2.25}>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.clientId} sx={fieldSx}>
                <InputLabel>العميل</InputLabel>
                <Select {...field} label="العميل">
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="invoiceId"
            control={control}
            render={({ field }) => {
              const selectedClientId = watch("clientId");
              const clientInvoices = selectedClientId
                ? invoices.filter((inv) => inv.clientId === selectedClientId && inv.status !== "paid")
                : [];
              return (
                <FormControl fullWidth disabled={!selectedClientId} sx={fieldSx}>
                  <InputLabel>الفاتورة (اختياري)</InputLabel>
                  <Select
                    {...field}
                    value={field.value || ""}
                    label="الفاتورة (اختياري)"
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  >
                    <MenuItem value="">بدون فاتورة</MenuItem>
                    {clientInvoices.map((inv) => (
                      <MenuItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {formatCurrency(inv.total)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="المبلغ"
                type="number"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                sx={fieldSx}
                className="num"
              />
            )}
          />

          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>طريقة الدفع</InputLabel>
                <Select {...field} label="طريقة الدفع">
                  <MenuItem value="cash">نقدي</MenuItem>
                  <MenuItem value="bank_transfer">تحويل بنكي</MenuItem>
                  <MenuItem value="check">شيك</MenuItem>
                  <MenuItem value="credit_card">بطاقة ائتمان</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="paymentDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="تاريخ الدفع"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="ملاحظات (اختياري)" multiline rows={2} sx={fieldSx} />
            )}
          />
        </Stack>
      </FormDialog>
    </>
  );
};
