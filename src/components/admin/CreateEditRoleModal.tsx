import { useState } from "react";
import type {
  AdminPermissionResponse,
  AdminRoleRequest,
  AdminRoleResponse,
} from "../../services/adminTypes";

export type CreateEditRoleModalProps = {
  open: boolean;
  role: AdminRoleResponse | null;
  permissions: AdminPermissionResponse[];
  onSave: (input: AdminRoleRequest) => Promise<void>;
  onClose: () => void;
};

export const CreateEditRoleModal = ({
  open,
  role,
  permissions,
  onSave,
  onClose,
}: CreateEditRoleModalProps) => {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    role?.permissions.map((permission) => permission.id) ?? [],
  );
  const [saving, setSaving] = useState(false);

  if (!open) {
    return null;
  }

  const togglePermission = (permissionId: string) => {
    setSelectedIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSave({
      name,
      description,
      permissionIds: selectedIds,
    });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>{role ? "Editar role" : "Nova role"}</h2>
        </header>
        <form onSubmit={handleSubmit} className="modal-content">
          <label>
            Nome
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label>
            Descrição
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>
          <div className="checkbox-grid">
            {permissions.map((permission) => (
              <label key={permission.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                />
                <span>
                  {permission.resource}:{permission.action}
                </span>
              </label>
            ))}
          </div>
          <footer>
            <button type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
