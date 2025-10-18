"use client"

import { useState, useEffect } from "react"
import { Users, Building2, Phone, Star, Search, Download, Eye, Edit, Trash2, ArrowUp, ArrowDown, Clock, User2 } from "lucide-react"
import CustomerViewModal from "@/components/CustomerViewModal"
import CustomerEditModal from "@/components/CustomerEditModal"
import CustomerActivityModal from "@/components/CustomerActivityModal"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import * as XLSX from "xlsx"

export default function CustomersPage() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [searchTerm, setSearchTerm] = useState("")
  
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
   const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
 

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${baseUrl}/quotations/api/customers/all/`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
  const withEmail = customers.filter((c) => c.email).length

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
      title: "With Emial",
      value: withEmail.toString(),
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0
    const valueA = a[sortConfig.key] ?? ""
    const valueB = b[sortConfig.key] ?? ""
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const filteredCustomers = sortedCustomers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewCustomer = (customer) => {
    console.log(" Opening view modal for customer:", customer.name)
    setSelectedCustomer(customer)
    setViewModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    console.log(" Opening edit modal for customer:", customer.name)
    setSelectedCustomer(customer)
    setEditModalOpen(true)
  }

   const handleViewActivity = (customer) => {
    console.log(" Opening activity modal for customer:", customer.name, customer.id)
    setSelectedCustomer(customer)
    setActivityModalOpen(true)
  }

  const handleSaveCustomer = (updatedCustomer) => {
    console.log(" Saving customer:", updatedCustomer.name)
    setCustomers((prev) => prev.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer)))
    setEditModalOpen(false)
  }

  const handleDeleteCustomer = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This customer will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })

    if (!result.isConfirmed) return

    try {

      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete your Constumer.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/quotations/api/customers/create/?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete customer: ${response.statusText}`)
      }

      setCustomers((prev) => prev.filter((customer) => customer.id !== id))

      Swal.fire("Deleted!", "The customer has been deleted.", "success")

    } catch (error) {
      console.error("❌ Error deleting customer:", error)
      Swal.fire("Error!", "Failed to delete customer. Please try again.", "error")

    }
  }

 const handleExportExcel = () => {
  if (!customers.length) {
    Swal.fire("No Customers to export", "Please add customers to export", "warning")
    return
  }

  // Map only required fields for export
  const exportData = filteredCustomers.map((c, index) => ({
    "S.No.": index + 1,
    Name: c.name,
    Company: c.company_name || "",
    Email: c.email || "",
    Phone: c.phone || "",
    Address: c.primary_address || "",
    "Created At": c.created_at ? c.created_at.split("T")[0] : "",
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers")

  XLSX.writeFile(workbook, "customers.xlsx")
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
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">All Customers</h1>
              <p className="text-sm md:text-md text-gray-600">Manage your customer database</p>
            </div>
          </div>
        </div>
        <Link to="/customers/create">
          <button className="flex items-center md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <span className="text-lg">+</span>
            <span>New Customer</span>
          </button>
        </Link>
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
          {localStorage.getItem("role") === "ADMIN" ? <div>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => handleExportExcel()}>
              <Download className="w-4 h-4" />
              <span>Export All {filteredCustomers.length}</span>
            </button>
          </div> : ""}


        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Customer <SortIcon column="name" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("company_name")}
                >
                  Company <SortIcon column="company_name" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Contact Info <SortIcon column="email" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("address")}
                >
                  Address <SortIcon column="address" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  Added <SortIcon column="created_at" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((cust, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
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
                    <span className="text-sm text-gray-600">{cust.primary_address}</span>
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
                      {localStorage.getItem("role") === "ADMIN"? <button
                        onClick={() => handleViewActivity(cust)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="View Activity"
                      >
                        <Clock className="w-4 h-4" />
                      </button>:""}
                      {localStorage.getItem("role") == "ADMIN" ? <button
                        onClick={() => handleEditCustomer(cust)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button> :""}
                      {localStorage.getItem("role") == "ADMIN" ? (
                        <button
                          onClick={() => handleDeleteCustomer(cust.id)}
                          className="p-1 text-red-600 transition-colors duration-200"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Customer found</p>
          </div>
        )}
      </div>
      <CustomerViewModal customer={selectedCustomer} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <CustomerEditModal
        customer={selectedCustomer}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <CustomerActivityModal
        customer={selectedCustomer}
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />
    </div>
  )
}
