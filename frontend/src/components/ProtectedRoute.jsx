import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin" && !["admin", "super_admin"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (role && role !== "admin" && user.role !== role) {
    return <Navigate to={["admin", "super_admin"].includes(user.role) ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
