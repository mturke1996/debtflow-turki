import { Box, alpha, useTheme } from "@mui/material";
import { Add } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const NAV_HEIGHT = 64;

type ExpenseFabProps = {
  onClick: () => void;
};

export const ExpenseFab = ({ onClick }: ExpenseFabProps) => {
  const theme = useTheme();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";

  if (location.pathname === "/invoices/new") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: (t) => t.zIndex.speedDial,
        insetInlineEnd: 16,
        bottom: {
          xs: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 14px)`,
          md: 24,
        },
        display: { xs: "block", md: "block" },
      }}
    >
      <Box
        component={motion.button}
        type="button"
        onClick={onClick}
        aria-label="مصروف جديد"
        whileTap={{ scale: 0.92 }}
        sx={{
          width: 58,
          height: 58,
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background: isDark
            ? `linear-gradient(180deg, #0d9488 0%, ${alpha("#0f766e", 0.95)} 100%)`
            : `linear-gradient(180deg, #0f766e 0%, #0d5c56 100%)`,
          boxShadow: isDark
            ? "0 8px 28px rgba(45, 212, 191, 0.22)"
            : "0 8px 24px rgba(15, 118, 110, 0.32)",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 3,
          },
        }}
      >
        <Add sx={{ fontSize: 28 }} />
      </Box>
    </Box>
  );
};
