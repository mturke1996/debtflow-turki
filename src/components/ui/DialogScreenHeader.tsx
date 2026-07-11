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
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1.5,
      borderBottom: 1,
      borderColor: "divider",
      bgcolor: "background.paper",
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
