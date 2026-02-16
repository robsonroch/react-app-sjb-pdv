import type {
  AdminPermissionResponse,
  AdminRoleResponse,
} from "../../services/adminTypes";

export type ManageRolePermissionsModalProps = {
  open: boolean;
  role: AdminRoleResponse | null;
  permissions: AdminPermissionResponse[];
  onTogglePermission: (
    permissionId: string,
    shouldAdd: boolean,
  ) => Promise<void>;
  onClose: () => void;
  busy?: boolean;
};

export const ManageRolePermissionsModal = ({
  open,
  role,
  permissions,
  onTogglePermission,
  onClose,
  busy = false,
}: ManageRolePermissionsModalProps) => {
  if (!open || !role) {
    return null;
  }

  const currentPermissionIds = new Set(
    role.permissions.map((permission) => permission.id),
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>Permissões da role {role.name}</h2>
        </header>
        <div className="modal-content">
          {permissions.map((permission) => {
            const checked = currentPermissionIds.has(permission.id);
            return (
              <label key={permission.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={busy}
                  onChange={() => onTogglePermission(permission.id, !checked)}
                />
                <span>
                  {permission.resource}:{permission.action}
                </span>
              </label>
            );
          })}
        </div>
        <footer>
          <button onClick={onClose} disabled={busy}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
};
