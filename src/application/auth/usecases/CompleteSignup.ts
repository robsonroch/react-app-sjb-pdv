import type {
  AuthRepository,
  CompleteSignupInput,
} from "../ports/AuthRepository";

export class CompleteSignup {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: CompleteSignupInput): Promise<void> {
    await this.authRepository.completeSignup(input);
  }
}
