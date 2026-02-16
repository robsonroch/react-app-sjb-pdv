import type {
  AuthRepository,
  CompleteSignupInput,
  CompletePasswordChangeInput,
  CompletePasswordResetInput,
  LoginInput,
  PreSignupInput,
  ValidatePreSignupInput,
  ValidatePreSignupResult,
  ValidatePasswordChangeInput,
  ValidatePasswordChangeResult,
  ValidatePasswordResetInput,
  ValidatePasswordResetResult,
} from "../../../../application/auth/ports/AuthRepository";
import { AuthToken } from "../../../../domain/auth/AuthToken";
import { HttpClient } from "../httpClient";

export class HttpAuthRepository implements AuthRepository {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async validatePreSignup(
    input: ValidatePreSignupInput,
  ): Promise<ValidatePreSignupResult> {
    const query = new URLSearchParams({
      id: input.id,
      token: input.token,
    }).toString();

    return this.httpClient.get(`/auth/pre-signup/validate?${query}`);
  }

  async preSignup(input: PreSignupInput): Promise<void> {
    await this.httpClient.post("/auth/pre-signup", input);
  }

  async completeSignup(input: CompleteSignupInput): Promise<void> {
    await this.httpClient.postWithAuthToken(
      "/auth/complete-signup",
      {
        id: input.id,
        token: input.token,
        senha: input.password,
        dataNascimento: input.dateOfBirth,
      },
      input.token,
    );
  }

  async validatePasswordChange(
    input: ValidatePasswordChangeInput,
  ): Promise<ValidatePasswordChangeResult> {
    const query = new URLSearchParams({
      id: input.id,
      token: input.token,
    }).toString();

    return this.httpClient.get(`/auth/password-change/validate?${query}`);
  }

  async completePasswordChange(
    input: CompletePasswordChangeInput,
  ): Promise<void> {
    await this.httpClient.postWithAuthToken(
      "/auth/password-change/complete",
      {
        id: input.id,
        token: input.token,
        novaSenha: input.newPassword,
      },
      input.token,
    );
  }

  async validatePasswordReset(
    input: ValidatePasswordResetInput,
  ): Promise<ValidatePasswordResetResult> {
    const query = new URLSearchParams({
      id: input.id,
      token: input.token,
    }).toString();

    return this.httpClient.get(`/auth/password-reset/validate?${query}`);
  }

  async completePasswordReset(
    input: CompletePasswordResetInput,
  ): Promise<void> {
    await this.httpClient.postWithAuthToken(
      "/auth/password-reset/complete",
      {
        id: input.id,
        token: input.token,
        novaSenha: input.newPassword,
      },
      input.token,
    );
  }

  async login(input: LoginInput): Promise<AuthToken> {
    const response = await this.httpClient.post<{ token: string }>(
      "/auth/login",
      {
        email: input.email,
        senha: input.password,
      },
    );

    return AuthToken.fromJwt(response.token);
  }
}
