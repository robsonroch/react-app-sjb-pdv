import type { AuthTokenStorage } from "../ports/AuthTokenStorage";

export class HasPermission {
  private readonly tokenStorage: AuthTokenStorage;

  constructor(tokenStorage: AuthTokenStorage) {
    this.tokenStorage = tokenStorage;
  }

  execute(permission: string): boolean {
    const token = this.tokenStorage.get();

    if (!token || token.isExpired()) {
      return false;
    }

    return token.toUser().hasPermission(permission);
  }
}
