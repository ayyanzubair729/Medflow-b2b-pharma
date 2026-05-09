import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireRole({ allowedRoles = [] }) {
  const { token, role } = useSelector((state) => state.auth);
  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
