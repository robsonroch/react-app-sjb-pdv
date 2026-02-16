import { AuthToken } from "../../../../domain/auth/AuthToken";
import type { AuthTokenStorage } from "../../../../application/auth/ports/AuthTokenStorage";

export type BrowserAuthTokenStorageOptions = {
  persist?: boolean;
  storageKey?: string;
};

export class BrowserAuthTokenStorage implements AuthTokenStorage {
  private readonly persist: boolean;
  private readonly storageKey: string;
  private memoryToken: AuthToken | null = null;

  constructor(options: BrowserAuthTokenStorageOptions = {}) {
    this.persist = options.persist ?? true;
    this.storageKey = options.storageKey ?? "auth.token";

    if (this.persist && this.hasStorage()) {
      const storedToken = window.localStorage.getItem(this.storageKey);

      if (storedToken) {
        try {
          this.memoryToken = AuthToken.fromJwt(storedToken);
        } catch {
          window.localStorage.removeItem(this.storageKey);
        }
      }
    }
  }

  get(): AuthToken | null {
    return this.memoryToken;
  }

  set(token: AuthToken): void {
    this.memoryToken = token;

    if (this.persist && this.hasStorage()) {
      window.localStorage.setItem(this.storageKey, token.value);
    }
  }

  clear(): void {
    this.memoryToken = null;

    if (this.persist && this.hasStorage()) {
      window.localStorage.removeItem(this.storageKey);
    }
  }

  private hasStorage(): boolean {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  }
}
