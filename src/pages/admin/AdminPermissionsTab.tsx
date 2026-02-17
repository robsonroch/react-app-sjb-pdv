import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import type {
  AdminPermissionRequest,
  AdminPermissionResponse,
} from "../../services/adminTypes";
import type { AdminApi } from "../../services/adminApi";
import { CreateEditPermissionModal } from "../../components/admin/CreateEditPermissionModal";

export const AdminPermissionsTab = ({
  api,
  canWritePermissions,
}: {
  api: AdminApi;
  canWritePermissions: boolean;
}) => {
  const [permissions, setPermissions] = useState<AdminPermissionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<AdminPermissionResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [detailPermission, setDetailPermission] =
    useState<AdminPermissionResponse | null>(null);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getPermissions({
        page,
        size,
        search: search || undefined,
      });
      const content = Array.isArray(result) ? result : (result.content ?? []);
      setPermissions(content);
      setTotalElements(
        Array.isArray(result)
          ? result.length
          : (result.totalElements ?? content.length),
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Erro ao carregar permissões",
      );
    } finally {
      setLoading(false);
    }
  }, [api, page, size, search]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleSave = async (input: AdminPermissionRequest) => {
    try {
      setActionLoading(true);
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (permissionId: string) => {
      if (!window.confirm("Deseja excluir esta permissão?")) {
        return;
      }

      try {
        setActionLoading(true);
        await api.deletePermission(permissionId);
        await loadPermissions();
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Erro ao excluir permissão",
        );
      } finally {
        setActionLoading(false);
      }
    },
    [api, loadPermissions],
  );

  const columns = useMemo<GridColDef<AdminPermissionResponse>[]>(
    () => [
      { field: "id", headerName: "ID", flex: 1, minWidth: 140 },
      { field: "resource", headerName: "Resource", flex: 1, minWidth: 200 },
      { field: "action", headerName: "Action", flex: 1, minWidth: 200 },
      {
        field: "actions",
        type: "actions",
        headerName: "Ações",
        width: canWritePermissions ? 160 : 90,
        getActions: (params: GridRenderCellParams<AdminPermissionResponse>) => {
          const base = [
            <GridActionsCellItem
              key="detail"
              icon={<FiEye />}
              label="Detalhar"
              onClick={() => setDetailPermission(params.row)}
            />,
          ];

          if (!canWritePermissions) {
            return base;
          }

          return [
            ...base,
            <GridActionsCellItem
              key="edit"
              icon={<FiEdit2 />}
              label="Editar"
              onClick={() => {
                setEditingPermission(params.row);
                setShowModal(true);
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
    [actionLoading, canWritePermissions, handleDelete],
  );

  return (
    <div className="admin-tab">
      <header className="admin-tab-header">
        <h2>Permissões</h2>
        <div className="admin-filters">
          <input
            placeholder="Buscar permission"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
          {canWritePermissions && (
            <button
              onClick={() => {
                setEditingPermission(null);
                setShowModal(true);
              }}
            >
              Nova permissão
            </button>
          )}
        </div>
      </header>

      <div className="admin-datagrid">
        <DataGrid
          rows={permissions}
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

      <CreateEditPermissionModal
        key={`${editingPermission?.id ?? "new"}-${showModal}`}
        open={showModal}
        permission={editingPermission}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />

      {detailPermission && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h2>Detalhes da permissão</h2>
            </header>
            <div className="modal-content">
              <div className="detail-grid">
                <div>
                  <span className="detail-label">ID</span>
                  <p className="detail-value">{detailPermission.id}</p>
                </div>
                <div>
                  <span className="detail-label">Resource</span>
                  <p className="detail-value">{detailPermission.resource}</p>
                </div>
                <div>
                  <span className="detail-label">Action</span>
                  <p className="detail-value">{detailPermission.action}</p>
                </div>
              </div>
            </div>
            <footer>
              <button onClick={() => setDetailPermission(null)}>Fechar</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
