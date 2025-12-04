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
// import SalesPersonDashboard from "./pages/SalesPersonDashboard"
import AddLeads from "./pages/AddLeads"
import { QuotationProvider } from "./contexts/QuotationContext"
import ProfilePage from "./pages/ProfilePage"
import AllQuotations from "./pages/AllQuotations"
import DraftQuotations from "./pages/DraftQuotations"
import ConvertedLeadsPage from "./pages/ConvertedLeadsPage"
import ViewLead from "./pages/ViewLead"
import LeadDetailsPage from "./pages/LeadDetailsPage"
import ListOfLeadsPage from "./pages/ListOfLeadsPage"
import TodaysFollowups from "./pages/TodaysFollowups"


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
                   <QuotationProvider>
                     <Quotations />
                   </QuotationProvider>
                  </ProtectedRoute>
                }
              />
              
              <Route path="/quotations/all" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><AllQuotations /></ProtectedRoute>} />
              <Route path="/quotations/new" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><NewQuotationPage /></ProtectedRoute>} />
              <Route path="/quotations/edit/:id" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><NewQuotationPage /></ProtectedRoute>} />
              <Route path="/quotations/duplicate/:id" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><NewQuotationPage /></ProtectedRoute>} />
              <Route path="/quotations/draft" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><DraftQuotations /></ProtectedRoute>} />
              <Route path="/customers/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddCustomer /></ProtectedRoute>} />
              <Route path="/products/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddProduct /></ProtectedRoute>} />
              <Route path="/terms/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddTermsConditions /></ProtectedRoute>} />
              <Route path="/leads/create" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><AddLeads /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><Leads /></ProtectedRoute>} />
              <Route path="/leads/all" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><ListOfLeadsPage/></ProtectedRoute>} />
              <Route path="/leads/view/:id" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><LeadDetailsPage/></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute allowedRoles={["ADMIN","SALESPERSON"]}><Customer /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><Products /></ProtectedRoute>} />
              <Route path="/members/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CreateMember /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><ViewTermsAndCondition /></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ViewMembers /></ProtectedRoute>} /> 
              <Route path="/profile" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><ProfilePage /></ProtectedRoute>} /> 
              <Route path="/leads/converted" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><ConvertedLeadsPage /></ProtectedRoute>} />
              <Route path="/leads/followups" element={<ProtectedRoute allowedRoles={["ADMIN", "SALESPERSON"]}><TodaysFollowups /></ProtectedRoute>} />
              {/* ...other admin routes... */}
            </Routes>
          </Layout>
        }
      />
    </Routes>
  )
}

export default App