import { Permission } from "./Permission";
import { Role } from "./Role";

export class User {
  public readonly username: string;
  public readonly email: string;
  public readonly roles: Role[];
  public readonly permissions: Permission[];

  constructor(params: {
    username: string;
    email: string;
    roles?: Role[];
    permissions?: Permission[];
  }) {
    if (!params.username) {
      throw new Error("Username is required");
    }

    if (!params.email) {
      throw new Error("Email is required");
    }

    this.username = params.username;
    this.email = params.email;
    this.roles = params.roles ?? [];
    this.permissions = params.permissions ?? [];
  }

  hasRole(roleName: string): boolean {
    return this.roles.some((role) => role.name === roleName);
  }

  hasPermission(permissionName: string): boolean {
    return this.permissions.some(
      (permission) => permission.name === permissionName,
    );
  }
}
