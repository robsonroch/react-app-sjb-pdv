import { Link, Route, Routes } from "react-router-dom";
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

const Home = () => {
  const { user, logout, hasPermission } = useAuth();

  const hasAdminAccess =
    hasPermission("user:read") ||
    hasPermission("role:read") ||
    hasPermission("role:write") ||
    hasPermission("permission:read") ||
    hasPermission("permission:write");

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

const Unauthorized = () => (
  <section className="auth-card">
    <h1>Acesso negado</h1>
    <p>Você não possui permissão para esta rota.</p>
    <Link to="/">Voltar</Link>
  </section>
);

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
  return (
    <div className="app-shell">
      <ThemeSwitcher />
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
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/:tab?" element={<AdminPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
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
