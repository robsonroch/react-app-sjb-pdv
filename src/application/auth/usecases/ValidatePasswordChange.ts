import type {
  AuthRepository,
  ValidatePasswordChangeInput,
  ValidatePasswordChangeResult,
} from "../ports/AuthRepository";

export class ValidatePasswordChange {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    input: ValidatePasswordChangeInput,
  ): Promise<ValidatePasswordChangeResult> {
    return this.authRepository.validatePasswordChange(input);
  }
}
