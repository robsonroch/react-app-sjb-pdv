import type {
  AuthRepository,
  RequestPasswordResetInput,
} from "../ports/AuthRepository";

export class RequestPasswordReset {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: RequestPasswordResetInput): Promise<void> {
    await this.authRepository.requestPasswordReset(input);
  }
}
