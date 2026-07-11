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
  exportLabel = "تصدير PDF",
}: SectionSummaryBarProps) => (
  <Box
    sx={{
      mx: 2,
      mb: 1.5,
      px: 2,
      py: 1.5,
      borderRadius: 1.5,
      border: 1,
      borderColor: "divider",
      bgcolor: "background.default",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} className="num">
        {total}
      </Typography>
    </Box>
    {onExportPdf ? (
      <Button
        size="small"
        variant="outlined"
        startIcon={<PictureAsPdf />}
        onClick={onExportPdf}
        sx={{ flexShrink: 0, fontWeight: 700 }}
      >
        {exportLabel}
      </Button>
    ) : null}
  </Box>
);
