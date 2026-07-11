import { ReactNode } from "react";
import {
  Box,
  Container,
  IconButton,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  backTo?: string;
  action?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | false;
};

export const PageHeader = ({
  title,
  subtitle,
  kicker,
  backTo,
  action,
  maxWidth = "lg",
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const content = (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        {backTo !== undefined && (
          <IconButton
            aria-label="رجوع"
            size="small"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            sx={{ mt: 0.25, marginLeft: "4px" }}
          >
            <ArrowForward fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {kicker && (
            <Typography
              className="section-label"
              component="p"
              sx={{ mb: 0.75, color: "text.secondary" }}
            >
              {kicker}
            </Typography>
          )}
          <Typography
            variant="h5"
            component="h1"
            fontWeight={800}
            sx={{ letterSpacing: "-0.02em", textWrap: "balance" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Divider sx={{ mt: 2.5 }} />
    </Box>
  );

  if (maxWidth === false) return content;

  return (
    <Container maxWidth={maxWidth} disableGutters>
      {content}
    </Container>
  );
};

type PageShellProps = {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

export const PageShell = ({ children, maxWidth = "lg" }: PageShellProps) => (
  <Container maxWidth={maxWidth} sx={{ pb: 4 }}>
    {children}
  </Container>
);

export const PageSectionTitle = ({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ mb: 1.5 }}
  >
    <Typography
      variant="overline"
      sx={{ color: "text.secondary", letterSpacing: "0.06em", fontWeight: 600 }}
    >
      {title}
    </Typography>
    {action}
  </Stack>
);
