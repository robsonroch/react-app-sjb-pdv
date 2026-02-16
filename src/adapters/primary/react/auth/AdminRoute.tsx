import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export const AdminRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
