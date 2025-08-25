import { Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Quotations from "./pages/Quotations"
import Layout from "./components/Layout"
import NewQuotationPage from "./pages/NewQuotationPage"
import AddCustomer from "./pages/AddCustomer"
import Customer from "./pages/Customer"
import AddProduct from "./pages/AddProduct"
import Products from "./pages/Product"
import CreateAdmin from "./pages/CreateAdmin"
import AddTermsConditions from "./pages/AddTermAndConditions"

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/quotations/new" element={<NewQuotationPage />} />
                <Route path="/customers/create" element={<AddCustomer />} />
                <Route path="/customers" element={<Customer />} />
                <Route path="/products/create" element={<AddProduct />} />
                <Route path="/products" element={<Products />} />
                <Route path="/admin/create" element={<CreateAdmin />} />
                <Route path="/terms/create" element={<AddTermsConditions />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
  )
}

export default App