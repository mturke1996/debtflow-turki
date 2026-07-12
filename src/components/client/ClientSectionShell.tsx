import { ReactNode } from "react";
import { Add, ArrowForward } from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { FullScreenPortal } from "@/components/ui/FullScreenPortal";
import { SearchField } from "@/components/ui/SearchField";

type ClientSectionShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  clientName?: string;
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

/** شاشة كاملة حقيقية — تغطي الشاشة بالكامل وليست Dialog منبثقة */
export const ClientSectionShell = ({
  open,
  onClose,
  title,
  clientName,
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
  <FullScreenPortal open={open} className="profile-sheet">
    <header className="profile-sheet__header">
      <div className="profile-sheet__top">
        <IconButton onClick={onClose} aria-label="رجوع" className="profile-sheet__back" size="small">
          <ArrowForward sx={{ fontSize: 20, color: "#fff" }} />
        </IconButton>
        <div className="profile-sheet__titles">
          <p className="profile-sheet__title">{title}</p>
          {clientName ? <p className="profile-sheet__subtitle">{clientName}</p> : null}
        </div>
        <button type="button" className="profile-sheet__add" onClick={onAdd}>
          <Add sx={{ fontSize: 15 }} />
          {addLabel}
        </button>
      </div>

      <div className="profile-sheet__hero">
        <div className="profile-sheet__hero-main">
          <p className="profile-sheet__hero-eyebrow">{summaryLabel}</p>
          <p className="profile-sheet__hero-value num">{summaryTotal}</p>
        </div>
        {onExportPdf ? (
          <Button
            size="small"
            onClick={onExportPdf}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.2)",
              fontWeight: 700,
              bgcolor: "rgba(255,255,255,0.1)",
            }}
            variant="outlined"
          >
            PDF
          </Button>
        ) : null}
      </div>
    </header>

    <div className="profile-sheet__body">
      <div className="profile-sheet__search">
        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          sx={{ mb: 0 }}
        />
      </div>
      <div className="profile-sheet__content">
        <Stack spacing={1.25}>{children}</Stack>
      </div>
    </div>
  </FullScreenPortal>
);
