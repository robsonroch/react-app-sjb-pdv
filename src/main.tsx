import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./adapters/primary/react/auth/AuthProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { GlobalLayout } from "./layout/GlobalLayout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GlobalLayout>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GlobalLayout>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
