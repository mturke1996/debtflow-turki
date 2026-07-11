import { Box, Typography, TypographyProps } from "@mui/material";
import { COMPANY_INFO } from "@/constants/companyInfo";

type CompanyLogoProps = {
  size?: number;
  showText?: boolean;
  variant?: "sidebar" | "hero" | "compact";
};

const sizeMap = {
  sidebar: 40,
  hero: 72,
  compact: 32,
} as const;

export const CompanyLogo = ({
  size,
  showText = true,
  variant = "sidebar",
}: CompanyLogoProps) => {
  const px = size ?? sizeMap[variant];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, minWidth: 0 }}>
      <Box
        component="img"
        src={COMPANY_INFO.logoSrc}
        alt={COMPANY_INFO.logoAlt}
        sx={{
          width: px,
          height: px,
          objectFit: "contain",
          flexShrink: 0,
          borderRadius: 1,
        }}
      />
      {showText && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 800, fontSize: "0.875rem", lineHeight: 1.35 }}
          >
            {COMPANY_INFO.companyName}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "secondary.main",
              fontWeight: 600,
              fontSize: "0.68rem",
              display: "block",
            }}
          >
            {COMPANY_INFO.engineerName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const CompanyContactLine = (props: TypographyProps) => (
  <Typography variant="caption" color="text.secondary" {...props}>
    {COMPANY_INFO.addressSingle} · {COMPANY_INFO.phones[0]}
  </Typography>
);

export const CompanyBlock = ({ dense = false }: { dense?: boolean }) => (
  <Box sx={{ textAlign: "center" }}>
    <CompanyLogo size={dense ? 56 : 72} variant="hero" />
    <Typography
      variant={dense ? "h6" : "h5"}
      fontWeight={800}
      sx={{ mt: 2, letterSpacing: "-0.02em" }}
    >
      {COMPANY_INFO.companyName}
    </Typography>
    <Typography variant="body2" color="secondary.main" fontWeight={700} sx={{ mt: 0.5 }}>
      {COMPANY_INFO.engineerName}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
      {COMPANY_INFO.tagline}
    </Typography>
    <CompanyContactLine sx={{ mt: 1, display: "block" }} />
  </Box>
);
