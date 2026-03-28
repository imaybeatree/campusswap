import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenValid } from "./token";

export function RouteGuard() {
  const location = useLocation();
  const valid = useMemo(() => isTokenValid(), []);

  if (valid) {
    return <Outlet />;
  }

  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?after=${redirect}`} replace />;
}
