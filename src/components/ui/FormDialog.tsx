import type { FormEvent, ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  type DialogProps,
} from "@mui/material";

type FormDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitColor?: "primary" | "success" | "error";
  maxWidth?: DialogProps["maxWidth"];
};

export function FormDialog({
  open,
  onClose,
  title,
  subtitle,
  onSubmit,
  children,
  submitLabel = "حفظ",
  cancelLabel = "إلغاء",
  loading = false,
  submitColor = "primary",
  maxWidth = "sm",
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      className="dialog-premium form-dialog"
    >
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ fontWeight: 800, pt: 2.5, pb: subtitle ? 0.5 : 1 }}>
          {title}
        </DialogTitle>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 1, lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        ) : null}
        <DialogContent sx={{ pt: 1.5 }}>{children}</DialogContent>
        <DialogActions className="form-dialog-actions">
          <Button
            type="submit"
            variant="contained"
            color={submitColor}
            disabled={loading}
            className="btn-primary-premium"
            sx={{ fontWeight: 800, flex: 1, maxWidth: 180 }}
          >
            {loading ? "جاري الحفظ..." : submitLabel}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, flex: 1, maxWidth: 180, borderColor: "divider" }}
          >
            {cancelLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
