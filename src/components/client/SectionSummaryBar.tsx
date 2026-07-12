import { PictureAsPdf } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

type SectionSummaryBarProps = {
  label: string;
  total: string;
  onExportPdf?: () => void;
  exportLabel?: string;
};

export const SectionSummaryBar = ({
  label,
  total,
  onExportPdf,
  exportLabel = "PDF",
}: SectionSummaryBarProps) => (
  <Box className="client-section-summary">
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ letterSpacing: "0.04em" }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={900} className="num" sx={{ lineHeight: 1.15, mt: 0.25 }}>
        {total}
      </Typography>
    </Box>
    {onExportPdf ? (
      <Button
        size="small"
        variant="outlined"
        startIcon={<PictureAsPdf sx={{ fontSize: 18 }} />}
        onClick={onExportPdf}
        sx={{
          flexShrink: 0,
          fontWeight: 800,
          borderRadius: 2,
          minHeight: 40,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {exportLabel}
      </Button>
    ) : null}
  </Box>
);
