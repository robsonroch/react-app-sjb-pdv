import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  AdminMeResponse,
  AdminPagedResponse,
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
  getMe: () => Promise<AdminMeResponse>;

  getUsers: (params: {
    page: number;
    size: number;
    search?: string;
    active?: boolean;
  }) => Promise<AdminPagedResponse<AdminUserResponse>>;
  getUser: (id: string) => Promise<AdminUserResponse>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  addUserRole: (userId: string, roleId: string) => Promise<void>;
  removeUserRole: (userId: string, roleId: string) => Promise<void>;
  addUserPermission: (userId: string, permissionId: string) => Promise<void>;
  removeUserPermission: (userId: string, permissionId: string) => Promise<void>;

  getRoles: (params: {
    page: number;
    size: number;
    search?: string;
  }) => Promise<AdminPagedResponse<AdminRoleResponse>>;
  getRole: (id: string) => Promise<AdminRoleResponse>;
  createRole: (input: AdminRoleRequest) => Promise<AdminRoleResponse>;
  updateRole: (
    id: string,
    input: AdminRoleRequest,
  ) => Promise<AdminRoleResponse>;
  deleteRole: (id: string) => Promise<void>;
  addRolePermission: (roleId: string, permissionId: string) => Promise<void>;
  removeRolePermission: (roleId: string, permissionId: string) => Promise<void>;

  getPermissions: (params: {
    page: number;
    size: number;
    search?: string;
  }) => Promise<AdminPagedResponse<AdminPermissionResponse>>;
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

const createClient = (options: AdminApiOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL: options.baseUrl ?? import.meta.env.VITE_AUTH_BASE_URL ?? "",
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 401) {
        options.onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const createAdminApi = (options: AdminApiOptions = {}): AdminApi => {
  const client = createClient(options);

  const handleError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      if (status === 403) {
        throw new Error("Acesso negado");
      }
      if (status) {
        throw new Error(`Erro ${status}`);
      }
    }

    throw error instanceof Error ? error : new Error("Erro inesperado");
  };

  return {
    getMe: async () => {
      try {
        const { data } = await client.get<AdminMeResponse>("/admin/me");
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    getUsers: async (params) => {
      try {
        const { data } = await client.get<
          AdminPagedResponse<AdminUserResponse>
        >("/admin/users", { params });
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    getUser: async (id: string) => {
      try {
        const { data } = await client.get<AdminUserResponse>(
          `/admin/users/${id}`,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    activateUser: async (id: string) => {
      try {
        await client.patch(`/admin/users/${id}/activate`);
      } catch (error) {
        handleError(error);
      }
    },
    deactivateUser: async (id: string) => {
      try {
        await client.patch(`/admin/users/${id}/deactivate`);
      } catch (error) {
        handleError(error);
      }
    },
    addUserRole: async (userId: string, roleId: string) => {
      try {
        await client.post(`/admin/users/${userId}/roles/${roleId}`);
      } catch (error) {
        handleError(error);
      }
    },
    removeUserRole: async (userId: string, roleId: string) => {
      try {
        await client.delete(`/admin/users/${userId}/roles/${roleId}`);
      } catch (error) {
        handleError(error);
      }
    },
    addUserPermission: async (userId: string, permissionId: string) => {
      try {
        await client.post(`/admin/users/${userId}/permissions/${permissionId}`);
      } catch (error) {
        handleError(error);
      }
    },
    removeUserPermission: async (userId: string, permissionId: string) => {
      try {
        await client.delete(
          `/admin/users/${userId}/permissions/${permissionId}`,
        );
      } catch (error) {
        handleError(error);
      }
    },

    getRoles: async (params) => {
      try {
        const { data } = await client.get<
          AdminPagedResponse<AdminRoleResponse>
        >("/admin/roles", { params });
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    getRole: async (id: string) => {
      try {
        const { data } = await client.get<AdminRoleResponse>(
          `/admin/roles/${id}`,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    createRole: async (input: AdminRoleRequest) => {
      try {
        const { data } = await client.post<AdminRoleResponse>(
          "/admin/roles",
          input,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    updateRole: async (id: string, input: AdminRoleRequest) => {
      try {
        const { data } = await client.put<AdminRoleResponse>(
          `/admin/roles/${id}`,
          input,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    deleteRole: async (id: string) => {
      try {
        await client.delete(`/admin/roles/${id}`);
      } catch (error) {
        handleError(error);
      }
    },
    addRolePermission: async (roleId: string, permissionId: string) => {
      try {
        await client.post(`/admin/roles/${roleId}/permissions/${permissionId}`);
      } catch (error) {
        handleError(error);
      }
    },
    removeRolePermission: async (roleId: string, permissionId: string) => {
      try {
        await client.delete(
          `/admin/roles/${roleId}/permissions/${permissionId}`,
        );
      } catch (error) {
        handleError(error);
      }
    },

    getPermissions: async (params) => {
      try {
        const { data } = await client.get<
          AdminPagedResponse<AdminPermissionResponse>
        >("/admin/permissions", { params });
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    getPermission: async (id: string) => {
      try {
        const { data } = await client.get<AdminPermissionResponse>(
          `/admin/permissions/${id}`,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    createPermission: async (input: AdminPermissionRequest) => {
      try {
        const { data } = await client.post<AdminPermissionResponse>(
          "/admin/permissions",
          input,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    updatePermission: async (id: string, input: AdminPermissionRequest) => {
      try {
        const { data } = await client.put<AdminPermissionResponse>(
          `/admin/permissions/${id}`,
          input,
        );
        return data;
      } catch (error) {
        return handleError(error);
      }
    },
    deletePermission: async (id: string) => {
      try {
        await client.delete(`/admin/permissions/${id}`);
      } catch (error) {
        handleError(error);
      }
    },
  };
};
