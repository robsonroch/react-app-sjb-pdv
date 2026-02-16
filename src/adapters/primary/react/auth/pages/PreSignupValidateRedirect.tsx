import { Navigate, useSearchParams } from "react-router-dom";

export const PreSignupValidateRedirect = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("token") ?? "";

  const target = `/complete-signup?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;

  return <Navigate to={target} replace />;
};
