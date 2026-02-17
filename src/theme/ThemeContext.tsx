import { createContext, useContext } from "react";
import type { ThemeName } from "./themes";

export type ThemeContextValue = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  panelOpacity: number;
  setPanelOpacity: (value: number) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
