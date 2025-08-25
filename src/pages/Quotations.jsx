import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { Link } from "react-router-dom"
import QuotationEditModel from "../components/QuotationEditModel"

const Quotations = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/quotations/", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()
        setQuotations(data.data || [])
      } catch (error) {
        setQuotations([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuotations()
  }, [])

  // Calculate stats dynamically
  const totalValue = quotations.reduce((sum, q) => sum + (parseFloat(q.amount?.replace(/[^\d.]/g, "")) || 0), 0)
  const pendingCount = quotations.filter(q => q.status === "Pending").length
  const acceptedCount = quotations.filter(q => q.status === "Accepted").length

  const stats = [
    {
      title: "Total Quotations",
      value: quotations.length,
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
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const handleViewQuotation = (quotation) => {
    if (quotation.url) {
      window.open(quotation.url, "_blank") // open PDF in new tab
    } else {
      alert("PDF not available for this quotation.")
    }
  }

  const handleDeleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return
    try {
      const token = localStorage.getItem("token")
      await fetch(
        `https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/quotations/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      // remove deleted quotation from state
      setQuotations((prev) => prev.filter((q) => q.id !== id))
    } catch (error) {
      console.error("Failed to delete quotation:", error)
    }
  }

  // Filter quotations by search and status
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      q.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // q.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "All Status" || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

   const handleEditQuotation = (quotation) => {
    setSelectedQuotation(quotation)
    setIsEditModalOpen(true)
  }

  const handleSaveQuotation = (updatedQuotation) => {
    setQuotations((prev) => prev.map((q) => (q.id === updatedQuotation.id ? updatedQuotation : q)))
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

              <h1 className="text-2xl font-semibold text-gray-900">All Quotations</h1>
              <p className="text-gray-600">Manage and track all quotations</p>

            </div>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
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
                placeholder="Search quotations..."
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
              <option>Pending</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export All (3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm">

                  Sno.
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quote ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valid Until</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.map((quotation, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">

                    {index + 1}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8  bg-green-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{quotation.customer?.name || ""}</p>
                      <p className="text-sm text-gray-500">{quotation.customer?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{quotation.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">₹{quotation.subtotal}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${quotation.statusColor}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{quotation.created_at.split("T")[0]}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${quotation.validColor}`}>{quotation.follow_up_date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewQuotation(quotation)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditQuotation(quotation)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200">
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

      <QuotationEditModel
        quotation={selectedQuotation}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveQuotation}
      />
    </div>
  )
}

export default Quotations
