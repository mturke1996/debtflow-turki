import { ReactNode } from "react";
import { Box, Stack } from "@mui/material";
import { PageHeader, PageSectionTitle } from "./PageHeader";

type ListPageLayoutProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
  filters?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  children: ReactNode;
};

export const ListPageLayout = ({
  title,
  subtitle,
  kicker,
  action,
  filters,
  children,
}: ListPageLayoutProps) => (
  <Stack spacing={3}>
    <PageHeader
      title={title}
      subtitle={subtitle}
      kicker={kicker}
      action={action}
      maxWidth={false}
    />
    {filters && <Box>{filters}</Box>}
    <Box>{children}</Box>
  </Stack>
);

export { PageSectionTitle };
