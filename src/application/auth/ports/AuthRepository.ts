import type { AuthToken } from "../../../domain/auth/AuthToken";

export type PreSignupInput = {
  username: string;
  email: string;
};

export type CompleteSignupInput = {
  id: string;
  token: string;
  password: string;
  dateOfBirth: string;
};

export type ValidatePreSignupInput = {
  id: string;
  token: string;
};

export type ValidatePreSignupResult = {
  id: string;
  token: string;
};

export type ValidatePasswordChangeInput = {
  id: string;
  token: string;
};

export type ValidatePasswordChangeResult = {
  id: string;
  token: string;
};

export type CompletePasswordChangeInput = {
  id: string;
  token: string;
  newPassword: string;
};

export type ValidatePasswordResetInput = {
  id: string;
  token: string;
};

export type ValidatePasswordResetResult = {
  id: string;
  token: string;
};

export type CompletePasswordResetInput = {
  id: string;
  token: string;
  newPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export interface AuthRepository {
  preSignup(input: PreSignupInput): Promise<void>;
  validatePreSignup(
    input: ValidatePreSignupInput,
  ): Promise<ValidatePreSignupResult>;
  completeSignup(input: CompleteSignupInput): Promise<void>;
  validatePasswordChange(
    input: ValidatePasswordChangeInput,
  ): Promise<ValidatePasswordChangeResult>;
  completePasswordChange(input: CompletePasswordChangeInput): Promise<void>;
  validatePasswordReset(
    input: ValidatePasswordResetInput,
  ): Promise<ValidatePasswordResetResult>;
  completePasswordReset(input: CompletePasswordResetInput): Promise<void>;
  login(input: LoginInput): Promise<AuthToken>;
}
