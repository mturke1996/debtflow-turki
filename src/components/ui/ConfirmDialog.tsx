import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
        className="dialog-premium"
        PaperProps={{ sx: { mx: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, fontWeight: 800, pt: 2.5 }}>
          <WarningAmber
            fontSize="small"
            color={options.tone === "danger" ? "error" : "warning"}
            sx={{ opacity: 0.9 }}
          />
          {options.title ?? "تأكيد"}
        </DialogTitle>
        <DialogContent sx={{ px: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
            {options.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0, flexDirection: "row-reverse" }}>
          <Button
            variant="contained"
            color={options.tone === "danger" ? "error" : "primary"}
            onClick={() => close(true)}
            className="btn-primary-premium"
            sx={{ fontWeight: 800, flex: 1, maxWidth: 160 }}
          >
            {options.confirmLabel ?? "تأكيد"}
          </Button>
          <Button
            onClick={() => close(false)}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, flex: 1, maxWidth: 160, borderColor: "divider" }}
          >
            {options.cancelLabel ?? "إلغاء"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}
