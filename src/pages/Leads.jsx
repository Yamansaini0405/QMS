"use client"

import { useState, useEffect } from "react"
import { Target, TrendingUp, Users, CheckCircle, Search, Download, Eye, Trash, ArrowUp, ArrowDown, ChevronRight, ChevronDown, Trash2, Building2, FileText, ArrowRightLeft, X } from "lucide-react"
import LeadViewModal from "../components/LeadViewModal"
import { Link } from "react-router-dom"
import QuotationEditModal from "@/components/QuotationEditModel"
import Swal from "sweetalert2"
import CustomerViewModal from "@/components/CustomerViewModal"
import * as XLSX from "xlsx"
import { fetchUserPermissions, getUserPermissions } from "@/utils/permissions"
const baseUrl = import.meta.env.VITE_BASE_URL;

const AssignLeadModal = ({ isOpen, onClose, lead, salespersons }) => {
  if (!isOpen) return null

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSalespersonId, setSelectedSalespersonId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredSalespersons = salespersons.filter((sp) =>
    sp?.username.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const handleConfirm = async () => {
    if (!selectedSalespersonId) {
      console.error("No salesperson ID is selected.")
      return
    }

    setIsLoading(true) // Start loading

    try {
      Swal.fire({
        title: "Reassigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      const response = await fetch(`${baseUrl}/quotations/api/leads/${lead.id}/assign/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          assigned_to_id: selectedSalespersonId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API Error: ${response.status}`)
      }
      Swal.fire("Success!", "Lead has been reassigned.", "success")

      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Failed to assign lead:", error)
      // You could add another state here to display an error message to the user
    } finally {
      setIsLoading(false) // Stop loading, whether it succeeded or failed
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reassign Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-4 text-gray-600">
          Reassigning lead for: <span className="font-medium text-gray-800">{lead.customer?.name}</span>
        </p>
        <input
          type="text"
          placeholder="Search salesperson..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="max-h-60 overflow-y-auto border rounded-lg">
          {filteredSalespersons.map((sp) => (
            <div
              key={sp.id}
              onClick={() => setSelectedSalespersonId(sp.id)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedSalespersonId === sp.id ? "bg-blue-100 font-semibold" : ""
                }`}
            >
              {sp.username}({sp.role})
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
            className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:bg-gray-400 hover:bg-gray-800"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  )
}


export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [sourceFilter, setSourceFilter] = useState("All Sources")
  const [assigneeFilter, setAssigneeFilter] = useState("All Assignees")
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [editQuotationOpen, setEditQuotationOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [leadSortConfig, setLeadSortConfig] = useState({ key: null, direction: "asc" })

  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [customers, setCustomers] = useState([])
  const [expandedCustomer, setExpandedCustomer] = useState(null)

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
  const [leadToReassign, setLeadToReassign] = useState(null)
  const [salespersons, setSalespersons] = useState([])

  const permissions = getUserPermissions();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${baseUrl}/quotations/api/customers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch customers")

        const data = await res.json()
        //backend returns data:[{}] inside 
        setCustomers(data.data || data)
        await fetchUserPermissions();
      } catch (err) {
        console.error("❌ Error fetching customers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const toggleExpand = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId)
  }

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${baseUrl}/accounts/api/users/`, { // Assuming this is your endpoint
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch salespeople")
        const data = await res.json()
        setSalespersons(data.data.filter((sp) => sp.phone_number !== null) || [])
      } catch (error) {
        console.error("❌ Error fetching salespeople:", error)
      }
    }
    fetchSalespersons()
  }, [])

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token") // 🔑 get token

        const res = await fetch(`${baseUrl}/quotations/api/leads/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch leads")
        }

        const data = await res.json()


        // backend may return {data: [...]} or [...]
        setLeads(data.data || data)
      } catch (error) {
        console.error("❌ Error fetching leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const totalLeads = customers.map((c => c.leads ? c.leads.length : 0)).reduce((a, b) => a + b, 0)
  const newLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "NEW").length : 0)).reduce((a, b) => a + b, 0)
  const qualifiedLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "QUALIFIED").length : 0)).reduce((a, b) => a + b, 0)
  const pendingLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "PENDING").length : 0)).reduce((a, b) => a + b, 0)

  const handleOpenAssignModal = (lead) => {
    setLeadToReassign({ ...lead, customer: customers.find(c => c.leads.some(l => l.id === lead.id)) })
    setIsAssigneeModalOpen(true)
  }

  const handleConfirmAssignment = async (leadId, newAssigneeId) => {
    try {
      Swal.fire({
        title: "Reassigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const token = localStorage.getItem("token")
      const res = await fetch(`${baseUrl}/quotations/api/leads/${leadId}/assign/`, { // Assuming this is your endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignee_id: newAssigneeId }),
      })

      if (!res.ok) {
        throw new Error("Server failed to reassign lead.")
      }
      const updatedLeadData = await res.json();


      // Update state locally
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) => {
          if (customer.leads.some((l) => l.id === leadId)) {
            return {
              ...customer,
              leads: customer.leads.map((lead) =>
                lead.id === leadId ? { ...lead, assigned_to: updatedLeadData.assigned_to } : lead
              ),
            }
          }
          return customer
        })
      )

      setIsAssigneeModalOpen(false)
      Swal.fire("Success!", "Lead has been reassigned.", "success")
      window.location.reload()
    } catch (error) {
      console.error("❌ Failed to reassign lead:", error)
      Swal.fire("Error!", "Could not reassign lead. Please try again.", "error")
    }
  }




  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "New",
      value: newLeads.toString(),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Qualified",
      value: qualifiedLeads.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending",
      value: pendingLeads.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    ,
  ]

  const handleSortLead = (key) => {
    let direction = "asc"
    if (leadSortConfig.key === key && leadSortConfig.direction === "asc") {
      direction = "desc"
    }
    setLeadSortConfig({ key, direction })
  }

  const LeadSortIcon = ({ column }) => {
    if (leadSortConfig.key !== column) return null
    return leadSortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="inline w-3 h-3 ml-1" />
    )
  }



  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }

  const handleSortCust = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
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
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(customer.phone).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedLeads = (leads) => {
    return [...leads].sort((a, b) => {
      if (!leadSortConfig.key) return 0
      let valueA, valueB

      if (leadSortConfig.key === "customer") {
        valueA = a.customer?.name ?? ""
        valueB = b.customer?.name ?? ""
      } else if (leadSortConfig.key === "company") {
        valueA = a.customer?.company_name ?? ""
        valueB = b.customer?.company_name ?? ""
      } else if (leadSortConfig.key === "assignee") {
        valueA = a.assigned_to?.name ?? ""
        valueB = b.assigned_to?.name ?? ""
      } else {
        valueA = a[leadSortConfig.key] ?? ""
        valueB = b[leadSortConfig.key] ?? ""
      }

      if (valueA < valueB) return leadSortConfig.direction === "asc" ? -1 : 1
      if (valueA > valueB) return leadSortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }

  const handleViewLead = (lead) => {
    setSelectedLead(lead)
    setViewModalOpen(true)
  }

  const handleEditLead = (lead) => {
    setSelectedLead(lead)
    setEditModalOpen(true)
  }

  const handleDeleteLead = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })

    if (!result.isConfirmed) return

    try {
      // 🔹 call backend API
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete your Lead.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete lead from server")
      }

      // 🔹 update UI
      setLeads((prev) => prev.filter((lead) => lead.id !== id))
      setCustomers((prev) =>
        prev.map((c) => ({
          ...c,
          leads: c.leads ? c.leads.filter((l) => l.id !== id) : [],
        }))
      )

      Swal.fire("Deleted!", "The lead has been deleted.", "success")




    } catch (err) {
      console.error(err)
      Swal.fire("Error!", "Failed to delete lead. Please try again.", "error")


    }
  }

  const handleCreateQuotation = async (quotationId) => {
    try {
      const token = localStorage.getItem("token")



      const res = await fetch(`${baseUrl}/quotations/api/quotations/${quotationId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch quotation for this lead")
      }

      const data = await res.json()


      // 🔹 open modal with fetched quotation
      setSelectedQuotation(data.data)
      setEditQuotationOpen(true)
    } catch (error) {
      console.error("❌ Error fetching quotation:", error)
      alert("Error loading quotation. Please try again.")
    }
  }

  const handleStatusChange = async (lead, id, newStatus) => {
    const payload = {
      id: id,
      // customer_name: lead.customer.name,
      // customer_email: lead.customer.email,
      // customer_phone: lead.customer.phone,
      status: newStatus,
      // priority: lead.priority,
    }

    try {
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update your Lead status.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })
      const res = await fetch(`${baseUrl}/accounts/api/leads/${id}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to update status on server")
      }

      // ✅ Update UI
      //change the status in leads state setCustomers
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) => {
          if (customer.leads.some((l) => l.id === id)) {
            return {
              ...customer,
              leads: customer.leads.map((lead) =>
                lead.id === id ? { ...lead, status: newStatus } : lead
              ),
            }
          }
          return customer
        })
      )

      Swal.fire("Updated!", "The lead has been updated.", "success")

    } catch (err) {
      console.error(err)
      Swal.fire("Error!", "Failed to update lead. Please try again.", "error")

    }
  }

  const handleSaveLead = async (updatedLead) => {
    try {


      // Simulate API call
      const response = await fetch("/api/leads/" + updatedLead.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLead),
      })

      if (!response.ok) {
        throw new Error("Failed to update lead. Please try again.")
      }

      const savedLead = await response.json()
      setLeads((prev) => prev.map((lead) => (lead.id === savedLead.id ? savedLead : lead)))
      setEditModalOpen(false)
    } catch (error) {
      console.error("❌ Error saving lead:", error)
      // For demo purposes, still update locally
      setLeads((prev) => prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)))
      setEditModalOpen(false)
    }
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setViewModalOpen(true)
  }

  const handleExportExcel = () => {
    if (!filteredCustomers.length) {
      Swal.fire("No Leads to export", "No leads found for filtered customers", "warning")
      return
    }

    // Flatten leads for all filtered customers
    const exportData = []
    filteredCustomers.forEach((c, cIndex) => {
      if (c.leads && c.leads.length > 0) {
        c.leads.forEach((lead, lIndex) => {
          exportData.push({
            "S.No.": exportData.length + 1,
            Customer: c.name,
            Company: c.company_name || "",
            Email: c.email || "",
            Phone: c.phone || "",
            LeadStatus: lead.status || "",
            LeadSource: lead.lead_source || "",
            Assignee: lead.assigned_to?.name || "Unassigned",
            CreatedAt: lead.created_at ? lead.created_at.split("T")[0] : "",
          })
        })
      }
    })

    if (!exportData.length) {
      Swal.fire("No Leads", "Filtered customers have no leads to export", "info")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")

    XLSX.writeFile(workbook, "leads.xlsx")
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">All Leads</h1>
              <p className="text-sm md:text-md text-gray-600">Manage and track sales leads</p>
            </div>
          </div>
        </div>
        <Link to="/leads/create">
          <button className="flex items-center md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <span className="text-lg">+</span>
            <span>New Lead</span>
          </button>
        </Link>
      </div>

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
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 mr-4"
              />

            </div>

          </div>
          {localStorage.getItem("role") === "ADMIN" ? <div>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => handleExportExcel()}>
              <Download className="w-4 h-4" />
              <span>Export All {filteredCustomers.reduce((count, customer) => {
                return count + (customer.leads ? customer.leads.length : 0)
              }, 0)}</span>
            </button>
          </div> : ""}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSortCust("name")}>
                  Customer <SortIcon column="name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSortCust("company")}>
                  Company <SortIcon column="company" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSortCust("email")}>
                  Email <SortIcon column="email" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSortCust("phone")}>
                  Phone <SortIcon column="phone" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers
                .filter((c) => c.leads && c.leads.length > 0)
                .map((customer, index) => (
                  <>
                    {/* Customer Row */}
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => toggleExpand(customer.id)}>

                      <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center justify-start gap-2"><div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>{customer.name}</td>
                      <td className="px-6 py-4 text-gray-700 "><div className="flex  items-center justify-start gap-2"><Building2 className="w-4 h-4 text-gray-400" />{customer.company_name}</div></td>
                      <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.phone}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpand(customer.id)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          {expandedCustomer === customer.id ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Leads Sublist */}
                    {expandedCustomer === customer.id && (

                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          {customer.leads.length > 0 ? (
                            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("name")}
                                  >
                                    Lead <LeadSortIcon column="name" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("company")}
                                  >
                                    Company <LeadSortIcon column="company" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("status")}
                                  >
                                    Status <LeadSortIcon column="status" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("lead_source")}
                                  >
                                    Source <LeadSortIcon column="lead_source" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("assignee")}
                                  >
                                    Assignee <LeadSortIcon column="assignee" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("created_at")}
                                  >
                                    Created <LeadSortIcon column="created_at" />
                                  </th>

                                  <th
                                    className="px-4 py-3 text-left cursor-pointer"
                                    onClick={() => handleSortLead("quotation")}
                                  >
                                    Quotation <LeadSortIcon column="quotation" />
                                  </th>

                                  {permissions?.lead?.includes("delete") && (
                                    <th className="px-4 py-3 text-left">Actions</th>
                                  )}
                                </tr>

                              </thead>
                              <tbody>
                                {sortedLeads(customer.leads).map((lead) => (
                                  <tr key={lead.id} className="border-t hover:bg-white">
                                    {/* Lead Name */}
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                      {customer.name}
                                    </td>

                                    {/* Company */}
                                    <td className="px-4 py-2 text-gray-700">
                                      {customer.company_name}
                                    </td>

                                    {/* Status with Dropdown */}
                                    <td className="px-4 py-2">
                                      <select
                                        value={lead.status}
                                        onChange={(e) => handleStatusChange(lead, lead.id, e.target.value)}
                                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                                      >
                                        <option value="LOST">Lost</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="QUALIFIED">Qualified</option>
                                        <option value="CONVERTED">Converted</option>
                                        <option value="REVISED">Revised</option>
                                      </select>
                                    </td>

                                    {/* Source */}
                                    <td className="px-4 py-2">{lead.lead_source || "-"}</td>

                                    {/* Assignee */}
                                    <td className="px-4 py-2">
                                      <div className="flex items-center space-x-2">
                                        <span>{lead.assigned_to?.name || "Unassigned"}</span>
                                        <button
                                          onClick={() => handleOpenAssignModal(lead)}
                                          title="Reassign Lead"
                                          className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100"
                                        >
                                          <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>

                                    {/* Created Date */}
                                    <td className="px-4 py-2">
                                      {new Date(lead.created_at).toLocaleDateString()}
                                    </td>

                                    {/* Quotation Column */}
                                    <td className="px-4 py-2">
                                      {lead.file_url ? (
                                        <a
                                          href={lead.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="hover:underline bg-green-700 text-white px-2 py-1 rounded-md "
                                        >
                                          Download
                                        </a>
                                      ) : (
                                        <button
                                          onClick={() => handleCreateQuotation(lead.quotation)}
                                          className="text-white hover:underline bg-green-700 px-2 py-1 rounded-lg   "
                                        >
                                          Create
                                        </button>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    {permissions?.lead?.includes("delete") && (
                                      <td className="px-4 py-2 flex space-x-1 text-center">
                                        <button
                                          onClick={() => handleDeleteLead(lead.id, customer)}
                                          className="p-1 text-gray-400 hover:text-red-600"
                                          title="Delete Lead"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                        <Link to={`/leads/view/${lead.id}`}>
                                          <button className=" bg-gray-200  px-2 py-0.5 rounded-md cursor-pointer hover:bg-gray-300 text-gray-700">
                                          view
                                        </button>
                                        </Link>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-gray-500">No leads found for this customer.</p>
                          )}
                        </td>
                      </tr>
                    )}

                  </>
                ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Leads found</p>
          </div>
        )}
      </div>
      <CustomerViewModal customer={selectedCustomer} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <LeadViewModal lead={selectedLead} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />
      <QuotationEditModal
        quotation={selectedQuotation}
        isOpen={editQuotationOpen}
        onClose={() => setEditQuotationOpen(false)}
        onSave={(updatedQuotation) => {

          setEditQuotationOpen(false)
        }}
      />
      <AssignLeadModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        lead={leadToReassign}
        salespersons={salespersons}
      />
    </div>
  )
}
