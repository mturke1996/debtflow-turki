import { ReactNode } from "react";
import { Add } from "@mui/icons-material";
import { Box, Button, Dialog, Stack } from "@mui/material";
import { DialogScreenHeader } from "@/components/ui/DialogScreenHeader";
import { SearchField } from "@/components/ui/SearchField";
import { SectionSummaryBar } from "@/components/client/SectionSummaryBar";

type ClientSectionShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder: string;
  summaryLabel: string;
  summaryTotal: string;
  onAdd: () => void;
  addLabel?: string;
  onExportPdf?: () => void;
  children: ReactNode;
};

export const ClientSectionShell = ({
  open,
  onClose,
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  summaryLabel,
  summaryTotal,
  onAdd,
  addLabel = "جديد",
  onExportPdf,
  children,
}: ClientSectionShellProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullScreen
    sx={{ "& .MuiDialog-paper": { bgcolor: "background.default" } }}
  >
    <DialogScreenHeader
      title={title}
      onClose={onClose}
      action={
        <Button variant="contained" size="small" onClick={onAdd} startIcon={<Add />}>
          {addLabel}
        </Button>
      }
    />

    <SectionSummaryBar label={summaryLabel} total={summaryTotal} onExportPdf={onExportPdf} />

    <Box sx={{ px: 2, pb: 1 }}>
      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        sx={{ mb: 0 }}
      />
    </Box>

    <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 3 }}>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  </Dialog>
);
