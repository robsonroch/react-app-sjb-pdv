import type { AuthRepository, PreSignupInput } from "../ports/AuthRepository";

export class PreSignup {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: PreSignupInput): Promise<void> {
    await this.authRepository.preSignup(input);
  }
}
