import { SvgIconComponent } from "@mui/icons-material";
import { ChevronLeft } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Typography, useTheme, alpha } from "@mui/material";

export type ShortcutTileTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "neutral";

type ShortcutTileProps = {
  title: string;
  subtitle: string;
  icon: SvgIconComponent;
  onClick: () => void;
  tone?: ShortcutTileTone;
  badge?: string;
  highlight?: boolean;
};

export const ShortcutTile = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  tone = "neutral",
  badge,
  highlight = false,
}: ShortcutTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const toneMap = {
    primary: {
      bg: isDark ? "rgba(45, 212, 191, 0.12)" : "rgba(15, 118, 110, 0.08)",
      border: isDark ? "rgba(45, 212, 191, 0.25)" : "rgba(15, 118, 110, 0.18)",
      color: theme.palette.primary.main,
      gradient: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
      glow: "0 4px 14px rgba(15, 118, 110, 0.25)",
    },
    success: {
      bg: isDark ? "rgba(74, 222, 128, 0.12)" : "rgba(21, 128, 61, 0.08)",
      border: isDark ? "rgba(74, 222, 128, 0.25)" : "rgba(21, 128, 61, 0.18)",
      color: theme.palette.success.main,
      gradient: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
      glow: "0 4px 14px rgba(22, 163, 74, 0.25)",
    },
    warning: {
      bg: isDark ? "rgba(251, 191, 36, 0.12)" : "rgba(180, 83, 9, 0.08)",
      border: isDark ? "rgba(251, 191, 36, 0.25)" : "rgba(180, 83, 9, 0.18)",
      color: theme.palette.warning.main,
      gradient: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
      glow: "0 4px 14px rgba(217, 119, 6, 0.25)",
    },
    error: {
      bg: isDark ? "rgba(248, 113, 113, 0.12)" : "rgba(220, 38, 38, 0.08)",
      border: isDark ? "rgba(248, 113, 113, 0.25)" : "rgba(220, 38, 38, 0.18)",
      color: theme.palette.error.main,
      gradient: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
      glow: "0 4px 14px rgba(220, 38, 38, 0.25)",
    },
    info: {
      bg: isDark ? "rgba(56, 189, 248, 0.12)" : "rgba(2, 132, 199, 0.08)",
      border: isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(2, 132, 199, 0.18)",
      color: theme.palette.info.main,
      gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
      glow: "0 4px 14px rgba(2, 132, 199, 0.25)",
    },
    purple: {
      bg: isDark ? "rgba(168, 85, 247, 0.12)" : "rgba(126, 34, 206, 0.08)",
      border: isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(126, 34, 206, 0.18)",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
      glow: "0 4px 14px rgba(139, 92, 246, 0.25)",
    },
    neutral: {
      bg: isDark ? "rgba(168, 162, 158, 0.08)" : "rgba(28, 25, 23, 0.04)",
      border: theme.palette.divider,
      color: theme.palette.text.secondary,
      gradient: "linear-gradient(135deg, #57534e 0%, #78716c 100%)",
      glow: "none",
    },
  }[tone];

  return (
    <Card
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="pressable"
      sx={{
        borderRadius: "16px",
        border: `1px solid ${
          highlight
            ? toneMap.border
            : isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.08)"
        }`,
        bgcolor: highlight
          ? toneMap.bg
          : isDark
            ? alpha(theme.palette.background.paper, 0.6)
            : "#ffffff",
        backdropFilter: "blur(8px)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        boxShadow: highlight
          ? isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(15, 118, 110, 0.08)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.2)"
            : "0 2px 8px rgba(0,0,0,0.03)",
        transition:
          "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, border-color 200ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: toneMap.color,
            boxShadow: isDark
              ? "0 10px 24px -4px rgba(0,0,0,0.45)"
              : "0 10px 24px -4px rgba(0,0,0,0.08)",
            "& .chevron-icon": {
              transform: "translateX(-3px)",
              color: toneMap.color,
            },
          },
        },
        "&:active": {
          transform: "scale(0.985)",
        },
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: toneMap.gradient,
                boxShadow: toneMap.glow,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                color: "#ffffff",
                transition: "transform 200ms ease",
              }}
            >
              <Icon sx={{ fontSize: 22, color: "#ffffff" }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {title}
                </Typography>
                {badge && (
                  <Chip
                    label={badge}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      bgcolor: toneMap.bg,
                      color: toneMap.color,
                      border: `1px solid ${toneMap.border}`,
                      borderRadius: "6px",
                      px: 0.25,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  opacity: 0.9,
                }}
                noWrap
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <ChevronLeft
            className="chevron-icon"
            sx={{
              color: "text.disabled",
              fontSize: 22,
              flexShrink: 0,
              transition: "transform 200ms ease, color 200ms ease",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
