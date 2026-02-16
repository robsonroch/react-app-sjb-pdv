import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { decodeJwtPayload } from "../../../../domain/auth/jwtDecode";
import { useAuthFacade } from "./useAuthFacade";

export type TokenValidationKind = "password-change" | "password-reset";

export type TokenValidationState = {
  status: "loading" | "invalid" | "valid";
  message: string | null;
  id: string | null;
  token: string | null;
};

type InternalState = TokenValidationState & { key: string };

const INVALID_LINK_MESSAGE = "Link inválido ou expirado";

type TempTokenPayload = {
  exp?: number;
};

export const useTokenValidation = (
  kind: TokenValidationKind,
): TokenValidationState => {
  const { validatePasswordChange, validatePasswordReset } = useAuthFacade();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id") ?? "";
  const tokenParam = searchParams.get("token") ?? "";
  const hasParams = Boolean(idParam && tokenParam);

  const queryKey = useMemo(
    () => `${kind}:${idParam}:${tokenParam}`,
    [kind, idParam, tokenParam],
  );

  const buildState = (
    status: TokenValidationState["status"],
    message: string | null,
    id: string | null,
    token: string | null,
    key: string,
  ): InternalState => ({
    status,
    message,
    id,
    token,
    key,
  });

  const [state, setState] = useState<InternalState>(() =>
    hasParams
      ? buildState("loading", null, null, null, queryKey)
      : buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
  );

  const effectiveState: TokenValidationState =
    state.key === queryKey
      ? state
      : hasParams
        ? buildState("loading", null, null, null, queryKey)
        : buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey);

  useEffect(() => {
    if (!hasParams) {
      return;
    }

    let active = true;

    const validate =
      kind === "password-change"
        ? validatePasswordChange
        : validatePasswordReset;

    validate({ id: idParam, token: tokenParam })
      .then((result) => {
        if (!active) {
          return;
        }

        setState(buildState("valid", null, result.id, result.token, queryKey));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setState(
          buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
        );
      });

    return () => {
      active = false;
    };
  }, [
    validatePasswordChange,
    validatePasswordReset,
    kind,
    idParam,
    tokenParam,
    queryKey,
    hasParams,
  ]);

  useEffect(() => {
    if (effectiveState.status !== "valid" || !effectiveState.token) {
      return;
    }

    let timer: number | undefined;

    try {
      const payload = decodeJwtPayload<TempTokenPayload>(effectiveState.token);
      if (payload.exp) {
        const timeout = Math.max(payload.exp * 1000 - Date.now(), 0);
        if (timeout === 0) {
          timer = window.setTimeout(() => {
            setState(
              buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
            );
          }, 0);
          return;
        }

        timer = window.setTimeout(() => {
          setState(
            buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
          );
        }, timeout);
      }
    } catch {
      timer = window.setTimeout(() => {
        setState(
          buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
        );
      }, 0);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [effectiveState.status, effectiveState.token, queryKey]);

  return effectiveState;
};
