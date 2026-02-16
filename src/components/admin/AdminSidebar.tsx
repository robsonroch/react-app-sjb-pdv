export type AdminSidebarItem = {
  id: string;
  label: string;
};

export type AdminSidebarProps = {
  items: AdminSidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  userEmail?: string;
};

export const AdminSidebar = ({
  items,
  activeId,
  onSelect,
  userEmail,
}: AdminSidebarProps) => (
  <aside className="admin-sidebar">
    <div className="admin-sidebar-header">
      <h2>Admin</h2>
      {userEmail && <p>{userEmail}</p>}
    </div>
    <nav className="admin-sidebar-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={item.id === activeId ? "active" : ""}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);
