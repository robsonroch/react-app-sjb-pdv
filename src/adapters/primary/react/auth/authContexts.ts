import { createContext } from "react";
import { User } from "../../../../domain/auth/User";

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
};

export type AuthFacade = {
  preSignup: (input: { username: string; email: string }) => Promise<void>;
  requestPasswordReset: (input: { email: string }) => Promise<void>;
  validatePreSignup: (input: { id: string; token: string }) => Promise<{
    id: string;
    token: string;
  }>;
  validatePasswordChange: (input: { id: string; token: string }) => Promise<{
    id: string;
    token: string;
  }>;
  completePasswordChange: (input: {
    id: string;
    token: string;
    newPassword: string;
  }) => Promise<void>;
  validatePasswordReset: (input: { id: string; token: string }) => Promise<{
    id: string;
    token: string;
  }>;
  completePasswordReset: (input: {
    id: string;
    token: string;
    newPassword: string;
  }) => Promise<void>;
  completeSignup: (input: {
    id: string;
    token: string;
    password: string;
    dateOfBirth: string;
  }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
export const AuthFacadeContext = createContext<AuthFacade | null>(null);
