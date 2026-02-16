import type { AuthToken } from "../../../domain/auth/AuthToken";

export interface AuthTokenStorage {
  get(): AuthToken | null;
  set(token: AuthToken): void;
  clear(): void;
}
