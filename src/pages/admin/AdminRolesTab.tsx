import { useCallback, useEffect, useState } from "react";
import type {
  AdminPermissionResponse,
  AdminRoleRequest,
  AdminRoleResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/robssoHexAdminApi";
import { CreateEditRoleModal } from "../../components/admin/CreateEditRoleModal";

export const AdminRolesTab = ({ api }: { api: AdminApi }) => {
  const [roles, setRoles] = useState<AdminRoleResponse[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRoles();
      setRoles(data);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao carregar roles");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await api.getPermissions();
        setPermissions(data);
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Erro ao carregar permissões",
        );
      }
    };

    loadPermissions();
  }, [api]);

  const handleSave = async (input: AdminRoleRequest) => {
    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, input);
      } else {
        await api.createRole(input);
      }
      setShowModal(false);
      setEditingRole(null);
      await loadRoles();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao salvar role");
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!window.confirm("Deseja excluir esta role?")) {
      return;
    }

    try {
      await api.deleteRole(roleId);
      await loadRoles();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao excluir role");
    }
  };

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Roles</h2>
        <button
          onClick={() => {
            setEditingRole(null);
            setShowModal(true);
          }}
        >
          Nova role
        </button>
      </header>

      {loading ? (
        <p>Carregando roles...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td className="chip-cell">
                  {role.permissions.map((permission) => (
                    <span key={permission.id} className="chip">
                      {permission.resource}:{permission.action}
                    </span>
                  ))}
                </td>
                <td className="admin-actions">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(role.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateEditRoleModal
        key={`${editingRole?.id ?? "new"}-${showModal}`}
        open={showModal}
        role={editingRole}
        permissions={permissions}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
