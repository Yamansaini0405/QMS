// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom"
import { isTokenValid } from "../utils/auth"


const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("role")

  if (!isTokenValid(token) || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
