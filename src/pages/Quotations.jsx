"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  IndianRupee,
  Search,
  Download,
  Plus,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit,
  ChevronRight,
  ChevronDown,
  Building2,
  XCircle,
  AlertCircle,
  ArrowLeftRight,
  X
} from "lucide-react"
import QuotationEditModel from "../components/QuotationEditModel"
import Swal from "sweetalert2"
import ViewLogsModal from "@/components/ViewLogsModal"
import { useQuotation } from "@/contexts/QuotationContext"

const AssignQuotationModal = ({ isOpen, onClose, quotation, salespersons }) => {
  if (!isOpen) return null

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSalespersonId, setSelectedSalespersonId] = useState(null)
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const filteredSalespersons = salespersons.filter((sp) =>
    sp?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleConfirm = async () => {
    if (!selectedSalespersonId) return

    try {
      Swal.fire({
        title: "Reassigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const response = await fetch(`${baseUrl}/quotations/api/quotations/${quotation.id}/assign/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assigned_to_id: selectedSalespersonId }),
      })

      if (!response.ok) throw new Error("Reassignment failed")
      
      Swal.fire("Success!", "Quotation has been reassigned.", "success")
      onClose()
      window.location.reload();
    } catch (error) {
      console.error("Failed to assign quotation:", error)
      Swal.fire("Error!", "Could not reassign quotation.", "error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reassign Quotation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search salesperson..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="max-h-50 overflow-y-auto border rounded-lg">
          {filteredSalespersons.map((sp) => (
            <div
              key={sp.id}
              onClick={() => setSelectedSalespersonId(sp.id)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedSalespersonId === sp.id ? "bg-purple-100 font-semibold" : ""}`}
            >
              {sp.username} ({sp.role})
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg outline-none">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSalespersonId}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  )
}
// ====================================================================

const Quotations = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { setFormData, updateFormData } = useQuotation()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [quotationSortConfig, setQuotationSortConfig] = useState({ key: null, direction: "asc" })
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [expandedCustomer, setExpandedCustomer] = useState(null)
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [selectedQuotationLogs, setSelectedQuotationLogs] = useState(null)
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
  const [quotationToReassign, setQuotationToReassign] = useState(null)
  const [salespersons, setSalespersons] = useState([])

  const navigate = useNavigate()

  const toggleDropdown = (quotationId) => {
    setOpenDropdown(openDropdown === quotationId ? null : quotationId)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${baseUrl}/quotations/api/customers/all/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const result = await response.json()

        if (result.data && Array.isArray(result.data)) {
          const filteredCustomers = result.data
            .map(customer => {
              const nonDraftQuotations = (customer.quotations || []).filter(
                q => q.status !== "DRAFT"
              )
              return {
                ...customer,
                quotations: nonDraftQuotations,
              }
            })
            .filter(customer => customer.quotations.length > 0)

          setCustomers(filteredCustomers)
        } else {
          setCustomers([])
        }
      } catch (error) {
        console.error("❌ Error fetching customers:", error)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${baseUrl}/accounts/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setSalespersons(data.data.filter((sp) => sp.phone_number !== null) || [])
      } catch (error) {
        console.error("❌ Error fetching salespeople:", error)
      }
    }
    fetchSalespersons()
  }, [])

  const handleOpenAssignModal = (quotation) => {
    setQuotationToReassign(quotation)
    setIsAssigneeModalOpen(true)
  }

  const allQuotations = customers.flatMap((customer) => (customer.quotations || []).filter((q) => q.status !== "DRAFT"))

  const totalValue = allQuotations.reduce((sum, q) => {
    const value = typeof q.total === "string" ? Number.parseFloat(q.total.replace(/[^\d.]/g, "")) : Number(q.total) || 0
    return sum + value
  }, 0)

  const pendingCount = allQuotations.filter((q) => q.status === "PENDING").length
  const acceptedCount = allQuotations.filter((q) => q.status === "ACCEPTED").length




  const stats = [
    {
      title: "Total Quotations",
      value: allQuotations.length,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Accepted",
      value: acceptedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Value",
      value: `Rs. ${totalValue.toFixed(2)}`,
      icon: IndianRupee,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const toggleExpand = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId)
  }

  const handleViewQuotation = (quotation) => {
    if (quotation.url) {
      window.open(quotation.url, "_blank")
    } else {
      Swal.fire("Error!", "PDF not available for this quotation.", "error")
    }
  }
  const handleDeleteQuotation = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This quotation will be permanently deleted!",
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
        text: "Please wait while we delete your Quotation.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/quotations/api/quotations/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        Swal.fire("Error!", `Failed to delete: ${errorText}`, "error")
        throw new Error(`Delete failed: ${response.status} - ${errorText}`)
      }

      setCustomers((prev) =>
        prev.map((customer) => ({
          ...customer,
          quotations: customer.quotations.filter((q) => q.id !== id),
        })),
      )
      Swal.fire("Deleted!", "The quotation has been deleted.", "success")
    } catch (error) {
      console.error("Failed to delete quotation:", error)
      Swal.fire("Error!", "Something went wrong while deleting.", "error")
    }
  }

  const handleQuotationSort = (key) => {
    let direction = "asc"
    if (quotationSortConfig.key === key && quotationSortConfig.direction === "asc") {
      direction = "desc"
    }
    setQuotationSortConfig({ key, direction })
  }

  const sortQuotations = (quotations) => {
    if (!quotationSortConfig.key) return quotations
    return [...quotations].sort((a, b) => {
      let valueA = a[quotationSortConfig.key]
      let valueB = b[quotationSortConfig.key]

      // Handle nested assigned_to sorting
      if (quotationSortConfig.key === "assigned_to") {
        valueA = a.assigned_to?.name?.toLowerCase() ?? ""
        valueB = b.assigned_to?.name?.toLowerCase() ?? ""
      }

      // handle special cases
      if (quotationSortConfig.key === "created_at" || quotationSortConfig.key === "follow_up_date") {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      } else if (quotationSortConfig.key === "total") {
        valueA = parseFloat(a.total) || 0
        valueB = parseFloat(b.total) || 0
      } else {
        valueA = valueA ?? ""
        valueB = valueB ?? ""
      }

      if (valueA < valueB) return quotationSortConfig.direction === "asc" ? -1 : 1
      if (valueA > valueB) return quotationSortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }

  const QuotationSortIcon = ({ column }) => {
    if (quotationSortConfig.key !== column) return <ArrowUp className="inline w-3 h-3 ml-1 text-gray-300" />
    return quotationSortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-3 h-3 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-3 h-3 ml-1 text-blue-600" />
    )
  }



  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUp className="inline w-4 h-4 ml-1 text-gray-300" />
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-purple-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-purple-600" />
    )
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case "SENT": return `${baseClasses} bg-blue-100 text-blue-800`
      case "ACCEPTED": return `${baseClasses} bg-green-100 text-green-800`
      case "REJECTED": return `${baseClasses} bg-red-100 text-red-800`
      case "REVISED": return `${baseClasses} bg-black text-white`
      default: return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleStatusChange = async (quotation, id, newStatus) => {
    try {
      Swal.fire({
        title: "Updating...",
        text: "Updating status.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const res = await fetch(`${baseUrl}/accounts/api/quotations/${id}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")
      
      setCustomers((prev) =>
        prev.map((customer) => ({
          ...customer,
          quotations: customer.quotations.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
        })),
      )

      Swal.fire("Updated!", "Status updated.", "success")
    } catch (err) {
      console.error("❌ Error updating quotation status:", err)
      Swal.fire("Error!", "Error updating status. Please try again.", "error")
    }
  }

  const handleExport = async () => {
    const pdfUrls = filteredCustomers
      .flatMap((customer) => customer.quotations || [])
      .map((q) => q.url)
      .filter((url) => !!url)

    if (pdfUrls.length === 0) {
      Swal.fire("Missing Url", "No PDF URLs available to export.", "warning")
      return
    }

    try {
      const response = await fetch(`${baseUrl}/quotations/api/merge/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ pdf_urls: pdfUrls }),
      })

      if (!response.ok) throw new Error("Failed to export")
      const data = await response.json()
      if (data.final_url) window.open(data.final_url, "_blank")
    } catch (error) {
      Swal.fire("Error!", "Export failed.", "error")
    }
  }

  const handleViewLogs = async (quotation) => {
    setSelectedQuotationLogs({
      quotation,
      logs: quotation.activity_logs || [],
    })
    setIsLogsModalOpen(true)
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0
    let valueA = a[sortConfig.key] ?? ""
    let valueB = b[sortConfig.key] ?? ""
    
    valueA = valueA.toString().toLowerCase()
    valueB = valueB.toString().toLowerCase()

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const filteredCustomers = sortedCustomers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toString().toLowerCase().includes(searchTerm.toLowerCase())

    if (statusFilter === "All Status") {
      return matchesSearch
    } else {
      const hasMatchingQuotation = customer.quotations?.some((q) => q.status === statusFilter)
      return matchesSearch && hasMatchingQuotation
    }
  })

  const handleEditQuotation = (quotation) => {
    setSelectedQuotation(quotation)
    setIsEditModalOpen(true)
  }



  const handleSaveQuotation = (updatedQuotation) => {
    setCustomers((prev) =>
      prev.map((customer) => ({
        ...customer,
        quotations: customer.quotations.map((q) => (q.id === updatedQuotation.id ? updatedQuotation : q)),
      })),
    )
  }



  const getStatusIcon = (status) => {
    switch (status) {
      case "SENT":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "REVISED":
        return <ArrowLeftRight className="w-4 h-4 text-black" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Quotations...</p>
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
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">All Quotations</h1>
              <p className="text-sm md:text-md text-gray-600">Manage and track all quotations</p>
            </div>
          </div>
        </div>
        <Link to="/quotations/new">
          <button className="flex items-center md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
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
          {localStorage.getItem("role") === "ADMIN" && (
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border">
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sno.</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("name")}>
                  Customer <SortIcon column="name" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("company_name")}>
                  Company <SortIcon column="company_name" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("email")}>
                  Email <SortIcon column="email" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("phone")}>
                  Phone <SortIcon column="phone" />
                </th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers
                .filter((c) => c.quotations && c.quotations.filter(q => q.status !== "DRAFT").length > 0)
                .map((customer, index) => (
                  <>
                    <tr className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => toggleExpand(customer.id)}>
                      <td className="px-6 py-4 text-gray-600 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          {customer.company_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{customer.email}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{customer.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          {expandedCustomer === customer.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>

                    {expandedCustomer === customer.id && (
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("quotation_number")}>
                                      Quotation <QuotationSortIcon column="quotation_number" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("total")}>
                                      Amount <QuotationSortIcon column="total" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("status")}>
                                      Status <QuotationSortIcon column="status" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("created_at")}>
                                      Created <QuotationSortIcon column="created_at" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("assigned_to")}>
                                      Assigned To <QuotationSortIcon column="assigned_to" />
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {sortQuotations(customer.quotations.filter(q => q.status !== "DRAFT")).map((quotation) => (
                                    <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-3 h-3 text-purple-600" />
                                          </div>
                                          <span className="font-medium text-gray-900">{quotation.quotation_number}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">₹{quotation.total}</td>
                                      <td className="px-6 py-4">
                                        <select
                                          value={quotation.status}
                                          onChange={(e) => handleStatusChange(quotation, quotation.id, e.target.value)}
                                          className={`${getStatusBadge(quotation.status)} text-sm font-medium px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 cursor-pointer`}
                                        >
                                          <option value="SENT">Sent</option>
                                          <option value="PENDING">Pending</option>
                                          <option value="ACCEPTED">Accepted</option>
                                          <option value="REJECTED">Rejected</option>
                                          <option value="REVISED">Revised</option>
                                        </select>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(quotation.created_at).toLocaleDateString("en-IN", {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Users className="w-2.5 h-2.5 text-gray-700" />
                                          </div>
                                          <span className="text-sm text-gray-900">{quotation.assigned_to?.name || "Unassigned"}</span>
                                          <button
                                            onClick={() => handleOpenAssignModal(quotation)}
                                            title="Reassign Quotation"
                                            className="p-1 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                                          >
                                            <ArrowLeftRight className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <select 
                                          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "view_pdf") {
                                              handleViewQuotation(quotation);
                                            } else if (value === "duplicate") {
                                              navigate(`/quotations/duplicate/${quotation.id}`);
                                            } else if (value === "delete") {
                                              handleDeleteQuotation(quotation.id);
                                            } else if (value === "edit") {
                                              navigate(`/quotations/edit/${quotation.id}`);
                                            } else if (value === "logs") {
                                              handleViewLogs(quotation);
                                            }
                                            e.target.value = "";
                                          }}
                                        >
                                          <option value="">Action</option>
                                          <option value="view_pdf">View PDF</option>
                                          <option value="edit">Edit</option>
                                          <option value="duplicate">Duplicate</option>
                                          <option value="delete">Delete</option>
                                          <option value="logs">View Logs</option>
                                        </select>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No quotations found</p>
          </div>
        )}
      </div>

      <QuotationEditModel
        quotation={selectedQuotation}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={() => setCustomers(prev => prev)}
      />
      <ViewLogsModal
        quotationLogs={selectedQuotationLogs}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
      <AssignQuotationModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        quotation={quotationToReassign}
        salespersons={salespersons}
      />
    </div>
  )
}

export default Quotations
