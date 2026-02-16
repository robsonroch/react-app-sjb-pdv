import type {
  AdminRoleResponse,
  AdminUserResponse,
} from "../../services/adminTypes";

export type ManageUserRolesModalProps = {
  open: boolean;
  user: AdminUserResponse | null;
  roles: AdminRoleResponse[];
  onToggleRole: (roleId: string, shouldAdd: boolean) => Promise<void>;
  onClose: () => void;
  busy?: boolean;
};

export const ManageUserRolesModal = ({
  open,
  user,
  roles,
  onToggleRole,
  onClose,
  busy = false,
}: ManageUserRolesModalProps) => {
  if (!open || !user) {
    return null;
  }

  const currentRoleIds = new Set(user.roles.map((role) => role.id));

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>Roles de {user.username}</h2>
        </header>
        <div className="modal-content">
          {roles.map((role) => {
            const checked = currentRoleIds.has(role.id);
            return (
              <label key={role.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={busy}
                  onChange={() => onToggleRole(role.id, !checked)}
                />
                <span>{role.name}</span>
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
