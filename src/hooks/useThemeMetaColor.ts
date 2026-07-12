import { useEffect } from "react";
import type { ThemeMode } from "@/theme";

const THEME_COLORS: Record<ThemeMode, string> = {
  light: "#0f766e",
  dark: "#0c0f0f",
};

export function useThemeMetaColor(mode: ThemeMode) {
  useEffect(() => {
    const color = THEME_COLORS[mode];
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute(
      "content",
      mode === "dark" ? "black-translucent" : "default"
    );
  }, [mode]);
}
