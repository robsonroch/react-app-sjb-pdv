import type { AuthTokenStorage } from "../ports/AuthTokenStorage";

export class Logout {
  private readonly tokenStorage: AuthTokenStorage;

  constructor(tokenStorage: AuthTokenStorage) {
    this.tokenStorage = tokenStorage;
  }

  execute(): void {
    this.tokenStorage.clear();
  }
}
