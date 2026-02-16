import { Link, Route, Routes } from "react-router-dom";
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

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <section className="auth-card">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.username}</p>
      <nav className="auth-links">
        <Link to="/password-change">Alterar senha</Link>
      </nav>
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

function App() {
  return (
    <div className="app-shell">
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

        <Route
          element={<AdminRoute requiredRole="adm-full" requiredPermissions={[]} />}
        >
          <Route path="/admin" element={<AdminPage />} />
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
