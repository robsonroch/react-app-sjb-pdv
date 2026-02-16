import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export type AdminRouteProps = {
  requiredRole?: string;
  requiredPermissions?: string[];
};

export const AdminRoute = ({
  requiredRole = "adm-full",
  requiredPermissions = [],
}: AdminRouteProps) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess =
    hasRole(requiredRole) ||
    requiredPermissions.some((permission) => hasPermission(permission));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
