import { createContext, useContext } from "react";
import type { ThemeName } from "./themes";

export type ThemeContextValue = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useThemeController = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeController must be used within ThemeController");
  }
  return context;
};
