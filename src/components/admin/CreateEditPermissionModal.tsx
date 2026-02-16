import { useState } from "react";
import type {
  AdminPermissionRequest,
  AdminPermissionResponse,
} from "../../services/adminTypes";

export type CreateEditPermissionModalProps = {
  open: boolean;
  permission: AdminPermissionResponse | null;
  onSave: (input: AdminPermissionRequest) => Promise<void>;
  onClose: () => void;
};

export const CreateEditPermissionModal = ({
  open,
  permission,
  onSave,
  onClose,
}: CreateEditPermissionModalProps) => {
  const [resource, setResource] = useState(permission?.resource ?? "");
  const [action, setAction] = useState(permission?.action ?? "");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSave({ resource, action });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>{permission ? "Editar permissão" : "Nova permissão"}</h2>
        </header>
        <form onSubmit={handleSubmit} className="modal-content">
          <label>
            Resource
            <input
              value={resource}
              onChange={(event) => setResource(event.target.value)}
              required
            />
          </label>
          <label>
            Action
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              required
            />
          </label>
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
