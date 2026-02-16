import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminPermissionResponse,
  AdminRoleResponse,
  AdminUserResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/robssoHexAdminApi";
import { ManageUserRolesModal } from "../../components/admin/ManageUserRolesModal";
import { ManageUserPermissionsModal } from "../../components/admin/ManageUserPermissionsModal";

export const AdminUsersTab = ({ api }: { api: AdminApi }) => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [roles, setRoles] = useState<AdminRoleResponse[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const refreshUsers = useCallback(
    async (userIdToSync?: string) => {
      setLoading(true);
      try {
        const data = await api.getUsers(activeOnly ? true : undefined);
        setUsers(data);
        if (userIdToSync) {
          const updated = data.find((user) => user.id === userIdToSync) ?? null;
          setSelectedUser(updated);
        }
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    },
    [api, activeOnly],
  );

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          api.getRoles(),
          api.getPermissions(),
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Erro ao carregar listas");
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

  const handleToggleActive = async (user: AdminUserResponse) => {
    try {
      if (user.ativo) {
        await api.deactivateUser(user.id);
      } else {
        await api.activateUser(user.id);
      }
      await refreshUsers(user.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao atualizar usuário");
    }
  };

  const handleToggleRole = async (roleId: string, shouldAdd: boolean) => {
    if (!selectedUser) {
      return;
    }

    try {
      if (shouldAdd) {
        await api.addUserRole(selectedUser.id, roleId);
      } else {
        await api.removeUserRole(selectedUser.id, roleId);
      }
      await refreshUsers(selectedUser.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao atualizar roles");
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
    }
  };

  const chipsFor = useMemo(
    () => (items: { id: string; name?: string; resource?: string; action?: string }[]) =>
      items.map((item) => (
        <span key={item.id} className="chip">
          {item.name ?? `${item.resource}:${item.action}`}
        </span>
      )),
    [],
  );

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Usuários</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => setActiveOnly(event.target.checked)}
          />
          Somente ativos
        </label>
      </header>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th>Status</th>
              <th>Roles</th>
              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.ativo ? "Ativo" : "Inativo"}</td>
                <td className="chip-cell">{chipsFor(user.roles)}</td>
                <td className="chip-cell">{chipsFor(user.permissions)}</td>
                <td className="admin-actions">
                  <button onClick={() => handleToggleActive(user)}>
                    {user.ativo ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => openRolesModal(user)}>
                    Gerenciar roles
                  </button>
                  <button onClick={() => openPermissionsModal(user)}>
                    Gerenciar permissões
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ManageUserRolesModal
        open={showRolesModal}
        user={selectedUser}
        roles={roles}
        onToggleRole={handleToggleRole}
        onClose={() => setShowRolesModal(false)}
      />

      <ManageUserPermissionsModal
        open={showPermissionsModal}
        user={selectedUser}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
        onClose={() => setShowPermissionsModal(false)}
      />
    </div>
  );
};
