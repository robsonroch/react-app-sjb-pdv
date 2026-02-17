import { CompleteSignup } from "../../../../application/auth/usecases/CompleteSignup";
import { CompletePasswordChange } from "../../../../application/auth/usecases/CompletePasswordChange";
import { CompletePasswordReset } from "../../../../application/auth/usecases/CompletePasswordReset";
import { GetCurrentUser } from "../../../../application/auth/usecases/GetCurrentUser";
import { HasPermission } from "../../../../application/auth/usecases/HasPermission";
import { Login } from "../../../../application/auth/usecases/Login";
import { Logout } from "../../../../application/auth/usecases/Logout";
import { PreSignup } from "../../../../application/auth/usecases/PreSignup";
import { RequestPasswordReset } from "../../../../application/auth/usecases/RequestPasswordReset";
import { ValidatePreSignup } from "../../../../application/auth/usecases/ValidatePreSignup";
import { ValidatePasswordChange } from "../../../../application/auth/usecases/ValidatePasswordChange";
import { ValidatePasswordReset } from "../../../../application/auth/usecases/ValidatePasswordReset";
import { HttpClient } from "../../../secondary/http/httpClient";
import { HttpAuthRepository } from "../../../secondary/http/auth/HttpAuthRepository";
import { BrowserAuthTokenStorage } from "../../../secondary/storage/auth/BrowserAuthTokenStorage";

export type AuthDependenciesOptions = {
  onUnauthorized?: () => void;
  persistToken?: boolean;
};

export const createAuthDependencies = (
  options: AuthDependenciesOptions = {},
) => {
  const tokenStorage = new BrowserAuthTokenStorage({
    persist: options.persistToken ?? true,
    storageKey: "auth.token",
  });

  const logoutUseCase = new Logout(tokenStorage);

  const httpClient = new HttpClient({
    baseUrl: "/robssohex",
    tokenStorage,
    onUnauthorized: options.onUnauthorized
      ? () => {
          logoutUseCase.execute();
          options.onUnauthorized?.();
        }
      : undefined,
  });

  const authRepository = new HttpAuthRepository(httpClient);

  return {
    tokenStorage,
    httpClient,
    authRepository,
    preSignupUseCase: new PreSignup(authRepository),
    validatePreSignupUseCase: new ValidatePreSignup(authRepository),
    completeSignupUseCase: new CompleteSignup(authRepository),
    requestPasswordResetUseCase: new RequestPasswordReset(authRepository),
    validatePasswordChangeUseCase: new ValidatePasswordChange(authRepository),
    completePasswordChangeUseCase: new CompletePasswordChange(authRepository),
    validatePasswordResetUseCase: new ValidatePasswordReset(authRepository),
    completePasswordResetUseCase: new CompletePasswordReset(authRepository),
    loginUseCase: new Login(authRepository, tokenStorage),
    logoutUseCase,
    getCurrentUserUseCase: new GetCurrentUser(tokenStorage),
    hasPermissionUseCase: new HasPermission(tokenStorage),
  };
};

export type AuthDependencies = ReturnType<typeof createAuthDependencies>;
