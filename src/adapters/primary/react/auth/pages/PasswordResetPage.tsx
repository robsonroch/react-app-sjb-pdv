import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthFacade } from "../useAuthFacade";
import { useTokenValidation } from "../useTokenValidation";
import { TokenValidationWrapper } from "../TokenValidationWrapper";

export const PasswordResetPage = () => {
  const { completePasswordReset, requestPasswordReset } = useAuthFacade();
  const validation = useTokenValidation("password-reset");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasParams = Boolean(
    (searchParams.get("id") ?? "") && (searchParams.get("token") ?? ""),
  );
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [email, setEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "error" | "success"
  >("idle");
  const [requestLoading, setRequestLoading] = useState(false);

  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setRequestStatus("idle");
    setRequestMessage(null);
    setRequestLoading(true);

    try {
      await requestPasswordReset({ email });
      setRequestStatus("success");
      setRequestMessage("Confira seu email para redefinir a senha.");
    } catch (err) {
      setRequestStatus("error");
      setRequestMessage(
        err instanceof Error ? err.message : "Falha ao solicitar redefinição",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent,
    id: string,
    token: string,
  ) => {
    event.preventDefault();
    setStatus("idle");
    setMessage(null);

    try {
      await completePasswordReset({ id, token, newPassword });
      setStatus("success");
      navigate("/login", { replace: true });
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Falha ao redefinir senha",
      );
    }
  };

  if (!hasParams) {
    return (
      <section className="auth-card">
        <h1>Redefinir senha</h1>
        <p>Informe seu email para receber o link de redefinição.</p>
        <form onSubmit={handleRequestReset}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {requestMessage && (
            <p
              className={
                requestStatus === "error" ? "auth-error" : "auth-success"
              }
            >
              {requestMessage}
            </p>
          )}
          <button type="submit" disabled={requestLoading}>
            {requestLoading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <TokenValidationWrapper state={validation} title="Redefinir senha">
      {({ id, token }) => (
        <section className="auth-card">
          <h1>Redefinir senha</h1>
          <form onSubmit={(event) => handleSubmit(event, id, token)}>
            <label>
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
            {message && (
              <p className={status === "error" ? "auth-error" : "auth-success"}>
                {message}
              </p>
            )}
            <button type="submit">Confirmar</button>
          </form>
        </section>
      )}
    </TokenValidationWrapper>
  );
};
