import type {
  AuthRepository,
  CompletePasswordChangeInput,
} from "../ports/AuthRepository";

export class CompletePasswordChange {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: CompletePasswordChangeInput): Promise<void> {
    await this.authRepository.completePasswordChange(input);
  }
}
