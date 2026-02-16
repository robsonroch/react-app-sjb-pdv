import { useState } from "react";
import { useAuthFacade } from "../useAuthFacade";

export const PreSignupPage = () => {
  const { preSignup } = useAuthFacade();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setMessage(null);

    try {
      await preSignup({ username, email });
      setStatus("success");
      setMessage("Confira seu email para completar o cadastro.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Falha ao iniciar cadastro",
      );
    }
  };

  return (
    <section className="auth-card">
      <h1>Pré-cadastro</h1>
      <p>Informe usuário e email para receber o link de ativação.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Usuário
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {message && (
          <p className={status === "error" ? "auth-error" : "auth-success"}>
            {message}
          </p>
        )}
        <button type="submit">Enviar</button>
      </form>
    </section>
  );
};
