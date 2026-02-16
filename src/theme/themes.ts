import { createTheme } from "@mui/material/styles";

export type ThemeName = "padroeiro" | "sereno" | "noite";

export const THEME_OPTIONS: { id: ThemeName; label: string }[] = [
  { id: "padroeiro", label: "Padroeiro" },
  { id: "sereno", label: "Sereno" },
  { id: "noite", label: "Noite" },
];

const baseTypography = {
  fontFamily: ["Inter", "system-ui", "-apple-system", "sans-serif"].join(","),
};

export const getTheme = (name: ThemeName) => {
  switch (name) {
    case "noite":
      return createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#60a5fa" },
          secondary: { main: "#f59e0b" },
          background: {
            default: "#0f172a",
            paper: "#111827",
          },
        },
        typography: baseTypography,
        shape: { borderRadius: 12 },
      });
    case "sereno":
      return createTheme({
        palette: {
          mode: "light",
          primary: { main: "#2563eb" },
          secondary: { main: "#10b981" },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
        },
        typography: baseTypography,
        shape: { borderRadius: 12 },
      });
    case "padroeiro":
    default:
      return createTheme({
        palette: {
          mode: "light",
          primary: { main: "#1d4ed8" },
          secondary: { main: "#f59e0b" },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
        },
        typography: baseTypography,
        shape: { borderRadius: 12 },
      });
  }
};
