import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export const ProtectedRoute = ({
  requiredPermission,
}: {
  requiredPermission?: string;
}) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
