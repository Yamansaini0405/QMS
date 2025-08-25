"use client"

import { useState, useEffect } from "react"
import { FileText, Calendar, User, Eye, Edit, Trash2, Search, Download } from "lucide-react"
import TermViewModal from "../components/TermViewModal"
import TermEditModal from "../components/TermEditModal"

export default function ViewTermsAndCondition() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(null)

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        console.log("[v0] Fetching terms and conditions...")

        // Mock data for demonstration
        const mockTerms = [
          {
            id: 1,
            title: "Service Agreement Terms",
            content_html:
              "*Payment must be made within 30 days of invoice date* *All services are subject to availability* *Cancellation requires 48 hours notice* *Refunds are processed within 5-7 business days*",
            status: "Active",
            created_by: "Admin User",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Product Warranty Terms",
            content_html:
              "*Warranty covers manufacturing defects only* *Warranty period is 12 months from purchase date* *Customer must provide proof of purchase* *Warranty does not cover damage from misuse*",
            status: "Active",
            created_by: "Manager",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            title: "Privacy Policy Terms",
            content_html:
              "*We collect personal information for service delivery* *Data is stored securely and encrypted* *Information is not shared with third parties* *Users can request data deletion at any time*",
            status: "Draft",
            created_by: "Legal Team",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]

        console.log("[v0] Mock terms loaded:", mockTerms)
        setTerms(mockTerms)
      } catch (error) {
        console.error("❌ Error fetching terms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [])


  const filteredTerms = terms.filter(
    (term) =>
      term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewTerm = (term) => {
    console.log("[v0] Opening view modal for term:", term.title)
    setSelectedTerm(term)
    setViewModalOpen(true)
  }

  const handleEditTerm = (term) => {
    console.log("[v0] Opening edit modal for term:", term.title)
    setSelectedTerm(term)
    setEditModalOpen(true)
  }

  const handleDeleteTerm = async (termId) => {
    if (window.confirm("Are you sure you want to delete this term?")) {
      try {
        console.log("[v0] Deleting term:", termId)
        setTerms((prev) => prev.filter((term) => term.id !== termId))
      } catch (error) {
        console.error("❌ Error deleting term:", error)
        alert("Error deleting term. Please try again.")
      }
    }
  }

  const handleSaveTerm = (updatedTerm) => {
    console.log("[v0] Saving term:", updatedTerm.title)
    setTerms((prev) => prev.map((term) => (term.id === updatedTerm.id ? updatedTerm : term)))
    setEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms and conditions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Terms & Conditions</h1>
              <p className="text-gray-600">Manage your terms and conditions</p>
            </div>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          <span className="text-lg">+</span>
          <span>New Terms</span>
        </button>
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
                placeholder="Search terms and conditions..."
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
              <option>Active</option>
              <option>Draft</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left  font-semibold text-gray-900">S.No.</th>
                <th className="px-6 py-4 text-left  font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left  font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Created By</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Updated</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTerms.map((term, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{term.title}</p>
                        <p className="text-sm text-gray-500">
                          {term.content_html.split("*").filter(Boolean).length} points
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        term.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {term.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{term.created_by}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(term.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(term.updated_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTerm(term)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="View Terms"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditTerm(term)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit Terms"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete Terms"
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

      <TermViewModal term={selectedTerm} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <TermEditModal
        term={selectedTerm}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveTerm}
      />
    </div>
  )
}
