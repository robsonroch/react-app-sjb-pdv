import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { FiEdit2, FiEye, FiShield, FiTrash2 } from "react-icons/fi";
import type {
  AdminPermissionResponse,
  AdminRoleRequest,
  AdminRoleResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/adminApi";
import { CreateEditRoleModal } from "../../components/admin/CreateEditRoleModal";
import { ManageRolePermissionsModal } from "../../components/admin/ManageRolePermissionsModal";

export const AdminRolesTab = ({
  api,
  canWriteRoles,
}: {
  api: AdminApi;
  canWriteRoles: boolean;
}) => {
  const [roles, setRoles] = useState<AdminRoleResponse[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleResponse | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [detailRole, setDetailRole] = useState<AdminRoleResponse | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getRoles({
        page,
        size,
        search: search || undefined,
      });
      const content = Array.isArray(result) ? result : (result.content ?? []);
      setRoles(content);
      setTotalElements(
        Array.isArray(result)
          ? result.length
          : (result.totalElements ?? content.length),
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao carregar roles",
      );
    } finally {
      setLoading(false);
    }
  }, [api, page, size, search]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await api.getPermissions({ page: 0, size: 200 });
        setPermissions(data.content ?? data);
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
      setActionLoading(true);
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!window.confirm("Deseja excluir esta role?")) {
      return;
    }

    try {
      setActionLoading(true);
      await api.deleteRole(roleId);
      await loadRoles();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erro ao excluir role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePermission = async (
    permissionId: string,
    shouldAdd: boolean,
  ) => {
    if (!editingRole) {
      return;
    }

    try {
      setActionLoading(true);
      if (shouldAdd) {
        await api.addRolePermission(editingRole.id, permissionId);
      } else {
        await api.removeRolePermission(editingRole.id, permissionId);
      }
      await loadRoles();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao atualizar permissões",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const chipsFor = useMemo(
    () =>
      (
        items: {
          id: string;
          name?: string;
          resource?: string;
          action?: string;
        }[],
      ) =>
        items.map((item) => (
          <span key={item.id} className="chip">
            {item.name ?? `${item.resource}:${item.action}`}
          </span>
        )),
    [],
  );

  const columns = useMemo<GridColDef<AdminRoleResponse>[]>(
    () => [
      { field: "name", headerName: "Nome", flex: 1, minWidth: 180 },
      {
        field: "description",
        headerName: "Descrição",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "permissions",
        headerName: "Permissões",
        width: 140,
        valueGetter: (_, row) => row.permissions.length,
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Ações",
        width: canWriteRoles ? 200 : 90,
        getActions: (params: GridRenderCellParams<AdminRoleResponse>) => {
          const base = [
            <GridActionsCellItem
              key="detail"
              icon={<FiEye />}
              label="Detalhar"
              onClick={() => setDetailRole(params.row)}
            />,
          ];

          if (!canWriteRoles) {
            return base;
          }

          return [
            ...base,
            <GridActionsCellItem
              key="edit"
              icon={<FiEdit2 />}
              label="Editar"
              onClick={() => {
                setEditingRole(params.row);
                setShowModal(true);
              }}
              showInMenu
            />,
            <GridActionsCellItem
              key="permissions"
              icon={<FiShield />}
              label="Permissões"
              onClick={() => {
                setEditingRole(params.row);
                setShowPermissionsModal(true);
              }}
              showInMenu
            />,
            <GridActionsCellItem
              key="delete"
              icon={<FiTrash2 />}
              label="Excluir"
              onClick={() => handleDelete(params.row.id)}
              showInMenu
            />,
          ];
        },
      },
    ],
    [actionLoading, canWriteRoles, handleDelete],
  );

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Roles</h2>
        <div className="admin-filters">
          <input
            placeholder="Buscar role"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
          {canWriteRoles && (
            <button
              onClick={() => {
                setEditingRole(null);
                setShowModal(true);
              }}
            >
              Nova role
            </button>
          )}
        </div>
      </header>

      <div className="admin-datagrid">
        <DataGrid
          rows={roles}
          columns={columns}
          loading={loading}
          rowCount={totalElements}
          paginationMode="server"
          paginationModel={{ page, pageSize: size }}
          onPaginationModelChange={(model) => {
            if (model.page !== page) {
              setPage(model.page);
            }
            if (model.pageSize !== size) {
              setSize(model.pageSize);
              setPage(0);
            }
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          density="compact"
        />
      </div>

      <CreateEditRoleModal
        key={`${editingRole?.id ?? "new"}-${showModal}`}
        open={showModal}
        role={editingRole}
        permissions={permissions}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />

      {canWriteRoles && (
        <ManageRolePermissionsModal
          open={showPermissionsModal}
          role={editingRole}
          permissions={permissions}
          onTogglePermission={handleTogglePermission}
          onClose={() => setShowPermissionsModal(false)}
          busy={actionLoading}
        />
      )}

      {detailRole && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h2>Detalhes da role</h2>
            </header>
            <div className="modal-content">
              <div className="detail-grid">
                <div>
                  <span className="detail-label">Nome</span>
                  <p className="detail-value">{detailRole.name}</p>
                </div>
                <div>
                  <span className="detail-label">Descrição</span>
                  <p className="detail-value">{detailRole.description}</p>
                </div>
                <div>
                  <span className="detail-label">Quantidade</span>
                  <p className="detail-value">
                    {detailRole.permissions.length} permissões
                  </p>
                </div>
              </div>
              <div className="detail-section">
                <h3>
                  <FiShield aria-hidden /> Permissões
                </h3>
                <div className="chip-cell">
                  {detailRole.permissions.length > 0
                    ? chipsFor(detailRole.permissions)
                    : "Nenhuma permissão"}
                </div>
              </div>
            </div>
            <footer>
              <button onClick={() => setDetailRole(null)}>Fechar</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
