import { useCallback, useEffect, useState } from "react";
import type {
  AdminPermissionRequest,
  AdminPermissionResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/robssoHexAdminApi";
import { CreateEditPermissionModal } from "../../components/admin/CreateEditPermissionModal";

export const AdminPermissionsTab = ({ api }: { api: AdminApi }) => {
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<AdminPermissionResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPermissions();
      setPermissions(data);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao carregar permissões",
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleSave = async (input: AdminPermissionRequest) => {
    try {
      if (editingPermission) {
        await api.updatePermission(editingPermission.id, input);
      } else {
        await api.createPermission(input);
      }
      setShowModal(false);
      setEditingPermission(null);
      await loadPermissions();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao salvar permissão",
      );
    }
  };

  const handleDelete = async (permissionId: string) => {
    if (!window.confirm("Deseja excluir esta permissão?")) {
      return;
    }

    try {
      await api.deletePermission(permissionId);
      await loadPermissions();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao excluir permissão",
      );
    }
  };

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Permissões</h2>
        <button
          onClick={() => {
            setEditingPermission(null);
            setShowModal(true);
          }}
        >
          Nova permissão
        </button>
      </header>

      {loading ? (
        <p>Carregando permissões...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Resource</th>
              <th>Action</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id}>
                <td>{permission.id}</td>
                <td>{permission.resource}</td>
                <td>{permission.action}</td>
                <td className="admin-actions">
                  <button
                    onClick={() => {
                      setEditingPermission(permission);
                      setShowModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(permission.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CreateEditPermissionModal
        key={`${editingPermission?.id ?? "new"}-${showModal}`}
        open={showModal}
        permission={editingPermission}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
