

import { useState, useEffect } from "react"
import { Users, Building2, Phone, Star, Search, Download, Eye, Edit, Trash2 } from "lucide-react"
import CustomerViewModal from "@/components/CustomerViewModal"
import CustomerEditModal from "@/components/CustomerEditModal"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customerType, setCustomerType] = useState("All Types")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Sample customer data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("https://qms-2h5c.onrender.com/quotations/api/customers/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("Fetched customers:", result)

        // backend sends { data: [...] }
        setCustomers(result.data || [])
      } catch (error) {
        console.error("❌ Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // calculate stats
  const totalCustomers = customers.length
  const withCompany = customers.filter((c) => c.company_name).length
  const withPhone = customers.filter((c) => c.phone).length
  const recentlyAdded = customers.filter((c) => {
    const created = new Date(c.added)
    const now = new Date()
    const diffDays = (now - created) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }).length


  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "With Company",
      value: withCompany.toString(),
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "With Phone",
      value: withPhone.toString(),
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Recently Added",
      value: recentlyAdded.toString(),
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewCustomer = (customer) => {
    console.log("[v0] Opening view modal for customer:", customer.name)
    setSelectedCustomer(customer)
    setViewModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    console.log("[v0] Opening edit modal for customer:", customer.name)
    setSelectedCustomer(customer)
    setEditModalOpen(true)
  }

  const handleSaveCustomer = (updatedCustomer) => {
    console.log("[v0] Saving customer:", updatedCustomer.name)
    setCustomers((prev) => prev.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer)))
    setEditModalOpen(false)
  }

  const handleDeleteCustomer = async (id) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(
      `https://qms-2h5c.onrender.com/quotations/api/customers/create/?id=${id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete customer: ${response.statusText}`)
    }

    // ✅ Update local state so UI reflects the deletion
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))

    alert("Customer deleted successfully ✅")
  } catch (error) {
    console.error("❌ Error deleting customer:", error)
    alert("Could not delete customer")
  }
}

if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">All Customers</h1>
              <p className="text-gray-600">Manage your customer database</p>

            </div>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          <span className="text-lg">+</span>
          <span>New Customer</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Filters & Search</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option>All Types</option>
              <option>Individual</option>
              <option>Company</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export All (5)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">S.No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Added</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((cust, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8  bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cust.name}</p>
                        <p className="text-sm text-gray-500">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{cust.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{cust.email}</p>
                      <p className="text-sm text-gray-500">{cust.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{cust.address}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(cust.created_at).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCustomer(cust)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="View Customer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(cust)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        className="p-1text-red-600 transition-colors duration-200"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CustomerViewModal customer={selectedCustomer} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <CustomerEditModal
        customer={selectedCustomer}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}
