"use client"
import React from "react"

import { useState, useEffect } from "react"
import { Target, TrendingUp, Users, CheckCircle, Search, Download, Eye, Trash, ArrowUp, ArrowDown, ChevronRight, ChevronDown, Trash2, Building2, FileText, ArrowRightLeft, X, TrendingDown, ArrowUpDown, ChevronUp } from "lucide-react"
import LeadViewModal from "../components/LeadViewModal"
import { Link, useNavigate } from "react-router-dom"
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

    setIsLoading(true)

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
    } finally {
      setIsLoading(false)
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

export default function CompanyLeads() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [editQuotationOpen, setEditQuotationOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "company_name", direction: "asc" })
  const [leadSortConfig, setLeadSortConfig] = useState({ key: null, direction: "asc" })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
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

  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${baseUrl}/accounts/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const toggleExpand = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId)
  }

  const handleOpenAssignModal = (lead) => {
    setLeadToReassign({ ...lead, customer: customers.find(c => c.leads.some(l => l.id === lead.id)) })
    setIsAssigneeModalOpen(true)
  }

  const totalLeads = customers.map((c => c.leads ? c.leads.length : 0)).reduce((a, b) => a + b, 0)
  const lostLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "LOST").length : 0)).reduce((a, b) => a + b, 0)
  const qualifiedLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "QUALIFIED").length : 0)).reduce((a, b) => a + b, 0)
  const pendingLeads = customers.map((c => c.leads ? c.leads.filter((l) => l.status === "PROSPECTIVE").length : 0)).reduce((a, b) => a + b, 0)

  const stats = [
    { title: "Total Leads", value: totalLeads.toString(), icon: Target, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Lost", value: lostLeads.toString(), icon: TrendingDown, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Qualified", value: qualifiedLeads.toString(), icon: Users, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Pending", value: pendingLeads.toString(), icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
  ]

  const handleSortCust = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUp className="inline w-4 h-4 ml-1 text-gray-300" />
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-orange-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-orange-600" />
    )
  }

  const handleSortLead = (key) => {
    let direction = "asc"
    if (leadSortConfig.key === key && leadSortConfig.direction === "asc") {
      direction = "desc"
    }
    setLeadSortConfig({ key, direction })
  }

  const LeadSortIcon = ({ column }) => {
    if (leadSortConfig.key !== column) return <ArrowUpDown className="inline w-3 h-3 ml-1 text-gray-400" />
    return leadSortConfig.direction === "asc" ? (
      <ChevronUp className="inline w-3 h-3 ml-1 text-green-600" />
    ) : (
      <ChevronDown className="inline w-3 h-3 ml-1 text-green-600" />
    )
  }

  const handleStatusChange = async (lead, id, newStatus) => {
    try {
      Swal.fire({
        title: "Updating...",
        text: "Updating status.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      const res = await fetch(`${baseUrl}/accounts/api/leads/${id}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      
      setCustomers((prev) => prev.map((customer) => ({
        ...customer,
        leads: customer.leads ? customer.leads.map((l) => l.id === id ? { ...l, status: newStatus } : l) : []
      })))
      Swal.fire("Updated!", "Lead status updated.", "success")
    } catch (err) {
      Swal.fire("Error!", "Failed to update status.", "error")
    }
  }

  const handleDeleteLead = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    })
    if (!result.isConfirmed) return

    try {
      Swal.fire({ title: "Deleting...", allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!res.ok) throw new Error("Delete failed")
      
      setCustomers((prev) => prev.map((c) => ({
        ...c,
        leads: c.leads ? c.leads.filter((l) => l.id !== id) : [],
      })))
      Swal.fire("Deleted!", "Lead removed.", "success")
    } catch (err) {
      Swal.fire("Error!", "Failed to delete lead.", "error")
    }
  }

  const handleCreateQuotation = async (quotationId) => {
    try {
      const res = await fetch(`${baseUrl}/quotations/api/quotations/${quotationId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      setSelectedQuotation(data.data)
      setEditQuotationOpen(true)
    } catch (error) {
      Swal.fire("Error!", "Could not load quotation.", "error")
    }
  }

  const handleExportExcel = () => {
    const exportData = []
    filteredCompanies.forEach((company) => {
      company.allLeads.forEach((lead) => {
        exportData.push({
          Company: company.company_name,
          Contact: lead.contact_person,
          Status: lead.status,
          Source: lead.lead_source,
          Assignee: lead.assigned_to?.name || "Unassigned",
          Created: new Date(lead.created_at).toLocaleDateString()
        })
      })
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Leads")
    XLSX.writeFile(wb, "Company_Leads.xlsx")
  }

  const groupedByCompany = customers.reduce((acc, customer) => {
    const companyKey = customer.company_name || "No Company";
    if (!acc[companyKey]) {
      acc[companyKey] = { company_name: companyKey, contacts: [], allLeads: [] };
    }
    if (!acc[companyKey].contacts.includes(customer.name)) acc[companyKey].contacts.push(customer.name);
    if (customer.leads) {
      acc[companyKey].allLeads.push(...customer.leads.map(lead => ({ ...lead, contact_person: customer.name })));
    }
    return acc;
  }, {});

  const companyData = Object.values(groupedByCompany);

  const filteredCompanies = companyData.filter(company => 
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contacts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (!sortConfig.key) return 0
    let valA = a[sortConfig.key]
    let valB = b[sortConfig.key]

    if (sortConfig.key === "total_leads") {
      valA = a.allLeads.length;
      valB = b.allLeads.length;
    } else {
      valA = (valA ?? "").toString().toLowerCase();
      valB = (valB ?? "").toString().toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  });

  const sortedLeads = (leads) => {
    return [...leads].sort((a, b) => {
      if (!leadSortConfig.key) return 0
      let valA = a[leadSortConfig.key]
      let valB = b[leadSortConfig.key]

      if (leadSortConfig.key === "created_at") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (leadSortConfig.key === "assigned_to") {
        valA = (a.assigned_to?.name ?? "").toLowerCase();
        valB = (b.assigned_to?.name ?? "").toLowerCase();
      } else {
        valA = (valA ?? "").toString().toLowerCase();
        valB = (valB ?? "").toString().toLowerCase();
      }

      if (valA < valB) return leadSortConfig.direction === "asc" ? -1 : 1
      if (valA > valB) return leadSortConfig.direction === "asc" ? 1 : -1
      return 0
    })
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
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Company Leads</h1>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search company or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sno.</th>
                <th 
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortCust("company_name")}
                >
                  Company Name <SortIcon column="company_name" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Associated Contacts</th>
                <th 
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortCust("total_leads")}
                >
                  Total Leads <SortIcon column="total_leads" />
                </th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCompanies.map((company, index) => (
                <React.Fragment key={company.company_name}>
                  <tr className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => toggleExpand(company.company_name)}>
                    <td className="px-6 py-4 text-gray-600 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">{company.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {company.contacts.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-600 text-sm">{company.allLeads.length} Leads</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedCustomer === company.company_name ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>

                  {expandedCustomer === company.company_name && (
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSortLead("contact_person")}>
                                    Contact Person <LeadSortIcon column="contact_person" />
                                  </th>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSortLead("status")}>
                                    Status <LeadSortIcon column="status" />
                                  </th>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Source</th>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSortLead("assigned_to")}>
                                    Assigned To <LeadSortIcon column="assigned_to" />
                                  </th>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100" onClick={() => handleSortLead("created_at")}>
                                    Created <LeadSortIcon column="created_at" />
                                  </th>
                                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quotation</th>
                                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {sortedLeads(company.allLeads).map((lead) => (
                                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.contact_person}</td>
                                    <td className="px-6 py-4">
                                      <select
                                        value={lead.status}
                                        onChange={(e) => handleStatusChange(lead, lead.id, e.target.value)}
                                        className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                      > 
                                        <option value="PROSPECTIVE">Prospective</option>
                                        <option value="QUALIFIED">Qualified</option>
                                        <option value="CONVERTED">Converted</option>
                                        <option value="NEGOTIATION">Negotiation</option>
                                        <option value="LOST">Lost</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{lead.lead_source || "-"}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-900">{lead.assigned_to?.name || "Unassigned"}</span>
                                        <button 
                                          onClick={() => handleOpenAssignModal(lead)} 
                                          className="p-1 text-gray-400 hover:text-orange-600 rounded-full hover:bg-orange-100 transition-colors"
                                        >
                                          <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                      })}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                      {lead.file_url ? (
                                        <a href={lead.file_url} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Download</a>
                                      ) : (
                                        <button onClick={() => navigate(`/quotations/edit/${lead.quotation}`)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">Create</button>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <Link to={`/leads/view/${lead.id}`} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                                          <Eye className="w-4 h-4" />
                                        </Link>
                                        {permissions?.lead?.includes("delete") && (
                                          <button 
                                            onClick={() => handleDeleteLead(lead.id)} 
                                            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerViewModal customer={selectedCustomer} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />
      <LeadViewModal lead={selectedLead} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />
      <QuotationEditModal quotation={selectedQuotation} isOpen={editQuotationOpen} onClose={() => setEditQuotationOpen(false)} onSave={() => setEditQuotationOpen(false)} />
      <AssignLeadModal isOpen={isAssigneeModalOpen} onClose={() => setIsAssigneeModalOpen(false)} lead={leadToReassign} salespersons={salespersons} />
    </div>
  )
}