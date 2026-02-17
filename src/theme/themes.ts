export type ThemeName = "padroeiro" | "sereno" | "noite";

export type ThemeConfig = {
  label: string;
  backgroundImage: string;
  overlay: string;
  blur: string;
  panelOpacity: number;
  textColor: string;
  panelRgb: string;
  overlayRgb: string;
  backgroundAttachment: "fixed" | "scroll";
};

export const themes: Record<ThemeName, ThemeConfig> = {
  padroeiro: {
    label: "Padroeiro",
    backgroundImage: "url('/watermark-sao-joao.png')",
    overlay: "rgba(248, 250, 252, 0.88)",
    blur: "10px",
    panelOpacity: 0.78,
    textColor: "#1f2937",
    panelRgb: "255 255 255",
    overlayRgb: "248 250 252",
    backgroundAttachment: "fixed",
  },
  sereno: {
    label: "Sereno",
    backgroundImage: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    overlay: "rgba(248, 250, 252, 0.75)",
    blur: "8px",
    panelOpacity: 0.85,
    textColor: "#1f2937",
    panelRgb: "255 255 255",
    overlayRgb: "248 250 252",
    backgroundAttachment: "scroll",
  },
  noite: {
    label: "Noite",
    backgroundImage: "linear-gradient(180deg, #0b1120 0%, #0f172a 100%)",
    overlay: "rgba(2, 6, 23, 0.65)",
    blur: "12px",
    panelOpacity: 0.65,
    textColor: "#e5e7eb",
    panelRgb: "15 23 42",
    overlayRgb: "2 6 23",
    backgroundAttachment: "fixed",
  },
};

export const themeOptions = Object.entries(themes).map(([id, config]) => ({
  id: id as ThemeName,
  label: config.label,
}));
