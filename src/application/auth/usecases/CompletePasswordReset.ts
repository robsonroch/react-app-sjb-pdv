import type {
  AuthRepository,
  CompletePasswordResetInput,
} from "../ports/AuthRepository";

export class CompletePasswordReset {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: CompletePasswordResetInput): Promise<void> {
    await this.authRepository.completePasswordReset(input);
  }
}
