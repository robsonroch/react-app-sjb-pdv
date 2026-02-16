import { Permission } from "./Permission";
import { Role } from "./Role";
import { User } from "./User";
import { decodeJwtPayload } from "./jwtDecode";

export type AuthTokenPayload = {
  username: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  exp: number;
  iat: number;
};

export class AuthToken {
  public readonly value: string;
  public readonly payload: AuthTokenPayload;

  private constructor(value: string, payload: AuthTokenPayload) {
    this.value = value;
    this.payload = payload;
  }

  static fromJwt(token: string): AuthToken {
    if (!token) {
      throw new Error("Token is required");
    }

    const payload = decodeJwtPayload<AuthTokenPayload>(token);

    if (!payload.username || !payload.email || !payload.exp || !payload.iat) {
      throw new Error("Invalid token payload");
    }

    return new AuthToken(token, payload);
  }

  isExpired(referenceTime = Date.now()): boolean {
    return referenceTime >= this.payload.exp * 1000;
  }

  toUser(): User {
    const roles = (this.payload.roles ?? []).map((role) => new Role(role));
    const permissions = (this.payload.permissions ?? []).map(
      (permission) => new Permission(permission),
    );

    return new User({
      username: this.payload.username,
      email: this.payload.email,
      roles,
      permissions,
    });
  }
}
