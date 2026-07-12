import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { getAllExpenseCategories, useCategoryStore } from "@/store/useCategoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_META,
  getCategoryMeta,
  normalizeCategoryLabel,
  type DefaultExpenseCategory,
} from "@/constants/expenseCategories";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
};

function CategoryMenuRow({ name, custom }: { name: string; custom?: boolean }) {
  const meta = getCategoryMeta(name);

  return (
    <Box sx={{ py: 0.25, width: "100%" }}>
      <Typography variant="body2" fontWeight={700}>
        {name}
        {custom ? (
          <Typography component="span" variant="caption" color="primary.main" sx={{ mr: 0.5 }}>
            {" "}
            · مخصصة
          </Typography>
        ) : null}
      </Typography>
      {meta?.hint ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.4 }}>
          {meta.hint}
        </Typography>
      ) : custom ? (
        <Typography variant="caption" color="text.secondary">
          فئة أضفتها أنت
        </Typography>
      ) : null}
    </Box>
  );
}

export const CategorySelect = ({
  value,
  onChange,
  label = "الفئة",
  disabled = false,
}: CategorySelectProps) => {
  const customCategories = useCategoryStore((s) => s.customCategories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const { user } = useAuthStore();
  const categories = useMemo(
    () => getAllExpenseCategories(customCategories),
    [customCategories],
  );

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");

  const displayValue = normalizeCategoryLabel(value);
  const selectedMeta = getCategoryMeta(displayValue);

  const handleAdd = async () => {
    const ok = await addCategory(newName, user?.id);
    if (!ok) {
      setAddError("الفئة موجودة أو الاسم غير صالح (حرفان على الأقل)");
      return;
    }
    onChange(normalizeCategoryLabel(newName.trim()));
    setNewName("");
    setAddError("");
    setAddOpen(false);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          mb: 1.5,
          overflowX: "auto",
          flexWrap: "nowrap",
          pb: 0.5,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {DEFAULT_EXPENSE_CATEGORIES.map((cat) => {
          const meta = EXPENSE_CATEGORY_META[cat];
          const active = displayValue === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => !disabled && onChange(cat)}
              sx={{
                fontWeight: active ? 800 : 600,
                fontSize: "0.72rem",
                borderRadius: "10px",
                flexShrink: 0,
                border: "1px solid",
                borderColor: active ? meta.tone : "divider",
                bgcolor: active ? alpha(meta.tone, 0.12) : "transparent",
                color: active ? meta.tone : "text.secondary",
                cursor: disabled ? "default" : "pointer",
                "&:hover": disabled
                  ? {}
                  : {
                      bgcolor: alpha(meta.tone, 0.08),
                      borderColor: alpha(meta.tone, 0.35),
                    },
              }}
            />
          );
        })}
      </Box>

      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={categories.includes(displayValue) ? displayValue : value}
          label={label}
          disabled={disabled}
          onChange={(e) => onChange(String(e.target.value))}
          renderValue={(v) => (
            <Typography variant="body2" fontWeight={700}>
              {normalizeCategoryLabel(String(v))}
            </Typography>
          )}
          MenuProps={{ PaperProps: { sx: { maxHeight: 440, borderRadius: 2 } } }}
          sx={{ borderRadius: 2 }}
        >
          <ListSubheader sx={{ fontWeight: 800, lineHeight: 2.5, bgcolor: "background.paper" }}>
            الفئات الأساسية ({DEFAULT_EXPENSE_CATEGORIES.length})
          </ListSubheader>
          {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat} sx={{ py: 1, borderRadius: 1, mx: 0.5 }}>
              <CategoryMenuRow name={cat} />
            </MenuItem>
          ))}
          {customCategories.length > 0 ? (
            <ListSubheader sx={{ fontWeight: 800, lineHeight: 2.5, bgcolor: "background.paper" }}>
              فئاتك المخصصة
            </ListSubheader>
          ) : null}
          {customCategories.map((cat) => (
            <MenuItem key={cat} value={cat} sx={{ py: 1, borderRadius: 1, mx: 0.5 }}>
              <CategoryMenuRow name={cat} custom />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedMeta ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", lineHeight: 1.45 }}>
          {selectedMeta.hint}
        </Typography>
      ) : null}

      <Button
        size="small"
        startIcon={<Add />}
        onClick={() => setAddOpen(true)}
        disabled={disabled}
        sx={{ mt: 1.25, fontWeight: 700 }}
      >
        إضافة فئة مخصصة
      </Button>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>فئة مصروف جديدة</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            الفئات الـ{DEFAULT_EXPENSE_CATEGORIES.length} الأساسية تغطي أغلب مصروفات الموقع. أضف فئة خاصة عند
            الحاجة فقط.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {(DEFAULT_EXPENSE_CATEGORIES as readonly DefaultExpenseCategory[]).map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                variant="outlined"
                onClick={() => {
                  setNewName(cat);
                  setAddError("");
                }}
                sx={{ fontSize: "0.65rem", borderRadius: "8px" }}
              />
            ))}
          </Box>
          <TextField
            autoFocus
            fullWidth
            label="اسم الفئة الجديدة"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setAddError("");
            }}
            error={!!addError}
            helperText={addError || "مثال: رخام مستورد، مضخات خرسانة"}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleAdd}>
            حفظ الفئة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
