"use client"

import { useState, useEffect, useMemo } from "react" // Added useMemo
import {
  FileText,
  Search,
  Eye,
  IndianRupee,
  User,
  Building2,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  X,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  History,
  ChevronLeft, 
  ChevronRight // Added Chevron icons for pagination
} from "lucide-react"
import Swal from "sweetalert2"
import ViewLogsModal from "@/components/ViewLogsModal";
import { useNavigate } from "react-router-dom";
import { fetchUserPermissions, getUserPermissions } from "@/utils/permissions";
const baseUrl = import.meta.env.VITE_BASE_URL;

// ====================================================================
// AssignQuotationModal (No Pagination Changes Needed Here)
// ====================================================================
const AssignQuotationModal = ({ isOpen, onClose, quotation, salespersons }) => {
  if (!isOpen) return null

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSalespersonId, setSelectedSalespersonId] = useState(null)

  const filteredSalespersons = salespersons.filter((sp) =>
    sp?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleConfirm = async () => {
    // Ensure a salesperson is selected before proceeding.
    if (!selectedSalespersonId) {
      console.error("No salesperson selected.")
      return
    }

    try {
      Swal.fire({
        title: "Reassigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      // Send the POST request to the API endpoint
      const payload = { assigned_to_id: selectedSalespersonId }
      const response = await fetch(`${baseUrl}/quotations/api/quotations/${quotation.id}/assign/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })


      if (!response.ok) {

        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status}`)
      }
      Swal.fire("Success!", "Quotation has been reassigned.", "success")
      onClose()
      window.location.reload();
      // Note: onConfirm is not passed as a prop, relies on window.location.reload()
      // onConfirm(quotation.id, selectedSalespersonId) 


    } catch (error) {
      console.error("Failed to assign quotation:", error)
      // Swal.fire("Error!", "Could not reassign quotation. Please try again.", "error")

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
        <p className="mb-4 text-gray-600">
          Reassigning Quotation:{" "}
          <span className="font-medium text-gray-800">{quotation.quotation_number}</span> for{" "}
          <span className="font-medium text-gray-800">{quotation.customer?.name}</span>
        </p>
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
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedSalespersonId === sp.id ? "bg-purple-100 font-semibold" : ""
                }`}
            >
              {sp.username} ({sp.role})
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSalespersonId}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-700"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  )
}
// ====================================================================


export default function AllQuotations() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [quotationSortConfig, setQuotationSortConfig] = useState({ key: null, direction: "asc" })

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
  const [quotationToReassign, setQuotationToReassign] = useState(null)
  const [salespersons, setSalespersons] = useState([])
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [selectedQuotationLogs, setSelectedQuotationLogs] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  
  // --- PAGINATION STATE ---
  const LEADS_PER_PAGE = 20 // Set leads per page to 20
  const [currentPage, setCurrentPage] = useState(1)
  // --------------------------
  
  const permissions = getUserPermissions();
  const navigate = useNavigate()


  const toggleDropdown = (quotationId) => {
    setOpenDropdown(openDropdown === quotationId ? null : quotationId)
  }
  const closeDropdown = () => {
    setOpenDropdown(null)
  }


  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true)
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`${baseUrl}/quotations/api/quotations/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()
        setQuotations(data.data || [])
        setCurrentPage(1); // Reset page on data fetch
        await fetchUserPermissions();
      } catch (error) {
        console.error("Error fetching quotations:", error)
        setQuotations([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuotations()
  }, [setQuotationToReassign])

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${baseUrl}/accounts/api/users/`, { // Assuming this is your endpoint
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch salespeople")
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

  const handleConfirmAssignment = async (quotationId, newAssigneeId) => {
    try {
      Swal.fire({
        title: "Reassigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const token = localStorage.getItem("token")
      const res = await fetch(`${baseUrl}/quotations/api/quotations/${quotationId}/assign/`, { // Assuming this is your endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assigned_id: newAssigneeId }),
      })

      if (!res.ok) {
        throw new Error("Server failed to reassign quotation.")
      }
      const updatedQuotationData = await res.json()

      // Update state locally
      setQuotations((prevQuotations) =>
        prevQuotations.map((q) =>
          q.id === quotationId
            ? { ...q, assigned_to: updatedQuotationData.assigned_to }
            : q
        )
      )

      setIsAssigneeModalOpen(false)
      Swal.fire("Success!", "Quotation has been reassigned.", "success")
    } catch (error) {
      console.error("❌ Failed to reassign quotation:", error)
      Swal.fire("Error!", "Could not reassign quotation. Please try again.", "error")
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

      setQuotations((prevQuotations) => prevQuotations.filter((q) => q.id !== id))
      Swal.fire("Deleted!", "The quotation has been deleted.", "success")
    } catch (error) {
      console.error("Failed to delete quotation:", error)
      Swal.fire("Error!", "Something went wrong while deleting.", "error")
    }
  }

  const handleViewLogs = async (activityLogs, quotationNumber) => {
    setSelectedQuotationLogs({
      logs: activityLogs || [],
      quotationNumber: quotationNumber || "",
    })
    setIsLogsModalOpen(true)
    closeDropdown()
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

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "SENT":
        return `${baseClasses} bg-blue-100 text-blue-800`
      case "ACCEPTED":
        return `${baseClasses} bg-green-100 text-green-800`
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`
      case "REVISED":
        return `${baseClasses} bg-black text-white`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // 1. Filter quotations based on search/status
  const filteredQuotations = useMemo(() => {
    setCurrentPage(1); // Reset page on filter/search change
    return quotations.filter((quotation) => {
      const matchesSearch =
        quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer?.phone?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(quotation.total).toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.assigned_to?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "All" || quotation.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [quotations, searchTerm, statusFilter])


  // 2. Sorting Logic
  //sorting quotation logic ---start--
  const handleQuotationSort = (key) => {
    let direction = "asc"
    if (quotationSortConfig.key === key && quotationSortConfig.direction === "asc") {
      direction = "desc"
    }
    setQuotationSortConfig({ key, direction })
  }

  const sortedQuotations = useMemo(() => {
    if (!quotationSortConfig.key) return filteredQuotations
    return [...filteredQuotations].sort((a, b) => {
      let valueA = a[quotationSortConfig.key]
      let valueB = b[quotationSortConfig.key]

      // handle special cases
      if (quotationSortConfig.key === "created_at" || quotationSortConfig.key === "follow_up_date") {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      } else if (quotationSortConfig.key === "total") {
        valueA = parseFloat(a.total) || 0
        valueB = parseFloat(b.total) || 0
      } else if (quotationSortConfig.key === "customer") {
        valueA = a.customer?.name?.toLowerCase() || ""
        valueB = b.customer?.name?.toLowerCase() || ""
      } else {
        valueA = valueA ?? ""
        valueB = valueB ?? ""
      }

      if (valueA < valueB) return quotationSortConfig.direction === "asc" ? -1 : 1
      if (valueA > valueB) return quotationSortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredQuotations, quotationSortConfig])

  const QuotationSortIcon = ({ column }) => {
    if (quotationSortConfig.key !== column) return null
    return quotationSortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }
  // --- sorting quotation logic ---end--


  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedQuotations.length / LEADS_PER_PAGE)

  const currentQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * LEADS_PER_PAGE
    const endIndex = startIndex + LEADS_PER_PAGE
    return sortedQuotations.slice(startIndex, endIndex)
  }, [sortedQuotations, currentPage])

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  // --- end of Pagination Logic ---


  const handleStatusChange = async (quotation, id, newStatus) => {
    const payload = {
      status: newStatus,
    }


    try {

      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update your Quotation status.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const res = await fetch(`${baseUrl}/accounts/api/quotations/${id}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to update quotation status")
      }

      setQuotations((prevQuotations) =>
        prevQuotations.map((q) =>
          q.id === id ? { ...q, status: newStatus } : q
        )
      )

      Swal.fire("Updated!", "Status updated.", "success")
    } catch (err) {
      console.error("❌ Error updating quotation status:", err)
      Swal.fire("Error!", "Error updating status. Please try again.", "error")
    }
  }


  
  const totalValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0)
  const sentCount = quotations.filter((q) => q.status === "SENT").length
  const acceptedCount = quotations.filter((q) => q.status === "ACCEPTED").length
  const rejectedCount = quotations.filter((q) => q.status === "REJECTED").length

  const stats = [
    {
      title: "Total Quotations",
      value: quotations.length,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Value",
      value: `₹${totalValue.toFixed(2)}`,
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sent",
      value: sentCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Accepted",
      value: acceptedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotations...</p>
        </div>
        <AssignQuotationModal
          isOpen={isAssigneeModalOpen}
          onClose={() => setIsAssigneeModalOpen(false)}
          quotation={quotationToReassign}
          salespersons={salespersons}
        />
        <ViewLogsModal
          quotationLogs={selectedQuotationLogs}
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Quotations</h1>
              <p className="text-sm md:text-md text-gray-600">Manage and track all your quotations</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
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

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="All">All Status</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVISED">Revised</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Showing {sortedQuotations.length} of {quotations.length} quotations
          </p>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>

                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleQuotationSort("quotation_number")}
                  >
                    Quotation <QuotationSortIcon column="quotation_number" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleQuotationSort("customer")}
                  >
                    Customer <QuotationSortIcon column="customer" />
                  </th>

                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleQuotationSort("total")}
                  >
                    Amount <QuotationSortIcon column="total" />
                  </th>

                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleQuotationSort("status")}
                  >
                    Status <QuotationSortIcon column="status" />
                  </th>


                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleQuotationSort("created_at")}
                  >
                    Created <QuotationSortIcon column="created_at" />
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4" >
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.open(quotation.url, "_blank")}>
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{quotation.quotation_number}</p>
                          <p className="text-sm text-gray-500">
                            Tax: {quotation.tax_rate}% | Discount: {quotation.discount}
                            {quotation.discount_type === "percentage" ? "%" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">

                        <div>
                          <p className="font-medium text-gray-900">{quotation.customer?.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Building2 className="w-3 h-3" />
                              <span>{quotation.customer?.company_name}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">

                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{quotation.customer?.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">₹{quotation.total}</p>
                        <p className="text-sm text-gray-500">Subtotal: ₹{quotation.subtotal}</p>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <select
                        value={quotation.status}
                        onChange={(e) => handleStatusChange(quotation, quotation.id, e.target.value)}
                        className={`${getStatusBadge(quotation.status)} text-md px-3 py-2 rounded-md focus:ring-2 `}
                      >
                        <option value="SENT">Sent</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="REVISED">Revised</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">

                        <div>
                          <p className="text-sm text-gray-900">{new Date(quotation.created_at).toLocaleDateString()}</p>
                          {quotation.emailed_at && (
                            <p className="text-xs text-gray-500">
                              Emailed: {new Date(quotation.emailed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-900">{quotation.assigned_to?.name || "Unassigned"}</span>
                        <button
                          onClick={() => handleOpenAssignModal(quotation)}
                          title="Reassign Quotation"
                          className="p-1 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-100"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-28"
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log("Selected action:", value);
                            if (value === "view_pdf") {
                              window.open(quotation.url, "_blank")
                            } else if (value === "duplicate") {
                              navigate(`/quotations/duplicate/${quotation.id}`);
                            } else if (value === "delete") {
                              handleDeleteQuotation(quotation.id);
                            } else if (value === "edit") {
                              navigate(`/quotations/edit/${quotation.id}`)
                            } else if (value === "logs") {
                              handleViewLogs(quotation.activity_logs, quotation.quotation_number);
                            }
                            e.target.value = "";
                          }}
                        >
                          <option value="">Action</option>
                          <option value="view_pdf">View PDF</option>
                          {permissions?.quotation?.includes("edit") && <option value="edit">Edit</option>}
                          <option value="duplicate">Duplicate</option>
                          {permissions?.quotation?.includes("delete") &&
                            <option value="delete">
                              Delete
                            </option>
                          }

                          <option value="logs">View Logs</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentQuotations.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quotations found</p>
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!loading && sortedQuotations.length > 0 && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * LEADS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * LEADS_PER_PAGE, sortedQuotations.length)}</span> of <span className="font-medium">{sortedQuotations.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                Page <span className="font-semibold text-purple-600">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <AssignQuotationModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        quotation={quotationToReassign}
        salespersons={salespersons}
      />
      <ViewLogsModal
        quotationLogs={selectedQuotationLogs}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  )
}