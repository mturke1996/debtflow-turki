import { Theme, alpha } from "@mui/material/styles";
import { SvgIconComponent } from "@mui/icons-material";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

export type KpiTone = "error" | "success" | "secondary" | "warning" | "info" | "primary";

type ToneStyle = {
  bg: string;
  fg: string;
  border: string;
  iconGradient: string;
  iconShadow: string;
};

function resolveTone(theme: Theme, tone: KpiTone): ToneStyle {
  const isDark = theme.palette.mode === "dark";
  const p = theme.palette;

  const map: Record<KpiTone, ToneStyle> = {
    primary: {
      bg: isDark ? alpha(p.primary.main, 0.1) : "var(--accent-soft)",
      fg: isDark ? p.primary.light : "var(--accent-text)",
      border: isDark ? alpha(p.primary.main, 0.22) : alpha(p.primary.main, 0.14),
      iconGradient: isDark
        ? `linear-gradient(145deg, ${p.primary.dark} 0%, ${p.primary.main} 100%)`
        : `linear-gradient(145deg, ${p.primary.main} 0%, ${p.primary.dark} 100%)`,
      iconShadow: `0 8px 20px ${alpha(p.primary.main, 0.32)}`,
    },
    success: {
      bg: isDark ? alpha(p.success.main, 0.1) : "var(--pastel-green-bg)",
      fg: isDark ? p.success.light : "var(--pastel-green-fg)",
      border: isDark ? alpha(p.success.main, 0.2) : alpha(p.success.main, 0.14),
      iconGradient: isDark
        ? `linear-gradient(145deg, ${p.success.dark} 0%, ${p.success.main} 100%)`
        : `linear-gradient(145deg, ${p.success.main} 0%, ${p.success.dark} 100%)`,
      iconShadow: `0 8px 20px ${alpha(p.success.main, 0.3)}`,
    },
    warning: {
      bg: isDark ? alpha(p.warning.main, 0.1) : "var(--pastel-amber-bg)",
      fg: isDark ? p.warning.light : "var(--pastel-amber-fg)",
      border: isDark ? alpha(p.warning.main, 0.2) : alpha(p.warning.main, 0.16),
      iconGradient: isDark
        ? `linear-gradient(145deg, ${p.warning.dark} 0%, ${p.warning.main} 100%)`
        : `linear-gradient(145deg, ${p.warning.main} 0%, ${p.warning.dark} 100%)`,
      iconShadow: `0 8px 20px ${alpha(p.warning.main, 0.28)}`,
    },
    error: {
      bg: isDark ? alpha(p.error.main, 0.1) : "var(--pastel-red-bg)",
      fg: isDark ? p.error.light : "var(--pastel-red-fg)",
      border: isDark ? alpha(p.error.main, 0.2) : alpha(p.error.main, 0.14),
      iconGradient: isDark
        ? `linear-gradient(145deg, ${p.error.dark} 0%, ${p.error.main} 100%)`
        : `linear-gradient(145deg, ${p.error.main} 0%, ${p.error.dark} 100%)`,
      iconShadow: `0 8px 20px ${alpha(p.error.main, 0.28)}`,
    },
    info: {
      bg: isDark ? alpha(p.info.main, 0.1) : "var(--pastel-blue-bg)",
      fg: isDark ? p.info.light : "var(--pastel-blue-fg)",
      border: isDark ? alpha(p.info.main, 0.2) : alpha(p.info.main, 0.14),
      iconGradient: isDark
        ? `linear-gradient(145deg, ${p.info.dark} 0%, ${p.info.main} 100%)`
        : `linear-gradient(145deg, ${p.info.main} 0%, ${p.info.dark} 100%)`,
      iconShadow: `0 8px 20px ${alpha(p.info.main, 0.28)}`,
    },
    secondary: {
      bg: isDark ? alpha("#fff", 0.04) : "rgba(28, 25, 23, 0.04)",
      fg: p.text.secondary,
      border: p.divider,
      iconGradient: isDark
        ? "linear-gradient(145deg, #57534e 0%, #78716c 100%)"
        : "linear-gradient(145deg, #78716c 0%, #57534e 100%)",
      iconShadow: "0 8px 20px rgba(28, 25, 23, 0.12)",
    },
  };
  return map[tone];
}

type KpiCardProps = {
  icon: SvgIconComponent;
  label: string;
  value: string | number;
  tone?: KpiTone;
};

export const KpiCard = ({ icon: IconCmp, label, value, tone = "primary" }: KpiCardProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = resolveTone(theme, tone);

  return (
    <Card
      elevation={0}
      className="pressable"
      sx={{
        height: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: isDark ? alpha("#fff", 0.03) : "#fff",
        border: `1px solid ${t.border}`,
        boxShadow: isDark
          ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 32px rgba(0,0,0,0.28)"
          : "0 1px 0 rgba(255,255,255,0.92) inset, 0 1px 2px rgba(25, 34, 29, 0.03), 0 8px 24px rgba(25, 34, 29, 0.05)",
        transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms ease",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: isDark
              ? "0 1px 0 rgba(255,255,255, 0.07) inset, 0 18px 36px -10px rgba(0,0,0,0.5)"
              : "0 1px 0 rgba(255,255,255,1) inset, 0 18px 36px -10px rgba(25,34,29,0.12)",
          },
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.25,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ fontSize: "0.76rem", letterSpacing: "0.03em", lineHeight: 1.2, flex: 1 }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              background: t.iconGradient,
              boxShadow: `${t.iconShadow}, 0 1px 0 rgba(255,255,255,0.22) inset`,
              flexShrink: 0,
            }}
          >
            <IconCmp sx={{ fontSize: 19, color: "#fff" }} />
          </Box>
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          className="num"
          sx={{ fontSize: { xs: "1rem", sm: "1.125rem" }, lineHeight: 1.2, pr: 0.25 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

type MiniStatProps = {
  icon: SvgIconComponent;
  label: string;
  value: number;
  tone?: KpiTone;
};

export const MiniStatCard = ({ icon: IconCmp, label, value, tone = "primary" }: MiniStatProps) => {
  const theme = useTheme();
  const t = resolveTone(theme, tone);

  return (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: "100%", borderRadius: "16px" }}>
      <CardContent sx={{ py: 2, px: 1.5, textAlign: "center" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: t.iconGradient,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            boxShadow: t.iconShadow,
          }}
        >
          <IconCmp sx={{ fontSize: 18, color: "#fff" }} />
        </Box>
        <Typography variant="h5" fontWeight={800} className="num">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};
