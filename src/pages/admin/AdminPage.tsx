import { useMemo, useState } from "react";
import { useAuth } from "../../adapters/primary/react/auth/useAuth";
import { createAdminApi } from "../../services/robssoHexAdminApi";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminRolesTab } from "./AdminRolesTab";
import { AdminPermissionsTab } from "./AdminPermissionsTab";

const TABS = ["Usuários", "Roles", "Permissões"] as const;

export const AdminPage = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Usuários");

  const api = useMemo(
    () =>
      createAdminApi({
        onUnauthorized: logout,
      }),
    [logout],
  );

  return (
    <section className="admin-layout">
      <header className="admin-header">
        <h1>Administração</h1>
      </header>
      <nav className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="admin-content">
        {activeTab === "Usuários" && <AdminUsersTab api={api} />}
        {activeTab === "Roles" && <AdminRolesTab api={api} />}
        {activeTab === "Permissões" && <AdminPermissionsTab api={api} />}
      </div>
    </section>
  );
};
