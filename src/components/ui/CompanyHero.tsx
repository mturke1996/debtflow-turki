import { Box, Stack, Typography, useTheme } from "@mui/material";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { COMPANY_INFO } from "@/constants/companyInfo";

type CompanyHeroProps = {
  greeting?: string;
  compact?: boolean;
};

export const CompanyHero = ({ greeting, compact = false }: CompanyHeroProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      className="surface-panel"
      sx={{
        p: compact ? { xs: 2, sm: 2.5 } : { xs: 2.5, sm: 3 },
        borderRadius: 2,
        bgcolor: isDark ? "background.paper" : "var(--panel)",
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: isDark ? "rgba(45, 212, 191, 0.06)" : "rgba(15, 118, 110, 0.06)",
        }}
      />
      <Stack direction="row" alignItems="center" spacing={2} sx={{ position: "relative" }}>
        <Box sx={{ flexShrink: 0 }}>
          <CompanyLogo
            showText={false}
            size={compact ? Math.round(44 * 1.872) : Math.round(52 * 1.872)}
          />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            className="section-label"
            component="p"
            sx={{ mb: 0.25, color: "text.secondary" }}
          >
            {COMPANY_INFO.tagline}
          </Typography>
          <Typography
            variant={compact ? "h6" : "h5"}
            component="h1"
            fontWeight={800}
            sx={{ textWrap: "balance", letterSpacing: "-0.02em", lineHeight: 1.25 }}
          >
            {COMPANY_INFO.companyName}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ mt: 0.25 }}>
            {COMPANY_INFO.engineerName}
          </Typography>
          {greeting ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {greeting}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};
