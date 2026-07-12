import { alpha } from "@mui/material/styles";
import { createTheme, ThemeOptions } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

/**
 * DebtFlow Pro – Premium Finance Design System
 * Warm neutrals + teal primary. Swiss-minimal, RTL-first.
 */
const tokens = {
  light: {
    primary: { main: "#0f766e", light: "#14b8a6", dark: "#0d5c56", contrastText: "#fafaf9" },
    secondary: { main: "#57534e", light: "#78716c", dark: "#44403c", contrastText: "#fafaf9" },
    success: { main: "#15803d", light: "#22c55e", dark: "#166534", contrastText: "#fafafa" },
    warning: { main: "#b45309", light: "#f59e0b", dark: "#92400e", contrastText: "#fafaf9" },
    error: { main: "#b91c1c", light: "#ef4444", dark: "#991b1b", contrastText: "#fafafa" },
    info: { main: "#0369a1", light: "#0ea5e9", dark: "#075985", contrastText: "#fafafa" },
    background: { default: "#f4f3f0", paper: "#fcfbfa", muted: "#ebe9e6" },
    divider: alpha("#1c1917", 0.08),
    text: { primary: "#1c1917", secondary: "#57534e" },
  },
  dark: {
    primary: { main: "#2dd4bf", light: "#5eead4", dark: "#14b8a6", contrastText: "#042f2e" },
    secondary: { main: "#a8a29e", light: "#d6d3d1", dark: "#78716e", contrastText: "#0c0a09" },
    success: { main: "#4ade80", light: "#86efac", dark: "#22c55e", contrastText: "#052e16" },
    warning: { main: "#fbbf24", light: "#fcd34d", dark: "#d97706", contrastText: "#1c1917" },
    error: { main: "#f87171", light: "#fca5a5", dark: "#ef4444", contrastText: "#1c1917" },
    info: { main: "#38bdf8", light: "#7dd3fc", dark: "#0ea5e9", contrastText: "#0c0a09" },
    background: { default: "#0c0f0f", paper: "#141818", muted: "#1c2120" },
    divider: alpha("#f5f5f4", 0.09),
    text: { primary: "#f5f5f4", secondary: "#a8a29e" },
  },
};

const sw = (mode: ThemeMode, y: number, blur: number, opacity: number) => {
  const rgb = mode === "light" ? "28, 25, 23" : "0, 0, 0";
  return `0 ${y}px ${blur}px rgba(${rgb}, ${opacity})`;
};

