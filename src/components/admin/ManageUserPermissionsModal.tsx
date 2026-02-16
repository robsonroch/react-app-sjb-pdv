import type { AdminPermissionResponse, AdminUserResponse } from "../../services/adminTypes";

export type ManageUserPermissionsModalProps = {
  open: boolean;
  user: AdminUserResponse | null;
  permissions: AdminPermissionResponse[];
  onTogglePermission: (permissionId: string, shouldAdd: boolean) => Promise<void>;
  onClose: () => void;
};

export const ManageUserPermissionsModal = ({
  open,
  user,
  permissions,
  onTogglePermission,
  onClose,
}: ManageUserPermissionsModalProps) => {
  if (!open || !user) {
    return null;
  }

  const currentPermissionIds = new Set(
    user.permissions.map((permission) => permission.id),
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>Permissões de {user.username}</h2>
        </header>
        <div className="modal-content">
          {permissions.map((permission) => {
            const checked = currentPermissionIds.has(permission.id);
            return (
              <label key={permission.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checked}
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
          <button onClick={onClose}>Fechar</button>
        </footer>
      </div>
    </div>
  );
};
