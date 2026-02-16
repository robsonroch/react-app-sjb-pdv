export type AdminPermissionResponse = {
  id: string;
  resource: string;
  action: string;
};

export type AdminRoleResponse = {
  id: string;
  name: string;
  description: string;
  permissions: AdminPermissionResponse[];
};

export type AdminUserResponse = {
  id: string;
  username: string;
  email: string;
  ativo: boolean;
  roles: AdminRoleResponse[];
  permissions: AdminPermissionResponse[];
};

export type AdminRoleRequest = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type AdminPermissionRequest = {
  resource: string;
  action: string;
};