export const createAppTheme = (mode: ThemeMode) => {
  const t = mode === "light" ? tokens.light : tokens.dark;

  const design: ThemeOptions = {
    direction: "rtl",
    palette: {
      mode,
      primary: t.primary,
      secondary: t.secondary,
      success: t.success,
      warning: t.warning,
      error: t.error,
      info: t.info,
      divider: t.divider,
      background: { default: t.background.default, paper: t.background.paper },
      text: t.text,
    },
    typography: {
      fontFamily: '"Cairo", "Segoe UI", "Tahoma", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 },
      h2: { fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.2 },
      h3: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 },
      h4: { fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.3 },
      h5: { fontWeight: 700, lineHeight: 1.35 },
      h6: { fontWeight: 700, lineHeight: 1.4 },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
      overline: { fontWeight: 600, letterSpacing: "0.12em", fontSize: "0.7rem" },
    },
    shape: { borderRadius: 10 },
    shadows: [
      "none", sw(mode, 1, 2, 0.04), sw(mode, 2, 6, 0.06), sw(mode, 4, 14, 0.07),
      sw(mode, 8, 24, 0.08), sw(mode, 12, 32, 0.09), sw(mode, 16, 40, 0.1),
      sw(mode, 20, 50, 0.11), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
      sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
      sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
      sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
      sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
      sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12), sw(mode, 24, 56, 0.12),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            WebkitTapHighlightColor: "transparent",
          },
          body: {
            scrollBehavior: "smooth",
            WebkitFontSmoothing: "antialiased",
            overscrollBehaviorY: "none",
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
            "&::-webkit-scrollbar": { width: 8, height: 8 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: mode === "light" ? alpha("#57534e", 0.25) : alpha("#a8a29e", 0.25),
              borderRadius: 100,
              border: "2px solid transparent",
              backgroundClip: "padding-box",
              "&:hover": {
                background: mode === "light" ? alpha("#57534e", 0.4) : alpha("#a8a29e", 0.45),
              },
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: 44,
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600,
            transition: "transform 0.15s ease, background-color 0.2s ease",
            "&:focus-visible": { outline: `2px solid ${alpha(t.primary.main, 0.45)}`, outlineOffset: 2 },
            "& .MuiButton-startIcon": { marginInlineEnd: "8px", marginInlineStart: 0 },
            "& .MuiButton-endIcon": { marginInlineStart: "8px", marginInlineEnd: 0 },
          },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: t.primary.dark },
            "&:active": { transform: "scale(0.98)" },
          },
          outlined: {
            borderWidth: "1px",
            "&:hover": { borderWidth: "1px", backgroundColor: alpha(t.primary.main, mode === "light" ? 0.04 : 0.08) },
            "&:active": { transform: "scale(0.98)" },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: 44, minHeight: 44,
            transition: "transform 0.2s cubic-bezier(0.32,0.72,0,1), background-color 0.2s ease",
            "&:hover": { backgroundColor: alpha(t.primary.main, mode === "light" ? 0.08 : 0.12) },
            "&:focus-visible": { outline: `2px solid ${alpha(t.primary.main, 0.45)}`, outlineOffset: 2 },
            "&:active": { transform: "scale(0.92)" },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "none",
            border: mode === "dark" ? `1px solid ${alpha("#f5f5f4", 0.08)}` : `1px solid ${alpha("#1c1917", 0.08)}`,
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { borderRadius: 16, backgroundImage: "none" } },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              "&.Mui-focused": {
                boxShadow: `0 0 0 3px ${alpha(t.primary.main, 0.12)}`,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 100,
            transition: "transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s ease",
            "&:hover": { transform: "scale(1.02)" },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderLeft: mode === "light" ? `1px solid ${alpha("#1c1917", 0.06)}` : `1px solid ${alpha("#f5f5f4", 0.06)}`,
            backgroundColor: t.background.paper,
            backgroundImage: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            paddingTop: "env(safe-area-inset-top, 0px)",
            backgroundColor: mode === "light" ? alpha(t.background.paper, 0.85) : alpha(t.background.paper, 0.8),
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            color: t.text.primary,
            backgroundImage: "none",
            boxShadow: mode === "light"
              ? `0 1px 0 ${alpha("#1c1917", 0.05)}`
              : `0 1px 0 ${alpha("#fff", 0.05)}`,
            borderBottom: mode === "light"
              ? `1px solid ${alpha("#1c1917", 0.06)}`
              : `1px solid ${alpha("#f5f5f4", 0.06)}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 22,
            margin: 16,
            marginBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)",
            boxShadow: mode === "light" ? sw(mode, 20, 50, 0.12) : `0 24px 64px ${alpha("#000", 0.55)}`,
            border: mode === "light" ? `1px solid ${alpha("#1c1917", 0.06)}` : `1px solid ${alpha("#f5f5f4", 0.06)}`,
          },
          container: {
            alignItems: "center",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: 8,
            paddingBottom: 16,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 20px 20px",
            gap: 8,
            "& .MuiButton-root": {
              minWidth: 96,
              borderRadius: 10,
            },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 800,
            fontSize: "1.15rem",
            letterSpacing: "-0.02em",
            paddingBottom: 8,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            fontSize: "0.8125rem",
            padding: "8px 14px",
            fontWeight: 500,
            backgroundColor: mode === "light" ? "#1c1917" : "#f5f5f4",
            color: mode === "light" ? "#fafaf9" : "#1c1917",
            boxShadow: sw(mode, 4, 12, 0.15),
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: sw(mode, 4, 16, 0.15),
            "&:hover": { boxShadow: sw(mode, 8, 28, 0.2), transform: "translateY(-2px)" },
            "&:active": { transform: "scale(0.95)" },
            transition: "transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s ease",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 14, fontWeight: 500 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.02em",
              color: t.text.secondary,
              borderBottom: `2px solid ${t.divider}`,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "background-color 0.2s ease, transform 0.15s ease",
            "&:active": { transform: "scale(0.98)" },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            marginTop: 6,
            minWidth: 180,
            boxShadow: sw(mode, 8, 28, 0.12),
            border: mode === "light" ? `1px solid ${alpha("#1c1917", 0.06)}` : `1px solid ${alpha("#f5f5f4", 0.08)}`,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            backgroundImage: "none",
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 0,
            padding: "6px 0 8px",
            transition: "color 0.2s ease, transform 0.15s ease",
            "&.Mui-selected": {
              transform: "translateY(-1px)",
            },
          },
          label: {
            fontSize: "0.65rem",
            fontWeight: 600,
            "&.Mui-selected": { fontSize: "0.65rem" },
          },
        },
      },
    },
  };

  return createTheme(design);
};
