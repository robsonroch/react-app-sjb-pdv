import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthToken } from "../../../../domain/auth/AuthToken";
import { AuthContext, AuthFacadeContext } from "./authContexts";
import {
  createAuthDependencies,
  type AuthDependencies,
} from "./authDependencies";

export const AuthProvider = ({
  children,
  persistToken,
}: {
  children: ReactNode;
  persistToken?: boolean;
}) => {
  const dependencies: AuthDependencies = useMemo(
    () =>
      createAuthDependencies({
        persistToken:
          persistToken ?? import.meta.env.VITE_AUTH_PERSIST !== "false",
      }),
    [persistToken],
  );

  const [user, setUser] = useState(() =>
    dependencies.getCurrentUserUseCase.execute(),
  );
  const [currentToken, setCurrentToken] = useState<AuthToken | null>(() =>
    dependencies.tokenStorage.get(),
  );

  const logout = useCallback(() => {
    dependencies.logoutUseCase.execute();
    setUser(null);
    setCurrentToken(null);
  }, [dependencies]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const token = await dependencies.loginUseCase.execute(input);
      setUser(token.toUser());
      setCurrentToken(token);
    },
    [dependencies],
  );

  useEffect(() => {
    dependencies.httpClient.setUnauthorizedHandler(() => {
      dependencies.logoutUseCase.execute();
      setUser(null);
      setCurrentToken(null);
    });
  }, [dependencies]);

  useEffect(() => {
    if (!currentToken) {
      return;
    }

    const timeout = Math.max(currentToken.payload.exp * 1000 - Date.now(), 0);
    const timer = window.setTimeout(() => logout(), timeout);

    return () => window.clearTimeout(timer);
  }, [currentToken, logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      hasPermission: (permission: string) =>
        dependencies.hasPermissionUseCase.execute(permission),
      hasRole: (role: string) => user?.hasRole(role) ?? false,
    }),
    [dependencies, login, logout, user],
  );

  const facade = useMemo(
    () => ({
      preSignup: (input: { username: string; email: string }) =>
        dependencies.preSignupUseCase.execute(input),
      validatePreSignup: (input: { id: string; token: string }) =>
        dependencies.validatePreSignupUseCase.execute(input),
      validatePasswordChange: (input: { id: string; token: string }) =>
        dependencies.validatePasswordChangeUseCase.execute(input),
      completePasswordChange: (input: {
        id: string;
        token: string;
        newPassword: string;
      }) => dependencies.completePasswordChangeUseCase.execute(input),
      validatePasswordReset: (input: { id: string; token: string }) =>
        dependencies.validatePasswordResetUseCase.execute(input),
      completePasswordReset: (input: {
        id: string;
        token: string;
        newPassword: string;
      }) => dependencies.completePasswordResetUseCase.execute(input),
      completeSignup: (input: {
        id: string;
        token: string;
        password: string;
        dateOfBirth: string;
      }) => dependencies.completeSignupUseCase.execute(input),
    }),
    [dependencies],
  );

  return (
    <AuthContext.Provider value={value}>
      <AuthFacadeContext.Provider value={facade}>
        {children}
      </AuthFacadeContext.Provider>
    </AuthContext.Provider>
  );
};
