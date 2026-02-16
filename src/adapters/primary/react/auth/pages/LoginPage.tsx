import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>Entrar</h1>
      <p>Use suas credenciais para acessar.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/password-reset">Esqueci minha senha</Link>
      </div>
    </section>
  );
};
