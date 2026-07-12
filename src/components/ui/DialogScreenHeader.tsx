import { ReactNode } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

type DialogScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  action?: ReactNode;
};

export const DialogScreenHeader = ({
  title,
  subtitle,
  onClose,
  action,
}: DialogScreenHeaderProps) => (
  <Box
    className="dialog-screen-header"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: "max(12px, env(safe-area-inset-left))",
      pr: "max(12px, env(safe-area-inset-right))",
      py: 1.25,
      minHeight: 56,
      borderBottom: 1,
      borderColor: "divider",
      bgcolor: "background.paper",
      flexShrink: 0,
      backdropFilter: "blur(16px) saturate(180%)",
      WebkitBackdropFilter: "blur(16px) saturate(180%)",
    }}
  >
    <IconButton onClick={onClose} aria-label="إغلاق" edge="start">
      <Close />
    </IconButton>
    <Stack sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle1" fontWeight={800} noWrap>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
    {action}
  </Box>
);
