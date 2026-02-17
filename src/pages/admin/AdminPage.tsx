import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../adapters/primary/react/auth/useAuth";
import { createAdminApi } from "../../services/adminApi";
import type { AdminMeResponse } from "../../services/adminTypes";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminRolesTab } from "./AdminRolesTab";
import { AdminPermissionsTab } from "./AdminPermissionsTab";
import { FiKey, FiShield, FiUsers } from "react-icons/fi";
import { debugLog } from "../../utils/logger";

const normalizeResource = (resource: string) => {
  const lower = resource.toLowerCase();

  if (lower.includes("user")) {
    return "user";
  }
  if (lower.includes("role")) {
    return "role";
  }
  if (lower.includes("permission")) {
    return "permission";
  }

  return lower
    .replace(/\{.*?\}/g, "")
    .replace(/^\/+/, "")
    .split("/")[0];
};

const normalizeAction = (action: string) => {
  const lower = action.toLowerCase();

  if (
    lower.includes("write") ||
    lower.includes("create") ||
    lower.includes("criar") ||
    lower.includes("manage") ||
    lower.includes("update") ||
    lower.includes("atualiza") ||
    lower.includes("editar") ||
    lower.includes("delete") ||
    lower.includes("excluir") ||
    lower.includes("remover")
  ) {
    return "write";
  }

  if (
    lower.includes("read") ||
    lower.includes("list") ||
    lower.includes("lista") ||
    lower.includes("busca") ||
    lower.includes("buscar") ||
    lower.includes("listar")
  ) {
    return "read";
  }

  return lower;
};

const buildAuthorities = (me?: AdminMeResponse | null) =>
  (me?.permissions ?? []).map((permission) => {
    const resource = normalizeResource(permission.resource);
    const action = normalizeAction(permission.action);
    return `${resource}:${action}`;
  });

const buildMenu = (authorities: string[]) => {
  const items = [] as { id: string; label: string }[];

  if (authorities.includes("user:read")) {
    items.push({ id: "users", label: "Usuários" });
  }

  if (authorities.includes("role:read") || authorities.includes("role:write")) {
    items.push({ id: "roles", label: "Roles" });
  }

  if (
    authorities.includes("permission:read") ||
    authorities.includes("permission:write")
  ) {
    items.push({ id: "permissions", label: "Permissões" });
  }

  return items;
};

export const AdminPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const [me, setMe] = useState<AdminMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("users");

  const api = useMemo(
    () =>
      createAdminApi({
        onUnauthorized: () => {
          logout();
          navigate("/login", { replace: true });
        },
      }),
    [logout, navigate],
  );

  useEffect(() => {
    const loadMe = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const profile = await api.getMe();

        if (!profile) {
          setErrorMessage("Erro ao carregar");
          return;
        }

        setMe(profile);
        const authorities = buildAuthorities(profile);
        debugLog("admin.me.authorities", authorities);
        const menu = buildMenu(authorities);
        if (menu.length > 0) {
          const desiredTab =
            tab && menu.some((item) => item.id === tab) ? tab : menu[0].id;
          setActiveTab(desiredTab);
          if (desiredTab !== tab) {
            navigate(`/admin/${desiredTab}`, { replace: true });
          }
        }
      } catch (err) {
        debugLog("admin.me.error", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Erro ao carregar",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [api, navigate, tab]);

  if (loading) {
    return (
      <section className="admin-layout">
        <p>Carregando administração...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="admin-layout">
        <p className="auth-error">{errorMessage}</p>
      </section>
    );
  }

  if (!me) {
    return null;
  }

  const authorities = buildAuthorities(me);
  const menuItems = buildMenu(authorities);
  const canWriteRoles = authorities.includes("role:write");
  const canWritePermissions = authorities.includes("permission:write");
  const canWriteUsers = authorities.includes("user:write");

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    navigate(`/admin/${id}`);
  };

  if (menuItems.length === 0) {
    return (
      <section className="admin-layout">
        <p className="auth-error">Acesso negado</p>
      </section>
    );
  }

  return (
    <section className="admin-layout">
      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-user">{me.email}</div>
          <div className="admin-tab-buttons">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`admin-tab-button ${
                  item.id === activeTab ? "active" : ""
                }`}
                onClick={() => handleSelectTab(item.id)}
              >
                {item.id === "users" && <FiUsers aria-hidden />}
                {item.id === "roles" && <FiShield aria-hidden />}
                {item.id === "permissions" && <FiKey aria-hidden />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        {activeTab === "users" && (
          <AdminUsersTab api={api} canWriteUsers={canWriteUsers} />
        )}
        {activeTab === "roles" && (
          <AdminRolesTab api={api} canWriteRoles={canWriteRoles} />
        )}
        {activeTab === "permissions" && (
          <AdminPermissionsTab
            api={api}
            canWritePermissions={canWritePermissions}
          />
        )}
      </div>
    </section>
  );
};
