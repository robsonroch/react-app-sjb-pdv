import type { ReactNode } from "react";
import "../styles/theme.css";

export const GlobalLayout = ({ children }: { children: ReactNode }) => (
  <div className="global-layout">
    <div className="global-content">{children}</div>
  </div>
);
