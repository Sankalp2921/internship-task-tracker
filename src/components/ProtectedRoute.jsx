import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {

  const { user } = useAuth();
 
  // User is not logged in
  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  // User has wrong role
  if (allowedRole && user.role !== allowedRole) {

    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  // Everything is okay
  return children;
}

export default ProtectedRoute;