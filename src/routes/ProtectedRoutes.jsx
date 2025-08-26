// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"


const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("role")

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
