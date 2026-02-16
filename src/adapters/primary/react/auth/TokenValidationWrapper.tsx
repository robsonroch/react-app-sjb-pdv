import type { ReactNode } from "react";
import type { TokenValidationState } from "./useTokenValidation";

export type TokenValidationWrapperProps = {
  state: TokenValidationState;
  children: (payload: { id: string; token: string }) => ReactNode;
  title: string;
};

export const TokenValidationWrapper = ({
  state,
  children,
  title,
}: TokenValidationWrapperProps) => {
  if (state.status === "loading") {
    return (
      <section className="auth-card">
        <h1>{title}</h1>
        <p>Validando link...</p>
      </section>
    );
  }

  if (state.status === "invalid") {
    return (
      <section className="auth-card">
        <h1>{title}</h1>
        <p className="auth-error">{state.message}</p>
      </section>
    );
  }

  return <>{children({ id: state.id!, token: state.token! })}</>;
};
