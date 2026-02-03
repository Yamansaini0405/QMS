"use client"
import React from "react"

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
  const [sortConfig, setSortConfig] = useState({ key: "company_name", direction: "asc" })
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

      if (quotationSortConfig.key === "created_at") {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      } else if (quotationSortConfig.key === "total") {
        valueA = parseFloat(a.total) || 0
        valueB = parseFloat(b.total) || 0
      } else if (quotationSortConfig.key === "status") {
        valueA = (valueA ?? "").toString().toLowerCase()
        valueB = (valueB ?? "").toString().toLowerCase()
      } else if (quotationSortConfig.key === "assigned_to") {
        valueA = (a.assigned_to?.name ?? "").toLowerCase()
        valueB = (b.assigned_to?.name ?? "").toLowerCase()
      } else {
        valueA = (valueA ?? "").toString().toLowerCase()
        valueB = (valueB ?? "").toString().toLowerCase()
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
      
      setCustomers(prev => prev.map(cust => ({
        ...cust,
        quotations: cust.quotations.map(q => q.id === id ? { ...q, status: newStatus } : q)
      })))

      Swal.fire("Updated!", "Status updated.", "success")
    } catch (err) {
      Swal.fire("Error!", "Failed to update status.", "error")
    }
  }

  const handleExport = async () => {
    const pdfUrls = filteredCustomers
      .flatMap((customer) => customer.quotations || [])
      .map((q) => q.url)
      .filter((url) => !!url)

    if (pdfUrls.length === 0) {
      Swal.fire("Missing Url", "No PDF URLs available.", "warning")
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

  // Grouped logic with calculation for sortable derived fields
  const groupedByCompany = customers.reduce((acc, customer) => {
    const companyKey = customer.company_name || "No Company";
    if (!acc[companyKey]) {
      acc[companyKey] = {
        company_name: companyKey,
        contacts: [],
        allQuotations: [],
        latestDate: new Date(0)
      };
    }
    acc[companyKey].contacts.push({ name: customer.name, email: customer.email, phone: customer.phone });
    if (customer.quotations) {
      acc[companyKey].allQuotations.push(...customer.quotations.map(q => ({ ...q, contact_person: customer.name })));
      
      const custLatest = customer.quotations.length > 0 
        ? Math.max(...customer.quotations.map(q => new Date(q.created_at))) 
        : 0;
      if (custLatest > acc[companyKey].latestDate) acc[companyKey].latestDate = custLatest;
    }
    return acc;
  }, {});

  const companies = Object.values(groupedByCompany);

  // Filter Search
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort Table logic
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key === "total_quotes") {
      valA = a.allQuotations.length;
      valB = b.allQuotations.length;
    } else if (sortConfig.key === "latest_quote") {
      valA = new Date(a.latestDate);
      valB = new Date(b.latestDate);
    } else {
      valA = (valA ?? "").toString().toLowerCase();
      valB = (valB ?? "").toString().toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

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

      setCustomers(prev => prev.map(cust => ({
        ...cust,
        quotations: cust.quotations.filter(q => q.id !== id)
      })))

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
                placeholder="Search company or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
          {localStorage.getItem("role") === "ADMIN" && (
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border">
              <Download className="w-4 h-4" />
              <span>Export Merged PDF</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("company_name")}
                >
                  Company Name <SortIcon column="company_name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacts</th>
                <th 
                   className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                   onClick={() => handleSort("total_quotes")}
                >
                  Total Quotes <SortIcon column="total_quotes" />
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("latest_quote")}
                >
                  Latest Quote Date <SortIcon column="latest_quote" />
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCompanies.map((company, index) => (
                <React.Fragment key={company.company_name}>
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
                      <div className="flex flex-wrap gap-1">
                        {company.contacts.map((contact, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">
                            {contact.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {company.allQuotations.length} Quotations
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {company.latestDate !== 0 ? new Date(company.latestDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-gray-800">
                        {expandedCustomer === company.company_name ? <ChevronDown /> : <ChevronRight />}
                      </button>
                    </td>
                  </tr>
                  {expandedCustomer === company.company_name && (
                    <tr className="bg-white">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" /> Quotations List
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="text-gray-500 border-b bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("contact_person")}>
                                      Customer Name <QuotationSortIcon column="contact_person" />
                                    </th>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("quotation_number")}>
                                      Quote ID <QuotationSortIcon column="quotation_number" />
                                    </th>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("total")}>
                                      Amount <QuotationSortIcon column="total" />
                                    </th>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("status")}>
                                      Status <QuotationSortIcon column="status" />
                                    </th>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("created_at")}>
                                      Created At <QuotationSortIcon column="created_at" />
                                    </th>
                                    <th className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleQuotationSort("assigned_to")}>
                                      Assigned To <QuotationSortIcon column="assigned_to" />
                                    </th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {console.log(company)}
                                  {sortQuotations(company.allQuotations).map((quotation) => (
                                    <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3 text-gray-700 font-medium">
                                        {quotation.contact_person}
                                      </td>
                                      <td className="px-4 py-3 text-gray-900">{quotation.quotation_number}</td>
                                      <td className="px-4 py-3 font-bold text-gray-900">₹{quotation.total}</td>
                                      <td className="px-4 py-3">
                                        <select
                                          value={quotation.status}
                                          onChange={(e) => handleStatusChange(quotation, quotation.id, e.target.value)}
                                          className={`${getStatusBadge(quotation.status)} text-xs px-2 py-1 rounded-md outline-none cursor-pointer border-none shadow-sm`}
                                        >
                                          <option value="SENT">Sent</option>
                                          <option value="PENDING">Pending</option>
                                          <option value="ACCEPTED">Accepted</option>
                                          <option value="REJECTED">Rejected</option>
                                          <option value="REVISED">Revised</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-3 text-gray-500">
                                        {new Date(quotation.created_at).toLocaleDateString("en-IN", {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                      </td>
                                      <td className="px-4 py-3">
                                        {quotation.assigned_to?.name ? (
                                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                            <Users className="w-3 h-3 mr-1" /> {quotation.assigned_to.name}
                                          </span>
                                        ) : <span className="text-gray-400 italic">Unassigned</span>}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <select 
                                          className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs"
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
                                              handleViewLogs(quotation.activity_logs, quotation.quotation_number);
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
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuotationEditModel
        quotation={selectedQuotation}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => setCustomers(prev => prev.map(c => ({...c, quotations: c.quotations.map(q => q.id === updated.id ? updated : q)})))}
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