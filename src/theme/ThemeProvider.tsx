import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ThemeContext } from "./ThemeContext";
import { themes, type ThemeName } from "./themes";

const STORAGE_KEY = "ui.theme";
const PANEL_OPACITY_KEY = "ui.panelOpacity";

const readStoredTheme = (): ThemeName => {
  if (typeof window === "undefined") {
    return "padroeiro";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return stored ?? "padroeiro";
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    readStoredTheme(),
  );
  const [panelOpacity, setPanelOpacity] = useState<number>(() => {
    if (typeof window === "undefined") {
      return themes.padroeiro.panelOpacity;
    }
    const stored = window.localStorage.getItem(PANEL_OPACITY_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed)
      ? Math.min(0.98, Math.max(0, parsed))
      : themes.padroeiro.panelOpacity;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, themeName);
    }
  }, [themeName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PANEL_OPACITY_KEY, String(panelOpacity));
    }
  }, [panelOpacity]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const theme = themes[themeName];
    root.dataset.theme = themeName;
    root.style.setProperty("--theme-background", theme.backgroundImage);
    root.style.setProperty("--theme-overlay", theme.overlay);
    root.style.setProperty("--theme-blur", theme.blur);
    const effectiveOpacity = panelOpacity ?? theme.panelOpacity;
    root.style.setProperty("--theme-panel-opacity", String(effectiveOpacity));
    root.dataset.panelOpacity = effectiveOpacity === 0 ? "0" : "1";
    root.style.setProperty("--theme-text-color", theme.textColor);
    root.style.setProperty("--theme-panel-rgb", theme.panelRgb);
    root.style.setProperty("--theme-overlay-rgb", theme.overlayRgb);
    root.style.setProperty("--theme-bg-attachment", theme.backgroundAttachment);
  }, [themeName, panelOpacity]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeName === "noite" ? "dark" : "light",
          primary: { main: themeName === "noite" ? "#60a5fa" : "#2563eb" },
          secondary: {
            main: themeName === "padroeiro" ? "#f59e0b" : "#10b981",
          },
          background: {
            default: themeName === "noite" ? "#0b1120" : "#f8fafc",
            paper: themeName === "noite" ? "#0f172a" : "#ffffff",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: [
            "Inter",
            "system-ui",
            "-apple-system",
            "sans-serif",
          ].join(","),
        },
      }),
    [themeName],
  );

  const value = useMemo(
    () => ({ themeName, setThemeName, panelOpacity, setPanelOpacity }),
    [themeName, panelOpacity],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
