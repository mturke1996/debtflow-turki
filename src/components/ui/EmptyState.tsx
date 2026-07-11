import { SvgIconComponent } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { AppCard } from "./AppCard";

type EmptyStateProps = {
  icon: SvgIconComponent;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <AppCard>
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Icon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 360, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  </AppCard>
);
