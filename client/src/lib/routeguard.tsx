import { isTokenValid } from "./token";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const RouteGuard = () => {
  // prevent unnecessary re-renders
  if (useMemo(() => isTokenValid(), [])) {
    return <Outlet />;
  } else {
    const path = window.location.pathname + window.location.search;
    return <Navigate to={`/login?after=${encodeURIComponent(path)}`} />;
  }
};
