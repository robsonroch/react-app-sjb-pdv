import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFacade } from "../useAuthFacade";
import { useTokenValidation } from "../useTokenValidation";
import { TokenValidationWrapper } from "../TokenValidationWrapper";

export const PasswordResetPage = () => {
  const { completePasswordReset } = useAuthFacade();
  const validation = useTokenValidation("password-reset");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

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
