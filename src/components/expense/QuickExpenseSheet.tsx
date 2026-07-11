import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Briefcase, StickyNote, Wallet, X } from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ar";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDataStore } from "@/store/useDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import { DEFAULT_EXPENSE_CATEGORY } from "@/constants/expenseCategories";
import { CategorySelect } from "@/components/ui/CategorySelect";
import {
  buildExpenseQuantityPayload,
  expenseHasQuantityLine,
  formatExpensePreview,
  multiplyQuantityPrice,
  parseDecimalInput,
} from "@/utils/expenseFormUtils";
import { EXPENSE_FORM, expenseSheetFieldSx } from "./ExpenseFormKit";
import { ExpenseAmountField, ExpenseQuantityBlock } from "./ExpenseQuantityBlock";

export type QuickExpenseFormValues = {
  description: string;
  amount: string;
  category: string;
  date: Dayjs;
  notes: string;
  clientId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

const EMPTY_FORM: QuickExpenseFormValues = {
  description: "",
  amount: "",
  category: DEFAULT_EXPENSE_CATEGORY,
  date: dayjs(),
  notes: "",
  clientId: "",
  quantity: "",
  unit: "",
  unitPrice: "",
};

export type QuickExpenseSheetProps = {
  open: boolean;
  onClose: () => void;
  /** قفل العميل عند الفتح من بروفايل عميل */
  defaultClientId?: string;
  /** وضع التعديل */
  editExpense?: {
    id: string;
    clientId: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
    quantity?: number;
    unitPrice?: number;
    unit?: string;
  } | null;
  onSaved?: () => void;
};

export const QuickExpenseSheet = ({
  open,
  onClose,
  defaultClientId,
  editExpense,
  onSaved,
}: QuickExpenseSheetProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { clients, addExpense, updateExpense } = useDataStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(editExpense?.id);

  const { control, handleSubmit, reset, setValue, watch } = useForm<QuickExpenseFormValues>({
    defaultValues: EMPTY_FORM,
  });

  const quantity = useWatch({ control, name: "quantity" });
  const unit = useWatch({ control, name: "unit" });
  const unitPrice = useWatch({ control, name: "unitPrice" });
  const clientId = useWatch({ control, name: "clientId" });
  const amountPreview = parseDecimalInput(watch("amount")) ?? 0;
  const sheetFieldSx = expenseSheetFieldSx(isDark);

  const qtyActive = expenseHasQuantityLine({
    quantity: parseDecimalInput(quantity),
    unitPrice: parseDecimalInput(unitPrice),
  });

  useEffect(() => {
    const q = parseDecimalInput(quantity);
    const p = parseDecimalInput(unitPrice);
    if (q != null && q > 0 && p != null && p >= 0) {
      setValue("amount", String(multiplyQuantityPrice(q, p)));
    }
  }, [quantity, unitPrice, setValue]);

  useEffect(() => {
    if (!open) return;
    if (editExpense) {
      reset({
        description: editExpense.description,
        amount: String(editExpense.amount),
        category: editExpense.category,
        date: dayjs(editExpense.date),
        notes: editExpense.notes ?? "",
        clientId: editExpense.clientId,
        quantity: editExpense.quantity != null ? String(editExpense.quantity) : "",
        unit: editExpense.unit ?? "",
        unitPrice: editExpense.unitPrice != null ? String(editExpense.unitPrice) : "",
      });
      return;
    }
    reset({
      ...EMPTY_FORM,
      date: dayjs(),
      clientId: defaultClientId || (clients.length > 0 ? clients[0].id : ""),
    });
  }, [open, editExpense, defaultClientId, clients, reset]);

  useEffect(() => {
    if (open && !clientId && !defaultClientId && clients.length > 0) {
      setValue("clientId", clients[0].id);
    }
  }, [open, clientId, defaultClientId, clients, setValue]);

  const handleSave = useCallback(
    async (data: QuickExpenseFormValues) => {
      const amount = parseDecimalInput(data.amount) ?? 0;
      if (!data.description?.trim()) {
        toast.error("أدخل وصف المصروف");
        return;
      }
      if (!data.clientId) {
        toast.error("اختر العميل / المشروع");
        return;
      }
      if (amount <= 0) {
        toast.error("أدخل المبلغ الإجمالي");
        return;
      }

      const q = parseDecimalInput(data.quantity);
      const p = parseDecimalInput(data.unitPrice);
      const unitName = data.unit?.trim() || undefined;
      const qtyFields = buildExpenseQuantityPayload(q, p, unitName);

      setLoading(true);
      try {
        const payload = {
          clientId: data.clientId,
          description: data.description.trim(),
          amount,
          category: data.category,
          date: dayjs(data.date).toISOString(),
          notes: data.notes?.trim() || undefined,
          isClosed: false,
          ...qtyFields,
        };

        if (isEdit && editExpense) {
          await updateExpense(editExpense.id, {
            ...payload,
            updatedAt: new Date().toISOString(),
          });
          toast.success("تم تحديث المصروف");
        } else {
          await addExpense({
            id: crypto.randomUUID(),
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          toast.success("تم حفظ المصروف");
        }
        onSaved?.();
        onClose();
      } catch (error) {
        console.error(error);
        toast.error(isEdit ? "تعذّر تحديث المصروف" : "تعذّر حفظ المصروف");
      } finally {
        setLoading(false);
      }
    },
    [addExpense, updateExpense, editExpense, isEdit, onClose, onSaved, user]
  );

  const lockedClient = Boolean(defaultClientId && !isEdit);

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      transitionDuration={{ enter: 220, exit: 160 }}
      PaperProps={{
        sx: {
          borderRadius: { xs: "26px 26px 0 0", sm: "24px" },
          position: { xs: "fixed", sm: "relative" },
          bottom: { xs: 0, sm: "auto" },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: undefined },
          maxWidth: { xs: "100%", sm: 460 },
          maxHeight: { xs: "92dvh", sm: "calc(100dvh - 64px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#1c1917", 0.08)}`,
          background: isDark
            ? "linear-gradient(180deg, #141818 0%, #0c0f0f 100%)"
            : "linear-gradient(180deg, #FFFFFF 0%, #f7f6f3 100%)",
          boxShadow: isDark
            ? "0 -12px 46px rgba(0,0,0,0.48)"
            : "0 -12px 40px rgba(28,25,23,0.16)",
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: { xs: "block", sm: "none" },
          width: 40,
          height: 5,
          borderRadius: "999px",
          mx: "auto",
          mt: 1,
          mb: 0.25,
          flexShrink: 0,
          bgcolor: isDark ? alpha("#fff", 0.14) : "rgba(28, 25, 23, 0.14)",
        }}
      />

      <Box
        sx={{
          px: 2.75,
          pt: 1.5,
          pb: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexShrink: 0,
          borderBottom: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#1c1917", 0.08)}`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25 }}>
            {isEdit ? "تعديل مصروف" : "تسجيل مصروف جديد"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {isEdit ? "عدّل التفاصيل واحفظ" : "حدّد العميل وأدخل تفاصيل المصروف"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          disabled={loading}
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            bgcolor: isDark ? alpha("#fff", 0.07) : "#F1F1EF",
            color: "text.secondary",
            border: `1px solid ${isDark ? alpha("#fff", 0.08) : "rgba(28, 25, 23, 0.06)"}`,
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </IconButton>
      </Box>

      <Box
        sx={{
          mx: 2.75,
          mt: 1.25,
          mb: 1,
          px: 1.75,
          py: 1.35,
          borderRadius: "14px",
          border: `1px solid ${alpha(EXPENSE_FORM.primary, isDark ? 0.32 : 0.18)}`,
          bgcolor: isDark ? alpha(EXPENSE_FORM.primary, 0.12) : alpha(EXPENSE_FORM.primary, 0.06),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.9} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: isDark ? alpha("#fff", 0.1) : alpha(EXPENSE_FORM.primary, 0.1),
              flexShrink: 0,
            }}
          >
            <Wallet size={15} strokeWidth={2} color={isDark ? "#5eead4" : EXPENSE_FORM.primary} />
          </Box>
          <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", fontWeight: 650 }}>
            المبلغ الإجمالي
          </Typography>
        </Stack>
        <Typography
          className="num"
          sx={{
            fontSize: "0.96rem",
            fontWeight: 850,
            color: EXPENSE_FORM.primary,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {formatExpensePreview(amountPreview)}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(handleSave)}
        sx={{
          px: 2.75,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          flex: 1,
          minHeight: 0,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
          <Stack spacing={2.25} sx={{ pt: 0.5 }}>
            <Typography
              sx={{ fontSize: "0.68rem", fontWeight: 800, color: "text.secondary", letterSpacing: "0.06em" }}
            >
              البيانات الأساسية
            </Typography>

            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={sheetFieldSx} disabled={lockedClient}>
                  <InputLabel>العميل / المشروع</InputLabel>
                  <Select
                    {...field}
                    label="العميل / المشروع"
                    sx={{ borderRadius: "16px" }}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <Briefcase size={17} color={theme.palette.text.secondary} strokeWidth={2} />
                      </InputAdornment>
                    }
                  >
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="وصف المصروف"
                  fullWidth
                  sx={sheetFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <StickyNote size={17} color={theme.palette.text.secondary} strokeWidth={2} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <ExpenseQuantityBlock
              control={control}
              quantity={quantity}
              unit={unit}
              unitPrice={unitPrice}
              isDark={isDark}
              onClear={() => {
                setValue("quantity", "");
                setValue("unit", "");
                setValue("unitPrice", "");
              }}
            />

            <ExpenseAmountField control={control} isDark={isDark} qtyActive={qtyActive} />

            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "text.secondary",
                letterSpacing: "0.06em",
                pt: 0.2,
              }}
            >
              تفاصيل إضافية
            </Typography>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <CategorySelect value={field.value} onChange={field.onChange} label="الفئة" />
              )}
            />

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="تاريخ المصروف"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue || dayjs())}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: sheetFieldSx,
                      inputProps: { dir: "ltr", style: { textAlign: "end" } },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ملاحظات (اختياري)"
                  multiline
                  rows={2}
                  fullWidth
                  sx={sheetFieldSx}
                />
              )}
            />
          </Stack>
        </LocalizationProvider>

        <Box sx={{ pt: 2.5, display: "flex", gap: 1.25 }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            sx={{
              flex: 1,
              borderRadius: "14px",
              fontWeight: 700,
              color: "text.secondary",
              bgcolor: isDark ? alpha("#fff", 0.05) : "#F1F1EF",
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : "rgba(28, 25, 23, 0.07)"}`,
            }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              flex: 2,
              borderRadius: "14px",
              fontWeight: 800,
              bgcolor: EXPENSE_FORM.primary,
              boxShadow: `0 6px 18px ${alpha(EXPENSE_FORM.primary, 0.35)}`,
              "&:hover": {
                bgcolor: EXPENSE_FORM.primaryDark,
                boxShadow: `0 8px 22px ${alpha(EXPENSE_FORM.primary, 0.42)}`,
              },
              "&:disabled": { opacity: 0.55 },
            }}
          >
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "حفظ المصروف"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
