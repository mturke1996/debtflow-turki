import { useState, type ReactNode } from "react";
import { Box, Button, Divider, Stack, TextField, Typography, alpha } from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import { formatCurrency } from "@/utils/calculations";
import {
  expenseHasQuantityLine,
  formatQuantityDisplay,
  multiplyQuantityPrice,
} from "@/utils/expenseFormUtils";
import { EXPENSE_FORM, expenseSheetFieldSx } from "./ExpenseFormKit";

const UNIT_CHIPS = ["م²", "م³", "طن", "كيس", "عدد", "يوم", "ساعة"] as const;

type ExpenseQuantityBlockProps<T extends FieldValues> = {
  control: Control<T>;
  quantity: unknown;
  unit: unknown;
  unitPrice: unknown;
  isDark: boolean;
  onClear: () => void;
};

export function ExpenseQuantityBlock<T extends FieldValues>({
  control,
  quantity,
  unit,
  unitPrice,
  isDark,
  onClear,
}: ExpenseQuantityBlockProps<T>) {
  const hasValues = Boolean(quantity || unit || unitPrice);
  const [expanded, setExpanded] = useState(hasValues);
  const fieldSx = expenseSheetFieldSx(isDark);

  if (!expanded) {
    return (
      <Button
        type="button"
        fullWidth
        onClick={() => setExpanded(true)}
        sx={{
          borderRadius: "14px",
          py: 1.25,
          border: `1.5px dashed ${alpha(EXPENSE_FORM.primary, 0.35)}`,
          color: EXPENSE_FORM.primary,
          fontWeight: 700,
          bgcolor: alpha(EXPENSE_FORM.primary, isDark ? 0.06 : 0.04),
          "&:hover": { bgcolor: alpha(EXPENSE_FORM.primary, 0.08) },
        }}
        startIcon={<Add />}
      >
        كمية × سعر (اختياري)
      </Button>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: `1px solid ${alpha(EXPENSE_FORM.primary, 0.14)}`,
        bgcolor: alpha(EXPENSE_FORM.primary, isDark ? 0.06 : 0.03),
        p: 1.75,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="caption" fontWeight={800} color="text.secondary">
          تفصيل الكمية
        </Typography>
        <Button
          type="button"
          size="small"
          color="inherit"
          onClick={() => {
            onClear();
            setExpanded(false);
          }}
          startIcon={<Close sx={{ fontSize: 16 }} />}
          sx={{ minWidth: 0, fontSize: "0.7rem", fontWeight: 700 }}
        >
          إزالة
        </Button>
      </Stack>
      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
        <Controller
          name={"quantity" as never}
          control={control}
          render={({ field }) => (
            <TextField {...field} label="الكمية" type="number" fullWidth sx={fieldSx} />
          )}
        />
        <Controller
          name={"unitPrice" as never}
          control={control}
          render={({ field }) => (
            <TextField {...field} label="سعر الوحدة" type="number" fullWidth sx={fieldSx} />
          )}
        />
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
        {UNIT_CHIPS.map((u) => (
          <Controller
            key={u}
            name={"unit" as never}
            control={control}
            render={({ field }) => (
              <Button
                type="button"
                size="small"
                variant={field.value === u ? "contained" : "outlined"}
                onClick={() => field.onChange(field.value === u ? "" : u)}
                sx={{
                  borderRadius: "10px",
                  minWidth: 0,
                  px: 1.25,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  ...(field.value === u
                    ? {
                        bgcolor: EXPENSE_FORM.primary,
                        "&:hover": { bgcolor: EXPENSE_FORM.primaryDark },
                      }
                    : {
                        borderColor: alpha(EXPENSE_FORM.primary, 0.25),
                        color: "text.secondary",
                      }),
                }}
              >
                {u}
              </Button>
            )}
          />
        ))}
      </Stack>
    </Box>
  );
}

export function ExpenseQuantityChip({
  quantity,
  unit,
  unitPrice,
  amount,
}: {
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  amount?: number;
}) {
  if (!expenseHasQuantityLine({ quantity: quantity ?? null, unitPrice: unitPrice ?? null })) {
    return null;
  }

  const q = quantity!;
  const p = unitPrice!;
  const total = amount ?? multiplyQuantityPrice(q, p);

  const cell = (label: string, value: ReactNode, highlight?: boolean) => (
    <Box sx={{ flex: 1, textAlign: "center", py: 0.75, px: 0.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ fontSize: "0.55rem", display: "block", mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography
        variant="caption"
        fontWeight={800}
        color={highlight ? EXPENSE_FORM.primary : "text.primary"}
        sx={{ fontSize: "0.72rem", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        mt: 0.75,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${alpha(EXPENSE_FORM.primary, 0.15)}`,
        bgcolor: alpha(EXPENSE_FORM.primary, 0.03),
      }}
    >
      <Stack
        direction="row"
        divider={
          <Divider orientation="vertical" flexItem sx={{ borderColor: alpha(EXPENSE_FORM.primary, 0.1) }} />
        }
      >
        {cell("الكمية", formatQuantityDisplay(q, unit || undefined))}
        {cell(unit ? "سعر الوحدة" : "سعر القطعة", formatCurrency(p))}
        {cell("الإجمالي", formatCurrency(total), true)}
      </Stack>
    </Box>
  );
}

type ExpenseAmountFieldProps<T extends FieldValues> = {
  control: Control<T>;
  isDark: boolean;
  qtyActive: boolean;
};

export function ExpenseAmountField<T extends FieldValues>({
  control,
  isDark,
  qtyActive,
}: ExpenseAmountFieldProps<T>) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
        المبلغ الإجمالي {qtyActive ? "(محسوب تلقائياً)" : ""}
      </Typography>
      <Controller
        name={"amount" as never}
        control={control}
        render={({ field }) => (
          <Box
            component="input"
            {...field}
            value={String(field.value ?? "")}
            readOnly={qtyActive}
            inputMode="decimal"
            placeholder="0"
            sx={{
              width: "100%",
              border: `1px solid ${alpha(EXPENSE_FORM.primary, 0.14)}`,
              borderRadius: "16px",
              px: 2,
              py: 1.5,
              fontSize: "1.25rem",
              fontWeight: 800,
              fontFamily: "var(--font-num), Outfit, Cairo, sans-serif",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
              direction: "ltr",
              bgcolor: qtyActive ? alpha(EXPENSE_FORM.primary, isDark ? 0.08 : 0.04) : isDark ? alpha("#fff", 0.04) : "#F4F4F2",
              outline: "none",
              "&:focus": {
                boxShadow: `0 0 0 2px ${alpha(EXPENSE_FORM.primary, 0.28)}`,
              },
            }}
          />
        )}
      />
    </Box>
  );
}
