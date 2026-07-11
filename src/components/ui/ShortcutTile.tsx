import { SvgIconComponent } from "@mui/icons-material";
import { ChevronLeft } from "@mui/icons-material";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

type ShortcutTileProps = {
  title: string;
  subtitle: string;
  icon: SvgIconComponent;
  onClick: () => void;
  tone?: "primary" | "success" | "warning" | "neutral";
};

export const ShortcutTile = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  tone = "neutral",
}: ShortcutTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const toneMap = {
    primary: {
      bg: isDark ? "rgba(45, 212, 191, 0.1)" : "rgba(15, 118, 110, 0.08)",
      border: isDark ? "rgba(45, 212, 191, 0.22)" : "rgba(15, 118, 110, 0.16)",
      color: theme.palette.primary.main,
    },
    success: {
      bg: isDark ? "rgba(74, 222, 128, 0.1)" : "rgba(21, 128, 61, 0.08)",
      border: isDark ? "rgba(74, 222, 128, 0.2)" : "rgba(21, 128, 61, 0.14)",
      color: theme.palette.success.main,
    },
    warning: {
      bg: isDark ? "rgba(251, 191, 36, 0.1)" : "rgba(180, 83, 9, 0.08)",
      border: isDark ? "rgba(251, 191, 36, 0.2)" : "rgba(180, 83, 9, 0.14)",
      color: theme.palette.warning.main,
    },
    neutral: {
      bg: isDark ? "rgba(168, 162, 158, 0.08)" : "rgba(28, 25, 23, 0.04)",
      border: theme.palette.divider,
      color: theme.palette.text.secondary,
    },
  }[tone];

  return (
    <Card
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="pressable"
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        cursor: "pointer",
        "&:hover": {
          borderColor: theme.palette.text.secondary,
        },
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: toneMap.bg,
                border: `1px solid ${toneMap.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 22, color: toneMap.color }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <ChevronLeft sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />
        </Box>
      </CardContent>
    </Card>
  );
};
