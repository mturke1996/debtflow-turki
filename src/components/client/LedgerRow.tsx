import { Edit, Delete } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type LedgerRowTone = "debit" | "credit" | "neutral";

type LedgerRowProps = {
  title: string;
  date: string;
  amount: string;
  badge?: string;
  notes?: string;
  tone?: LedgerRowTone;
  onEdit: () => void;
  onDelete: () => void;
  extra?: ReactNode;
};

const toneColor = {
  debit: "error.main",
  credit: "success.main",
  neutral: "text.primary",
} as const;

export const LedgerRow = ({
  title,
  date,
  amount,
  badge,
  notes,
  tone = "neutral",
  onEdit,
  onDelete,
  extra,
}: LedgerRowProps) => (
  <Box
    className="surface-panel pressable"
    sx={{
      px: 2,
      py: 1.75,
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      borderRadius: 1.5,
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
        <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        {badge ? (
          <Chip
            label={badge}
            size="small"
            sx={{ height: 20, fontSize: "0.625rem", fontWeight: 600 }}
          />
        ) : null}
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block">
        {date}
      </Typography>
      {notes ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}
          noWrap
        >
          {notes}
        </Typography>
      ) : null}
      <Typography
        variant="subtitle2"
        fontWeight={800}
        className="num"
        color={toneColor[tone]}
        sx={{ mt: 0.75 }}
      >
        {amount}
      </Typography>
      {extra}
    </Box>
    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
      <IconButton size="small" onClick={onEdit} aria-label="تعديل">
        <Edit sx={{ fontSize: 17 }} />
      </IconButton>
      <IconButton size="small" onClick={onDelete} aria-label="حذف" color="error">
        <Delete sx={{ fontSize: 17 }} />
      </IconButton>
    </Stack>
  </Box>
);
