import type {
  AdminPermissionRequest,
  AdminPermissionResponse,
  AdminRoleRequest,
  AdminRoleResponse,
  AdminUserResponse,
} from "./adminTypes";

export type AdminApiOptions = {
  baseUrl?: string;
  onUnauthorized?: () => void;
};

export type AdminApi = {
  getUsers: (active?: boolean) => Promise<AdminUserResponse[]>;
  getUser: (id: string) => Promise<AdminUserResponse>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  addUserRole: (userId: string, roleId: string) => Promise<void>;
  removeUserRole: (userId: string, roleId: string) => Promise<void>;
  addUserPermission: (userId: string, permissionId: string) => Promise<void>;
  removeUserPermission: (userId: string, permissionId: string) => Promise<void>;

  getRoles: () => Promise<AdminRoleResponse[]>;
  getRole: (id: string) => Promise<AdminRoleResponse>;
  createRole: (input: AdminRoleRequest) => Promise<AdminRoleResponse>;
  updateRole: (id: string, input: AdminRoleRequest) => Promise<AdminRoleResponse>;
  deleteRole: (id: string) => Promise<void>;
  addRolePermission: (roleId: string, permissionId: string) => Promise<void>;
  removeRolePermission: (roleId: string, permissionId: string) => Promise<void>;

  getPermissions: () => Promise<AdminPermissionResponse[]>;
  getPermission: (id: string) => Promise<AdminPermissionResponse>;
  createPermission: (
    input: AdminPermissionRequest,
  ) => Promise<AdminPermissionResponse>;
  updatePermission: (
    id: string,
    input: AdminPermissionRequest,
  ) => Promise<AdminPermissionResponse>;
  deletePermission: (id: string) => Promise<void>;
};

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("auth.token");
};

export const createAdminApi = (options: AdminApiOptions = {}): AdminApi => {
  const baseUrl = `${options.baseUrl ?? ""}/robssohex`;

  const request = async <TResponse>(
    path: string,
    init: RequestInit,
  ): Promise<TResponse> => {
    const token = getStoredToken();
    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      options.onUnauthorized?.();
    }

    if (response.status === 403) {
      throw new Error("Acesso negado");
    }

    if (!response.ok) {
      const message = `Erro ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  };

  return {
    getUsers: async (active?: boolean) => {
      const query = typeof active === "boolean" ? `?active=${active}` : "";
      return request<AdminUserResponse[]>(`/admin/users${query}`, {
        method: "GET",
      });
    },
    getUser: async (id: string) =>
      request<AdminUserResponse>(`/admin/users/${id}`, { method: "GET" }),
    activateUser: async (id: string) =>
      request<void>(`/admin/users/${id}/activate`, { method: "PATCH" }),
    deactivateUser: async (id: string) =>
      request<void>(`/admin/users/${id}/deactivate`, { method: "PATCH" }),
    addUserRole: async (userId: string, roleId: string) =>
      request<void>(`/admin/users/${userId}/roles/${roleId}`, {
        method: "POST",
      }),
    removeUserRole: async (userId: string, roleId: string) =>
      request<void>(`/admin/users/${userId}/roles/${roleId}`, {
        method: "DELETE",
      }),
    addUserPermission: async (userId: string, permissionId: string) =>
      request<void>(`/admin/users/${userId}/permissions/${permissionId}`, {
        method: "POST",
      }),
    removeUserPermission: async (userId: string, permissionId: string) =>
      request<void>(`/admin/users/${userId}/permissions/${permissionId}`, {
        method: "DELETE",
      }),

    getRoles: async () =>
      request<AdminRoleResponse[]>(`/admin/roles`, { method: "GET" }),
    getRole: async (id: string) =>
      request<AdminRoleResponse>(`/admin/roles/${id}`, { method: "GET" }),
    createRole: async (input: AdminRoleRequest) =>
      request<AdminRoleResponse>(`/admin/roles`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateRole: async (id: string, input: AdminRoleRequest) =>
      request<AdminRoleResponse>(`/admin/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    deleteRole: async (id: string) =>
      request<void>(`/admin/roles/${id}`, { method: "DELETE" }),
    addRolePermission: async (roleId: string, permissionId: string) =>
      request<void>(`/admin/roles/${roleId}/permissions/${permissionId}`, {
        method: "POST",
      }),
    removeRolePermission: async (roleId: string, permissionId: string) =>
      request<void>(`/admin/roles/${roleId}/permissions/${permissionId}`, {
        method: "DELETE",
      }),

    getPermissions: async () =>
      request<AdminPermissionResponse[]>(`/admin/permissions`, {
        method: "GET",
      }),
    getPermission: async (id: string) =>
      request<AdminPermissionResponse>(`/admin/permissions/${id}`, {
        method: "GET" }),
    createPermission: async (input: AdminPermissionRequest) =>
      request<AdminPermissionResponse>(`/admin/permissions`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updatePermission: async (id: string, input: AdminPermissionRequest) =>
      request<AdminPermissionResponse>(`/admin/permissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    deletePermission: async (id: string) =>
      request<void>(`/admin/permissions/${id}`, { method: "DELETE" }),
  };
};
