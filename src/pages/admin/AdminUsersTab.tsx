import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  FiEye,
  FiLock,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiUsers,
} from "react-icons/fi";
import type {
  AdminPermissionResponse,
  AdminRoleResponse,
  AdminUserResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/adminApi";
import { ManageUserRolesModal } from "../../components/admin/ManageUserRolesModal";
import { ManageUserPermissionsModal } from "../../components/admin/ManageUserPermissionsModal";

export const AdminUsersTab = ({
  api,
  canWriteUsers,
}: {
  api: AdminApi;
  canWriteUsers: boolean;
}) => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [roles, setRoles] = useState<AdminRoleResponse[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(
    null,
  );
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUserResponse | null>(null);
  const [accessUser, setAccessUser] = useState<AdminUserResponse | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessRoleIds, setAccessRoleIds] = useState<string[]>([]);
  const [accessPermissionIds, setAccessPermissionIds] = useState<string[]>([]);
  const [accessSaving, setAccessSaving] = useState(false);

  const refreshUsers = useCallback(
    async (userIdToSync?: string) => {
      setLoading(true);
      try {
        const result = await api.getUsers({
          page,
          size,
          search: search || undefined,
          active: activeOnly ? true : undefined,
        });
        const content = Array.isArray(result) ? result : (result.content ?? []);
        setUsers(content);
        setTotalElements(
          Array.isArray(result)
            ? result.length
            : (result.totalElements ?? content.length),
        );
        if (userIdToSync) {
          const updated =
            content.find((user) => user.id === userIdToSync) ?? null;
          setSelectedUser(updated);
        }
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Erro ao carregar usuários",
        );
      } finally {
        setLoading(false);
      }
    },
    [api, activeOnly, page, size, search],
  );

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          api.getRoles({ page: 0, size: 200 }),
          api.getPermissions({ page: 0, size: 200 }),
        ]);
        setRoles(rolesData.content ?? rolesData);
        setPermissions(permissionsData.content ?? permissionsData);
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Erro ao carregar listas",
        );
      }
    };

    loadLists();
  }, [api]);

  const openRolesModal = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setShowRolesModal(true);
  };

  const openPermissionsModal = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const openDetailModal = async (user: AdminUserResponse) => {
    try {
      const fresh = await api.getUser(user.id);
      setDetailUser(fresh);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao carregar usuário",
      );
    }
  };

  const openAccessModal = async (user: AdminUserResponse) => {
    try {
      const fresh = await api.getUser(user.id);
      setAccessUser(fresh);
      setAccessRoleIds(fresh.roles.map((role) => role.id));
      setAccessPermissionIds(
        fresh.permissions.map((permission) => permission.id),
      );
      setShowAccessModal(true);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao carregar usuário",
      );
    }
  };

  const handleToggleActive = async (user: AdminUserResponse) => {
    try {
      setActionLoading(true);
      if (user.ativo) {
        await api.deactivateUser(user.id);
      } else {
        await api.activateUser(user.id);
      }
      await refreshUsers(user.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao atualizar usuário",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRole = async (roleId: string, shouldAdd: boolean) => {
    if (!selectedUser) {
      return;
    }
    try {
      setActionLoading(true);
      if (shouldAdd) {
        await api.addUserRole(selectedUser.id, roleId);
      } else {
        await api.removeUserRole(selectedUser.id, roleId);
      }
      await refreshUsers(selectedUser.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao atualizar roles",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePermission = async (
    permissionId: string,
    shouldAdd: boolean,
  ) => {
    if (!selectedUser) {
      return;
    }

    try {
      setActionLoading(true);
      if (shouldAdd) {
        await api.addUserPermission(selectedUser.id, permissionId);
      } else {
        await api.removeUserPermission(selectedUser.id, permissionId);
      }
      await refreshUsers(selectedUser.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao atualizar permissões",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAccess = async () => {
    if (!accessUser) {
      return;
    }

    try {
      setAccessSaving(true);
      await api.updateUserAccess({
        id: accessUser.id,
        roleIds: accessRoleIds,
        permissionIds: accessPermissionIds,
      });
      const refreshed = await api.getUser(accessUser.id);
      setAccessUser(refreshed);
      setAccessRoleIds(refreshed.roles.map((role) => role.id));
      setAccessPermissionIds(
        refreshed.permissions.map((permission) => permission.id),
      );
      await refreshUsers(accessUser.id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao atualizar acesso",
      );
    } finally {
      setAccessSaving(false);
    }
  };

  const chipsFor = useMemo(
    () =>
      (
        items: {
          id: string;
          name?: string;
          resource?: string;
          action?: string;
        }[],
      ) =>
        items.map((item) => (
          <span key={item.id} className="chip">
            {item.name ?? `${item.resource}:${item.action}`}
          </span>
        )),
    [],
  );

  const columns = useMemo<GridColDef<AdminUserResponse>[]>(
    () => [
      { field: "username", headerName: "Usuário", flex: 1, minWidth: 140 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
      {
        field: "ativo",
        headerName: "Status",
        width: 110,
        valueFormatter: (value: boolean) => (value ? "Ativo" : "Inativo"),
      },
      {
        field: "roles",
        headerName: "Roles",
        width: 90,
        valueGetter: (_, row) => row.roles.length,
      },
      {
        field: "permissions",
        headerName: "Permissões",
        width: 120,
        valueGetter: (_, row) => row.permissions.length,
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Ações",
        width: canWriteUsers ? 200 : 90,
        getActions: (params: GridRenderCellParams<AdminUserResponse>) => {
          const base = [
            <GridActionsCellItem
              key="detail"
              icon={<FiEye />}
              label="Detalhar"
              onClick={() => openDetailModal(params.row)}
            />,
          ];

          if (!canWriteUsers) {
            return base;
          }

          return [
            ...base,
            <GridActionsCellItem
              key="toggle"
              icon={params.row.ativo ? <FiUserX /> : <FiUserCheck />}
              label={params.row.ativo ? "Desativar" : "Ativar"}
              onClick={() => handleToggleActive(params.row)}
            />,
            <GridActionsCellItem
              key="roles"
              icon={<FiUsers />}
              label="Roles"
              onClick={() => openRolesModal(params.row)}
              showInMenu
            />,
            <GridActionsCellItem
              key="permissions"
              icon={<FiShield />}
              label="Permissões"
              onClick={() => openPermissionsModal(params.row)}
              showInMenu
            />,
            <GridActionsCellItem
              key="access"
              icon={<FiShield />}
              label="Gerenciar acesso"
              onClick={() => openAccessModal(params.row)}
              showInMenu
            />,
          ];
        },
      },
    ],
    [actionLoading, canWriteUsers],
  );

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Usuários</h2>
        <div className="admin-filters">
          <input
            placeholder="Buscar por usuário ou email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(event) => {
                setActiveOnly(event.target.checked);
                setPage(0);
              }}
            />
            Somente ativos
          </label>
        </div>
      </header>

      <div className="admin-datagrid">
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          rowCount={totalElements}
          paginationMode="server"
          paginationModel={{ page, pageSize: size }}
          onPaginationModelChange={(model) => {
            if (model.page !== page) {
              setPage(model.page);
            }
            if (model.pageSize !== size) {
              setSize(model.pageSize);
              setPage(0);
            }
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          density="compact"
        />
      </div>

      {canWriteUsers && (
        <ManageUserRolesModal
          open={showRolesModal}
          user={selectedUser}
          roles={roles}
          onToggleRole={handleToggleRole}
          onClose={() => setShowRolesModal(false)}
          busy={actionLoading}
        />
      )}

      {canWriteUsers && (
        <ManageUserPermissionsModal
          open={showPermissionsModal}
          user={selectedUser}
          permissions={permissions}
          onTogglePermission={handleTogglePermission}
          onClose={() => setShowPermissionsModal(false)}
          busy={actionLoading}
        />
      )}

      {detailUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h2>Detalhes do usuário</h2>
            </header>
            <div className="modal-content">
              <div className="detail-grid">
                <div>
                  <span className="detail-label">Usuário</span>
                  <p className="detail-value">{detailUser.username}</p>
                </div>
                <div>
                  <span className="detail-label">Email</span>
                  <p className="detail-value">{detailUser.email}</p>
                </div>
                <div>
                  <span className="detail-label">Status</span>
                  <p className="detail-value">
                    {detailUser.ativo ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
              <div className="detail-section">
                <h3>
                  <FiUsers aria-hidden /> Roles
                </h3>
                <div className="chip-cell">
                  {detailUser.roles.length > 0
                    ? chipsFor(detailUser.roles)
                    : "Nenhuma role"}
                </div>
              </div>
              <div className="detail-section">
                <h3>
                  <FiLock aria-hidden /> Permissões
                </h3>
                <div className="chip-cell">
                  {detailUser.permissions.length > 0
                    ? chipsFor(detailUser.permissions)
                    : "Nenhuma permissão"}
                </div>
              </div>
            </div>
            <footer>
              <button onClick={() => setDetailUser(null)}>Fechar</button>
            </footer>
          </div>
        </div>
      )}

      {showAccessModal && accessUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h2>Gerenciar acesso</h2>
            </header>
            <div className="modal-content">
              <div className="detail-grid">
                <div>
                  <span className="detail-label">Usuário</span>
                  <p className="detail-value">{accessUser.username}</p>
                </div>
                <div>
                  <span className="detail-label">Email</span>
                  <p className="detail-value">{accessUser.email}</p>
                </div>
              </div>
              <div className="detail-section">
                <h3>
                  <FiUsers aria-hidden /> Roles atribuídas
                </h3>
                <div className="checkbox-grid">
                  {roles.map((role) => {
                    const checked = accessRoleIds.includes(role.id);
                    return (
                      <label key={role.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAccessRoleIds((current) =>
                              checked
                                ? current.filter((id) => id !== role.id)
                                : [...current, role.id],
                            )
                          }
                        />
                        <span>{role.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="detail-section">
                <h3>
                  <FiLock aria-hidden /> Permissões diretas
                </h3>
                <div className="checkbox-grid">
                  {permissions.map((permission) => {
                    const checked = accessPermissionIds.includes(permission.id);
                    return (
                      <label key={permission.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAccessPermissionIds((current) =>
                              checked
                                ? current.filter((id) => id !== permission.id)
                                : [...current, permission.id],
                            )
                          }
                        />
                        <span>
                          {permission.resource}:{permission.action}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <footer>
              <button onClick={handleSaveAccess} disabled={accessSaving}>
                {accessSaving ? "Salvando..." : "Salvar acesso"}
              </button>
              <button onClick={() => setShowAccessModal(false)}>Fechar</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
