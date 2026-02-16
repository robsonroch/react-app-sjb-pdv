import type { AuthToken } from "../../../domain/auth/AuthToken";
import type { AuthRepository, LoginInput } from "../ports/AuthRepository";
import type { AuthTokenStorage } from "../ports/AuthTokenStorage";

export class Login {
  private readonly authRepository: AuthRepository;
  private readonly tokenStorage: AuthTokenStorage;

  constructor(authRepository: AuthRepository, tokenStorage: AuthTokenStorage) {
    this.authRepository = authRepository;
    this.tokenStorage = tokenStorage;
  }

  async execute(input: LoginInput): Promise<AuthToken> {
    const token = await this.authRepository.login(input);
    this.tokenStorage.set(token);

    return token;
  }
}
