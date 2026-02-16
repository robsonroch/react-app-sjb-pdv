export type AdminPermissionResponse = {
  id: string;
  resource: string;
  action: string;
};

export type AdminMeResponse = {
  id: string;
  username: string;
  email: string;
  ativo: boolean;
  roles: AdminRoleResponse[];
  permissions: AdminPermissionResponse[];
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

export type AdminPagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
