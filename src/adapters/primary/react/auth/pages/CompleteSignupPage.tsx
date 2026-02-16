import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFacade } from "../useAuthFacade";
import { usePreSignupValidation } from "../usePreSignupValidation";

export const CompleteSignupPage = () => {
  const { completeSignup } = useAuthFacade();
  const validation = usePreSignupValidation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setMessage(null);

    if (!validation.id || !validation.token) {
      setStatus("error");
      setMessage("Link inválido ou expirado");
      return;
    }

    try {
      await completeSignup({
        id: validation.id,
        token: validation.token,
        password,
        dateOfBirth,
      });
      setStatus("success");
      setMessage("Cadastro concluído. Faça login para acessar.");
      navigate("/login", { replace: true });
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Falha ao concluir cadastro",
      );
    }
  };

  if (validation.status === "loading") {
    return (
      <section className="auth-card">
        <h1>Completar cadastro</h1>
        <p>Validando link...</p>
      </section>
    );
  }

  if (validation.status === "invalid") {
    return (
      <section className="auth-card">
        <h1>Completar cadastro</h1>
        <p className="auth-error">{validation.message}</p>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <h1>Completar cadastro</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Data de nascimento
          <input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            required
          />
        </label>
        {message && (
          <p className={status === "error" ? "auth-error" : "auth-success"}>
            {message}
          </p>
        )}
        <button type="submit">Concluir</button>
      </form>
    </section>
  );
};
