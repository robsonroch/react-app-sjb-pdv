import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
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

export const AdminUsersTab = ({ api }: { api: AdminApi }) => {
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
            result.content.find((user) => user.id === userIdToSync) ?? null;
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

  const openDetailModal = (user: AdminUserResponse) => {
    setDetailUser(user);
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
        headerName: "Ações",
        sortable: false,
        filterable: false,
        minWidth: 260,
        flex: 1,
        renderCell: (params: GridRenderCellParams<AdminUserResponse>) => (
          <div className="admin-actions">
            <button
              onClick={() => openDetailModal(params.row)}
              disabled={actionLoading}
              className="icon-button"
            >
              <FiEye aria-hidden />
              Detalhar
            </button>
            <button
              onClick={() => handleToggleActive(params.row)}
              disabled={actionLoading}
              className="icon-button"
            >
              {params.row.ativo ? (
                <FiUserX aria-hidden />
              ) : (
                <FiUserCheck aria-hidden />
              )}
              {params.row.ativo ? "Desativar" : "Ativar"}
            </button>
            <button
              onClick={() => openRolesModal(params.row)}
              disabled={actionLoading}
              className="icon-button"
            >
              <FiUsers aria-hidden />
              Roles
            </button>
            <button
              onClick={() => openPermissionsModal(params.row)}
              disabled={actionLoading}
              className="icon-button"
            >
              <FiShield aria-hidden />
              Permissões
            </button>
          </div>
        ),
      },
    ],
    [actionLoading],
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

      <ManageUserRolesModal
        open={showRolesModal}
        user={selectedUser}
        roles={roles}
        onToggleRole={handleToggleRole}
        onClose={() => setShowRolesModal(false)}
        busy={actionLoading}
      />

      <ManageUserPermissionsModal
        open={showPermissionsModal}
        user={selectedUser}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
        onClose={() => setShowPermissionsModal(false)}
        busy={actionLoading}
      />

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
    </div>
  );
};
