import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, children }) {
  const token = localStorage.getItem("authToken");
  
  if (!isLoggedIn && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
