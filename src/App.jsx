import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "../src/routes/ProtectedRoutes"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Quotations from "./pages/Quotations"
import Layout from "./components/Layout"
import NewQuotationPage from "./pages/NewQuotationPage"
import AddCustomer from "./pages/AddCustomer"
import Customer from "./pages/Customer"
import AddProduct from "./pages/AddProduct"
import Products from "./pages/Product"
import CreateMember from "./pages/CreateMember"
import AddTermsConditions from "./pages/AddTermAndConditions"
import Leads from "./pages/Leads"

import ViewTermsAndCondition from "./pages/ViewTermsAndCondition"
import ViewMembers from "./pages/ViewMembers"
import SalesPersonDashboard from "./pages/SalesPersonDashboard"
import AddLeads from "./pages/AddLeads"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              {/* Admin-only routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotations"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}>
                    <Quotations />
                  </ProtectedRoute>
                }
              />
              <Route path="/quotations/new" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><NewQuotationPage /></ProtectedRoute>} />
              <Route path="/customers/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddCustomer /></ProtectedRoute>} />
              <Route path="/products/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AddProduct /></ProtectedRoute>} />
              <Route path="/terms/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AddTermsConditions /></ProtectedRoute>} />
              <Route path="/leads/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddLeads /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><Leads /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><Customer /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Products /></ProtectedRoute>} />
              <Route path="/members/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CreateMember /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ViewTermsAndCondition /></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ViewMembers /></ProtectedRoute>} /> 
              {/* ...other admin routes... */}

              {/* Salesperson-only routes */}
              <Route
                path="/salesperson"
                element={
                  <ProtectedRoute allowedRoles={["SALESPERSON"]}>
                    <SalesPersonDashboard />
                  </ProtectedRoute>
                }
              />
              {/* ...other salesperson routes... */}
            </Routes>
          </Layout>
        }
      />
    </Routes>
  )
}

export default App