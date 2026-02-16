import type {
  AuthRepository,
  ValidatePreSignupInput,
  ValidatePreSignupResult,
} from "../ports/AuthRepository";

export class ValidatePreSignup {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    input: ValidatePreSignupInput,
  ): Promise<ValidatePreSignupResult> {
    return this.authRepository.validatePreSignup(input);
  }
}
