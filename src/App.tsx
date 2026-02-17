import { Link, Navigate, Route, Routes } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import "./App.css";
import { ProtectedRoute } from "./adapters/primary/react/auth/ProtectedRoute";
import { LoginPage } from "./adapters/primary/react/auth/pages/LoginPage";
import { PreSignupPage } from "./adapters/primary/react/auth/pages/PreSignupPage";
import { CompleteSignupPage } from "./adapters/primary/react/auth/pages/CompleteSignupPage";
import { PreSignupValidateRedirect } from "./adapters/primary/react/auth/pages/PreSignupValidateRedirect";
import { PasswordChangePage } from "./adapters/primary/react/auth/pages/PasswordChangePage";
import { PasswordResetPage } from "./adapters/primary/react/auth/pages/PasswordResetPage";
import { AdminRoute } from "./adapters/primary/react/auth/AdminRoute";
import { useAuth } from "./adapters/primary/react/auth/useAuth";
import { AdminPage } from "./pages/admin/AdminPage";
import { themeOptions, type ThemeName } from "./theme/themes";
import { useTheme } from "./theme/ThemeContext";
import { createAdminApi } from "./services/adminApi";
import type { AdminMeResponse } from "./services/adminTypes";
import { useEffect, useState } from "react";
import { debugLog } from "./utils/logger";

const normalizeResource = (resource: string) => {
  const lower = resource.toLowerCase();

  if (lower.includes("user")) {
    return "user";
  }
  if (lower.includes("role")) {
    return "role";
  }
  if (lower.includes("permission")) {
    return "permission";
  }

  return lower
    .replace(/\{.*?\}/g, "")
    .replace(/^\/+/, "")
    .split("/")[0];
};

const normalizeAction = (action: string) => {
  const lower = action.toLowerCase();

  if (
    lower.includes("write") ||
    lower.includes("create") ||
    lower.includes("criar") ||
    lower.includes("manage") ||
    lower.includes("update") ||
    lower.includes("atualiza") ||
    lower.includes("editar") ||
    lower.includes("delete") ||
    lower.includes("excluir") ||
    lower.includes("remover")
  ) {
    return "write";
  }

  if (
    lower.includes("read") ||
    lower.includes("list") ||
    lower.includes("lista") ||
    lower.includes("busca") ||
    lower.includes("buscar") ||
    lower.includes("listar")
  ) {
    return "read";
  }

  return lower;
};

const buildAuthorities = (me?: AdminMeResponse | null) =>
  (me?.permissions ?? []).map((permission) => {
    const resource = normalizeResource(permission.resource);
    const action = normalizeAction(permission.action);
    return `${resource}:${action}`;
  });

const hasAdminModuleAccess = (me?: AdminMeResponse | null) => {
  const authorities = buildAuthorities(me);
  return (
    authorities.includes("user:read") ||
    authorities.includes("user:write") ||
    authorities.includes("role:read") ||
    authorities.includes("role:write") ||
    authorities.includes("permission:read") ||
    authorities.includes("permission:write")
  );
};

const useAdminMe = () => {
  const { isAuthenticated, logout } = useAuth();
  const [adminMe, setAdminMe] = useState<AdminMeResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAdminMe(null);
      return;
    }

    let active = true;
    const api = createAdminApi({
      onUnauthorized: () => logout(),
    });

    api
      .getMe()
      .then((me) => {
        if (active) {
          setAdminMe(me);
          debugLog("app.adminMe", me);
        }
      })
      .catch(() => {
        if (active) {
          setAdminMe(null);
          debugLog("app.adminMe.error");
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, logout]);

  return adminMe;
};

const hasAdminModuleAccessFromToken = (
  hasPermission: (permission: string) => boolean,
) =>
  hasPermission("user:read") ||
  hasPermission("user:write") ||
  hasPermission("role:read") ||
  hasPermission("role:write") ||
  hasPermission("permission:read") ||
  hasPermission("permission:write");

