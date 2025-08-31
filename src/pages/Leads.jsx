
import { useState, useEffect } from "react"
import {
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  Search,
  Download,
  Eye,
  Trash,
} from "lucide-react"
import LeadViewModal from "../components/LeadViewModal"
import QuotationEditModal from "@/components/QuotationEditModel"


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




  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log("[v0] Fetching leads from backend...")
        const token = localStorage.getItem("token") // 🔑 get token

        const res = await fetch(
          "https://qms-2h5c.onrender.com/quotations/api/leads/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch leads")
        }

        const data = await res.json()
        console.log("[v0] Leads loaded:", data)

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

  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === "PENDING").length
  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length
  const convertedLeads = leads.filter((l) => l.status === "CONVERTED").length
  const pipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0)

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
      title: "Converted",
      value: convertedLeads.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    // {
    //   title: "Pipeline Value",
    //   value: `Rs. ${pipelineValue.toLocaleString()}`,
    //   icon: DollarSign,
    //   color: "text-blue-600",
    //   bgColor: "bg-blue-50",
    // },
  ]

 const filteredLeads = leads.filter((lead) => {
  const matchesSearch =
    lead.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

  const matchesStatus =
    statusFilter === "All Status" || lead.status === statusFilter.toUpperCase()

  const matchesSource =
    sourceFilter === "All Sources" || lead.source?.toLowerCase() === sourceFilter.toLowerCase()

  const matchesAssignee =
    assigneeFilter === "All Assignees" ||
    lead.assigned_to?.name?.toLowerCase() === assigneeFilter.toLowerCase()

  return matchesSearch && matchesStatus && matchesSource && matchesAssignee
})


  const handleViewLead = (lead) => {
    console.log("[v0] Opening view modal for lead:", lead.customer_name)
    setSelectedLead(lead)
    setViewModalOpen(true)
  }

  const handleEditLead = (lead) => {
    console.log("[v0] Opening edit modal for lead:", lead.customer_name)
    setSelectedLead(lead)
    setEditModalOpen(true)
  }

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      // 🔹 call backend API
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete lead from server");
      }

      // 🔹 update UI
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      console.log("[v0] Lead deleted from backend:", id);
    } catch (err) {
      console.error(err);
      alert("Error deleting lead. Please try again.");
    }
  };



  const handleCreateQuotation = async (quotationId) => {
    try {
      const token = localStorage.getItem("token")

      console.log("[v0] Fetching quotation for lead:", quotationId)

      const res = await fetch(
        `https://qms-2h5c.onrender.com/quotations/api/quotations/${quotationId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Failed to fetch quotation for this lead")
      }

      const data = await res.json()
      console.log("[v0] Quotation loaded:", data.data)

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
      customer_name: lead.customer.name,
      customer_email: lead.customer.email,
      customer_phone: lead.customer.phone,
      status: newStatus,
      priority: lead.priority

    }
    console.log("sending payload:", payload)
    try {
      const res = await fetch(`https://qms-2h5c.onrender.com/quotations/api/leads/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update status on server");
      }

      // ✅ Update UI
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );

      console.log("[v0] Status updated in backend:", id, newStatus);
    } catch (err) {
      console.error(err);
      alert("Error updating status. Please try again.");
    }
  };



  const handleSaveLead = async (updatedLead) => {
    try {
      console.log("[v0] Saving lead:", updatedLead.customer_name)

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
              <h1 className="text-2xl font-semibold text-gray-900">All Leads</h1>
              <p className="text-gray-600">Manage and track sales leads</p>
            </div>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          <span className="text-lg">+</span>
          <span>New Lead</span>
        </button>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option>All Status</option>
              <option value="PENDING">New</option>
              <option>Qualified</option>
              <option>Proposal</option>
              <option>Converted</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option>All Sources</option>
              <option>website</option>
              <option>referral</option>
              <option>quotation</option>
              <option>social media</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option>All Assignees</option>
              <option>u1</option>
              <option>u2</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export All ({filteredLeads.length})</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredLeads.length} of {totalLeads} leads
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SNo.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lead</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quotation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{index + 1}</p>

                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{lead.customer.name}</p>
                        <p className="text-sm text-gray-500">{ }</p>
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className=" text-gray-800 ">{lead.customer.company_name}</p>
                      <p className="text-sm text-gray-500">{lead.contact_person}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, lead.id, e.target.value)}
                      className="text-sm  text-white px-3 py-1 bg-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="NEW">New</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="CONVERTED">Converted</option>
                    </select>
                  </td>


                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{lead.source}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{lead.assigned_to.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {  lead.file_url !== null ? (
                      <a
                        href={lead.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition"
                      >
                        Download
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCreateQuotation(lead.quotation)}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                      >
                        Create
                      </button>
                    )}
                  </td>


                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                        title="View Lead"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete Lead"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LeadViewModal lead={selectedLead} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />
      <QuotationEditModal
        quotation={selectedQuotation}
        isOpen={editQuotationOpen}
        onClose={() => setEditQuotationOpen(false)}
        onSave={(updatedQuotation) => {
          console.log("✅ Quotation saved:", updatedQuotation)
          setEditQuotationOpen(false)
          
        }}
      />
    </div>
  )
}
