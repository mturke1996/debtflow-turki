import { ReactNode } from "react";
import { Card, CardContent, CardProps, SxProps, Theme } from "@mui/material";

type AppCardProps = CardProps & {
  children: ReactNode;
  padding?: number;
  hover?: boolean;
  contentSx?: SxProps<Theme>;
};

export const AppCard = ({
  children,
  padding = 2.5,
  hover = false,
  contentSx,
  sx,
  ...rest
}: AppCardProps) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 2,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      bgcolor: "background.paper",
      transition: hover
        ? "box-shadow 0.25s cubic-bezier(0.32,0.72,0,1), transform 0.25s cubic-bezier(0.32,0.72,0,1), border-color 0.2s ease"
        : undefined,
      ...(hover && {
        "&:hover": {
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(45, 212, 191, 0.22)"
              : "rgba(15, 118, 110, 0.18)",
        },
      }),
      ...sx,
    }}
    {...rest}
  >
    <CardContent sx={{ p: padding, "&:last-child": { pb: padding }, ...contentSx }}>
      {children}
    </CardContent>
  </Card>
);
