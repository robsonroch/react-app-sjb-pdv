import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthFacade } from "./useAuthFacade";

export type PreSignupValidationStatus =
  | "idle"
  | "loading"
  | "valid"
  | "invalid";

export type PreSignupValidationState = {
  status: PreSignupValidationStatus;
  message: string | null;
  id: string | null;
  token: string | null;
};

type InternalState = PreSignupValidationState & {
  key: string;
};

const INVALID_LINK_MESSAGE = "Link inválido ou expirado";

export const usePreSignupValidation = (): PreSignupValidationState => {
  const { validatePreSignup } = useAuthFacade();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id") ?? "";
  const tokenParam = searchParams.get("token") ?? "";

  const hasParams = Boolean(idParam && tokenParam);

  const buildState = (
    status: PreSignupValidationStatus,
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

  const queryKey = useMemo(
    () => `${idParam}:${tokenParam}`,
    [idParam, tokenParam],
  );

  const [state, setState] = useState<InternalState>(() =>
    hasParams
      ? buildState("loading", null, null, null, queryKey)
      : buildState("invalid", INVALID_LINK_MESSAGE, null, null, queryKey),
  );

  const effectiveState: PreSignupValidationState =
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

    validatePreSignup({ id: idParam, token: tokenParam })
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
  }, [validatePreSignup, queryKey, idParam, tokenParam, hasParams]);

  return effectiveState;
};
