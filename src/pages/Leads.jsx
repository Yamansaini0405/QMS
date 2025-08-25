
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
  Edit,
  MoreHorizontal,
} from "lucide-react"
import LeadViewModal from "../components/LeadViewModal"
import LeadEditModal from "../components/LeadEditModal"

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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log("[v0] Fetching leads...")

        // Mock data for demonstration
        const mockLeads = [
          {
            id: 1,
            customer_name: "Sarah Johnson",
            contact_person: "Sarah Johnson",
            email: "sarah@techsolutions.com",
            phone: "9876543211",
            company_name: "Tech Solutions Ltd",
            address: "123 Tech Street, Mumbai",
            lead_status: "New",
            lead_source: "referral",
            priority: "Medium",
            assigned_to: "u2",
            lead_score: 25000,
            estimated_value: 25000,
            follow_up_date: "2024-02-01",
            description: "Interested in web development services for their new product launch.",
            additional_notes: "Follow up next week for detailed requirements.",
            created_at: "2024-01-20T10:30:00Z",
          },
          {
            id: 2,
            customer_name: "John Smith",
            contact_person: "John Smith",
            email: "john.smith@acme.com",
            phone: "9876543210",
            company_name: "Acme Corporation",
            address: "456 Business Ave, Delhi",
            lead_status: "Qualified",
            lead_source: "website",
            priority: "High",
            assigned_to: "u1",
            lead_score: 50000,
            estimated_value: 50000,
            follow_up_date: "2024-01-25",
            description: "Looking for complete digital transformation solution.",
            additional_notes: "Very interested, ready to move forward quickly.",
            created_at: "2024-01-15T14:15:00Z",
          },
          {
            id: 3,
            customer_name: "Mike Wilson",
            contact_person: "Mike Wilson",
            email: "mike@startupco.com",
            phone: "9876543212",
            company_name: "StartupCo",
            address: "789 Innovation Hub, Bangalore",
            lead_status: "Proposal",
            lead_source: "quotation",
            priority: "High",
            assigned_to: "u1",
            lead_score: 75000,
            estimated_value: 75000,
            follow_up_date: "2024-01-30",
            description: "Startup looking for MVP development and ongoing support.",
            additional_notes: "Proposal sent, waiting for feedback.",
            created_at: "2024-01-10T09:45:00Z",
          },
        ]

        console.log("[v0] Mock leads loaded:", mockLeads)
        setLeads(mockLeads)
      } catch (error) {
        console.error("❌ Error fetching leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.lead_status === "New").length
  const qualifiedLeads = leads.filter((l) => l.lead_status === "Qualified").length
  const convertedLeads = leads.filter((l) => l.lead_status === "Converted").length
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
    {
      title: "Pipeline Value",
      value: `Rs. ${pipelineValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All Status" || lead.lead_status === statusFilter) &&
      (sourceFilter === "All Sources" || lead.lead_source === sourceFilter) &&
      (assigneeFilter === "All Assignees" || lead.assigned_to === assigneeFilter),
  )

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <option>New</option>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{index+1}</p>
                      
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{lead.customer_name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{lead.company_name}</p>
                      <p className="text-sm text-gray-500">{lead.contact_person}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.lead_status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : lead.lead_status === "Qualified"
                            ? "bg-purple-100 text-purple-800"
                            : lead.lead_status === "Proposal"
                              ? "bg-yellow-100 text-yellow-800"
                              : lead.lead_status === "Converted"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lead.lead_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{lead.lead_source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      Rs. {lead.estimated_value?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{lead.assigned_to}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(lead.created_at).toLocaleDateString()}</span>
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
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit Lead"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
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

      <LeadEditModal
        lead={selectedLead}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveLead}
      />
    </div>
  )
}
