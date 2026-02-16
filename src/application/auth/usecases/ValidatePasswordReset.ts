import type {
  AuthRepository,
  ValidatePasswordResetInput,
  ValidatePasswordResetResult,
} from "../ports/AuthRepository";

export class ValidatePasswordReset {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    input: ValidatePasswordResetInput,
  ): Promise<ValidatePasswordResetResult> {
    return this.authRepository.validatePasswordReset(input);
  }
}
