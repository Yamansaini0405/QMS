"use client"
import React  from "react"

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
  ArrowLeftRight
} from "lucide-react"
import QuotationEditModel from "../components/QuotationEditModel"
import Swal from "sweetalert2"
import ViewLogsModal from "@/components/ViewLogsModal"
import { useQuotation } from "../contexts/QuotationContext"



const CompanyQuotations = () => {
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
  const [openDropdown, setOpenDropdown] = useState(null)

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
          // Apply the same filtering logic here
          const filteredCustomers = result.data
            .map(customer => {
              // For each customer, filter out their draft quotations
              const nonDraftQuotations = (customer.quotations || []).filter(
                q => q.status !== "DRAFT"
              )
              // Return a new customer object with the filtered quotations
              return {
                ...customer,
                quotations: nonDraftQuotations,
              }
            })
            // Then, filter out any customer who no longer has any quotations
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
    if (quotationSortConfig.key !== column) return null
    return quotationSortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
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
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0
    let valueA, valueB

    if (sortConfig.key === "name") {
      valueA = a.name ?? ""
      valueB = b.name ?? ""
    } else if (sortConfig.key === "company_name") {
      valueA = a.company_name ?? ""
      valueB = b.company_name ?? ""
    } else if (sortConfig.key === "email") {
      valueA = a.email ?? ""
      valueB = b.email ?? ""
    } else if (sortConfig.key === "phone") {
      valueA = a.phone ?? ""
      valueB = b.phone ?? ""
    } else {
      valueA = a[sortConfig.key] ?? ""
      valueB = b[sortConfig.key] ?? ""
    }

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

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
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

    const payload = {
      pdf_urls: pdfUrls,
    }

    try {


      const response = await fetch(`${baseUrl}/quotations/api/merge/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to export PDFs")
      }

      const data = await response.json()
      Swal.fire("Exported!!", "All Quotation are successfully exported", "success")

      if (data.final_url) {
        window.open(data.final_url, "_blank")
      } else {
        Swal.fire("Error!", "Export failed: no final PDF URL received.", "error")
      }
    } catch (error) {
      console.error("❌ Export failed:", error)
      Swal.fire("Error!", "Export failed. Please try again.", "error")
    }
  }

  const handleViewLogs = async (quotation) => {
    setSelectedQuotationLogs({
      quotation,
      logs: quotation.activity_logs || [],
    })
    setIsLogsModalOpen(true)
    closeDropdown()
  }

  // Group filtered customers by Company Name
const groupedByCompany = filteredCustomers.reduce((acc, customer) => {
  const companyKey = customer.company_name || "No Company";
  
  if (!acc[companyKey]) {
    acc[companyKey] = {
      company_name: companyKey,
      contacts: [],
      allQuotations: []
    };
  }
  
  // Collect contact details for this company
  acc[companyKey].contacts.push({
    name: customer.name,
    email: customer.email,
    phone: customer.phone
  });

  // Merge all quotations for this company
  if (customer.quotations) {
    acc[companyKey].allQuotations.push(...customer.quotations);
  }
  
  return acc;
}, {});

const companies = Object.values(groupedByCompany);




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


            {localStorage.getItem("role") === "ADMIN" ? <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export All  ({filteredCustomers.reduce((total, customer) => {
                return total + (customer.quotations ? customer.quotations.length : 0)
              }, 0)})</span>
            </button> : ""}
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredCustomers.length} customers with {filteredCustomers.reduce((total, customer) => {
            return total + (customer.quotations ? customer.quotations.filter((prev) => prev.status !== "DRAFT").length : 0)
          }, 0)} total quotations

        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company Name</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacts</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Quotes</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Latest Quote Date</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {companies.map((company, index) => (
          <React.Fragment key={company.company_name}>
            {/* Company Row */}
            <tr 
              className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer bg-slate-50/30" 
              onClick={() => toggleExpand(company.company_name)}
            >
              <td className="px-6 py-4 text-gray-600">{index + 1}</td>
              <td className="px-6 py-4 font-bold text-gray-900">
                <div className="flex items-center justify-start gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  {company.company_name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex -space-x-2 overflow-hidden">
                  {company.contacts.map((contact, i) => (
                    <div 
                      key={i} 
                      title={contact.name}
                      className=" h-8 w-8 rounded-full ring-2 ring-white bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold"
                    >
                      {contact.name.charAt(0)}
                    </div>
                  ))}
                  <span className="ml-4 text-xs text-gray-500 self-center">
                    {company.contacts.length} Contact(s)
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-blue-600">
                {company.allQuotations.length} Quotations
              </td>
              <td className="px-6 py-4 text-gray-600 text-sm">
                {company.allQuotations.length > 0 
                  ? new Date(Math.max(...company.allQuotations.map(q => new Date(q.created_at)))).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-500 hover:text-gray-800">
                  {expandedCustomer === company.company_name ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>

            {/* Sub-table for Company Quotations */}
            {expandedCustomer === company.company_name && (
              <tr className="bg-white">
                <td colSpan={6} className="px-6 py-4">
                  <div className="border rounded-xl overflow-hidden shadow-inner bg-gray-50/50 p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Quotations for {company.company_name}
                    </h4>
                    <table className="w-full text-sm">
                      <thead className="text-gray-500 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left">Quote ID</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Created At</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortQuotations(company.allQuotations).map((quotation) => (
                          <tr key={quotation.id} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{quotation.quotation_number}</td>
                            <td className="px-4 py-3 font-bold">₹{quotation.total}</td>
                            <td className="px-4 py-3">
                              <select
                                value={quotation.status}
                                onChange={(e) => handleStatusChange(quotation, quotation.id, e.target.value)}
                                className={`${getStatusBadge(quotation.status)} text-xs px-2 py-1 rounded-md`}
                              >
                                <option value="SENT">Sent</option>
                                <option value="PENDING">Pending</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="REVISED">Revised</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {new Date(quotation.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleViewQuotation(quotation)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
  {companies.length === 0 && (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No company data found</p>
    </div>
  )}
</div>

      <QuotationEditModel
        quotation={selectedQuotation}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveQuotation}
      />
      <ViewLogsModal
        quotationLogs={selectedQuotationLogs}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  )
}

export default CompanyQuotations
