"use client"

import { useState, useEffect } from "react"
import { Search, Download, CheckCircle, TrendingUp, Clock, AlertCircle } from "lucide-react"

export default function ConvertedLeadsPage() {
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const baseUrl = import.meta.env.VITE_BASE_URL || ""

  // Fetch converted leads from API
  useEffect(() => {
    const fetchConvertedLeads = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${baseUrl}/quotations/api/leads/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch converted leads")
        }

        const data = await response.json()
        setLeads(data.data || data)
        setFilteredLeads(data.data || data)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching leads:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchConvertedLeads()
  }, [])

  // Handle search
  useEffect(() => {
    const filtered = leads.filter((lead) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        lead.customer.name.toLowerCase().includes(searchLower) ||
        lead.customer.email.toLowerCase().includes(searchLower) ||
        lead.customer.company_name.toLowerCase().includes(searchLower) ||
        lead.customer.phone.includes(searchTerm)
      )
    })
    setFilteredLeads(filtered)
  }, [searchTerm, leads])

  // Calculate stats
  const totalConverted = leads.length
  const avgConversionTime =
    leads.length > 0
      ? Math.round(
        leads.reduce((acc, lead) => {
          const created = new Date(lead.created_at)
          const updated = new Date(lead.updated_at)
          return acc + (updated - created) / (1000 * 60 * 60 * 24)
        }, 0) / leads.length,
      )
      : 0

  const withQuotations = leads.filter((lead) => lead.quotation).length

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
    return colors[hash % colors.length]
  }

  // Handle CSV Export
  const handleExport = () => {
    if (leads.length === 0) {
      console.log("No data to export");
      return;
    }

    // Helper to escape values for CSV
    const escapeCSVValue = (value) => {
      const stringValue = String(value == null ? '' : value); // Handle null/undefined
      if (/[",\n]/.test(stringValue)) {
        // If it contains quotes, newlines, or commas, wrap in double quotes
        // and double up any existing double quotes
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Define Headers
    const headers = ["Sno.", "Customer", "Company", "Email", "Phone", "Assigned To", "Converted Date"];
    let csvContent = headers.join(",") + "\n";

    // Add Data Rows
    leads.forEach((lead, index) => {
      const row = [
        index + 1,
        lead.customer?.name || "-",
        lead.customer?.company_name || "-",
        lead.customer?.email || "-",
        lead.customer?.phone || "-",
        lead.assigned_to?.name || "-",
        formatDate(lead.updated_at)
      ];

      csvContent += row.map(escapeCSVValue).join(",") + "\n";
    });

    // Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "converted_leads.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Converted Leads</h1>
            </div>
            <p className="text-gray-600">Track and manage successfully converted leads</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Converted */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Converted</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{totalConverted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* With Quotations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">With Quotations</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{withQuotations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Avg Conversion Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Conversion Time</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{avgConversionTime}d</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, company, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleExport}>
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Export All {totalConverted}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Loading converted leads...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-red-200 p-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? "No leads found matching your search." : "No converted leads yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Converted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => (
                    <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(lead.customer.name)}`}
                          >
                            {getInitials(lead.customer.name)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{lead.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.customer.company_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.assigned_to?.name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(lead.updated_at)}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
