import { useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { getTheme, type ThemeName } from "./themes";
import { ThemeContext, type ThemeContextValue } from "./themeContext";

const STORAGE_KEY = "ui.theme";

const readStoredTheme = (): ThemeName => {
  if (typeof window === "undefined") {
    return "padroeiro";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return stored ?? "padroeiro";
};

export const ThemeController = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    readStoredTheme(),
  );

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, name);
    }
  };

  const theme = useMemo(() => getTheme(themeName), [themeName]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeName, setThemeName: setTheme }),
    [themeName],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.theme = themeName;
    }
  }, [themeName]);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
