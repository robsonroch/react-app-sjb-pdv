import type { User } from "../../../domain/auth/User";
import type { AuthTokenStorage } from "../ports/AuthTokenStorage";

export class GetCurrentUser {
  private readonly tokenStorage: AuthTokenStorage;

  constructor(tokenStorage: AuthTokenStorage) {
    this.tokenStorage = tokenStorage;
  }

  execute(): User | null {
    const token = this.tokenStorage.get();

    if (!token) {
      return null;
    }

    if (token.isExpired()) {
      this.tokenStorage.clear();
      return null;
    }

    return token.toUser();
  }
}