const Dashboard = ({ adminMe }: { adminMe: AdminMeResponse | null }) => {
  const { user, logout, hasPermission } = useAuth();
  const hasAdminAccess =
    hasAdminModuleAccess(adminMe) ||
    hasAdminModuleAccessFromToken(hasPermission);
  const hasSalesReport = hasPermission("report:read:sales");

  return (
    <section className="auth-card">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.username}</p>
      <nav className="auth-links">
        {hasAdminAccess && <Link to="/admin">Administração</Link>}
        {hasSalesReport && <Link to="/reports/sales">Relatório de vendas</Link>}
        <Link to="/password-change">Alterar senha</Link>
      </nav>
      <div className="auth-section">
        <h2>Permissões</h2>
        <div className="chip-cell">
          {(user?.permissions ?? []).map((permission) => (
            <span key={permission.name} className="chip">
              {permission.name}
            </span>
          ))}
        </div>
      </div>
      <div className="auth-section">
        <h2>Roles</h2>
        <div className="chip-cell">
          {(user?.roles ?? []).map((role) => (
            <span key={role.name} className="chip">
              {role.name}
            </span>
          ))}
        </div>
      </div>
      <button onClick={logout}>Sair</button>
    </section>
  );
};

const PublicLanding = () => (
  <section className="auth-card">
    <h1>Portal de acesso</h1>
    <p>Escolha uma opção para continuar.</p>
    <nav className="auth-links">
      <Link to="/login">Login</Link>
      <Link to="/pre-signup">Pré-cadastro</Link>
      <Link to="/complete-signup">Completar cadastro</Link>
    </nav>
  </section>
);

const SalesReport = () => (
  <section className="auth-card">
    <h1>Relatório de vendas</h1>
    <p>Conteúdo protegido por permissão.</p>
  </section>
);

const AppNav = ({ adminMe }: { adminMe: AdminMeResponse | null }) => {
  const { isAuthenticated, logout, hasPermission } = useAuth();
  if (!isAuthenticated) {
    return null;
  }
  const canSeeAdmin =
    hasAdminModuleAccess(adminMe) ||
    hasAdminModuleAccessFromToken(hasPermission);

  return (
    <nav className="app-nav glass-panel">
      <div className="app-nav-links">
        <Link to="/dashboard">Dashboard</Link>
        {canSeeAdmin && <Link to="/admin">Administração</Link>}
      </div>
      <button onClick={logout}>Sair</button>
    </nav>
  );
};

const ThemeSwitcher = () => {
  const { themeName, setThemeName, panelOpacity, setPanelOpacity } = useTheme();

  return (
    <div className="app-toolbar">
      <div className="theme-controls glass-panel">
        <FormControl size="small" className="theme-control">
          <InputLabel id="theme-select-label">Tema</InputLabel>
          <Select
            labelId="theme-select-label"
            value={themeName}
            label="Tema"
            onChange={(event) => setThemeName(event.target.value as ThemeName)}
          >
            {themeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="theme-control theme-slider">
          <Typography variant="caption">Suavização</Typography>
          <Slider
            min={0}
            max={0.95}
            step={0.05}
            value={panelOpacity}
            onChange={(_, value) => setPanelOpacity(value as number)}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
    </div>
  );
};

function App() {
  const adminMe = useAdminMe();
  return (
    <div className="app-shell">
      <ThemeSwitcher />
      <AppNav adminMe={adminMe} />
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pre-signup" element={<PreSignupPage />} />
        <Route
          path="/auth/pre-signup/validate"
          element={<PreSignupValidateRedirect />}
        />
        <Route path="/password-change" element={<PasswordChangePage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/complete-signup" element={<CompleteSignupPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/:tab?" element={<AdminPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard adminMe={adminMe} />} />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route
          element={<ProtectedRoute requiredPermission="report:read:sales" />}
        >
          <Route path="/reports/sales" element={<SalesReport />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
