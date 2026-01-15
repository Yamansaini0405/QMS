"use client"

import { useState } from "react"
import { Download, AlertCircle, Loader } from "lucide-react"
import Swal from "sweetalert2"

const ENTITY_CONFIG = {
  quotation: {
    label: "Quotations",
    icon: "📋",
    fields: [
      "quotation_number",
      "status",
      "follow_up_date",
      "discount_type",
      "subtotal",
      "tax_rate",
      "total",
      "additional_charge_name",
      "additional_charge_amount",
      "discount",
      "emailed_at",
      "lead_id",
      "file_url",
      "additionalNotes",
      "created_at",
      "updated_at",
    ],
    requiresDateRange: true,
  },
  lead: {
    label: "Leads",
    icon: "👥",
    fields: [
      "lead_number",
      "status",
      "lead_source",
      "priority",
      "follow_up_date",
      "notes",
      "quotation_id",
      "created_at",
      "updated_at",
    ],
    requiresDateRange: true,
  },
  product: {
    label: "Products",
    icon: "📦",
    fields: [
      "name",
      "description",
      "cost_price",
      "selling_price",
      "unit",
      "weight",
      "dimensions",
      "warranty_months",
      "brand",
      "is_available",
      "discount",
      "created_at",
    ],
    requiresDateRange: false,
  },
}

const ExportData = () => {
  const [selectedEntity, setSelectedEntity] = useState("quotation")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedFields, setSelectedFields] = useState(ENTITY_CONFIG.quotation.fields.slice(0, 5))
  const [exportData, setExportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const currentConfig = ENTITY_CONFIG[selectedEntity]

  const handleEntityChange = (entity) => {
    setSelectedEntity(entity)
    setSelectedFields(ENTITY_CONFIG[entity].fields.slice(0, 5))
    setExportData(null)
    setPreviewOpen(false)
  }

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleSelectAllFields = () => {
    if (selectedFields.length === currentConfig.fields.length) {
      setSelectedFields([])
    } else {
      setSelectedFields([...currentConfig.fields])
    }
  }

  const validateForm = () => {
    if (selectedFields.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Fields Selected",
        text: "Please select at least one field to export",
      })
      return false
    }

    if (currentConfig.requiresDateRange) {
      if (!fromDate || !toDate) {
        Swal.fire({
          icon: "warning",
          title: "Date Range Required",
          text: "Please select both from and to dates",
        })
        return false
      }

      const from = new Date(fromDate)
      const to = new Date(toDate)
      if (from > to) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Date Range",
          text: "From date must be before to date",
        })
        return false
      }
    }

    return true
  }

  const fetchExportData = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        entity: selectedEntity,
        fields: selectedFields,
      }

      if (currentConfig.requiresDateRange) {
        payload.from_date = fromDate
        payload.to_date = toDate
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "https://devapi.nkprosales.com"}/quotations/api/export/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch export data")
      }

      const data = await response.json()
      setExportData(data)
      setPreviewOpen(true)
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!exportData || !exportData.results || exportData.results.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data available to export",
      })
      return
    }

    const headers = selectedFields
    const rows = exportData.results.map((record) =>
      headers.map((field) => {
        const value = record[field]
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value || ""
      }),
    )

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedEntity}_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.click()

    Swal.fire({
      icon: "success",
      title: "Download Complete",
      text: `${exportData.count} records exported successfully`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white p-6 rounded-2xl">
          <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
          <p className="text-gray-600 mt-2">Select entity, fields, and date range to export data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleEntityChange(key)}
              className={`p-4 flex space-x-2 items-center justify-start rounded-lg border-2 transition-all text-left ${
                selectedEntity === key
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-orange-300"
              }`}
            >
              <div className="text-2xl mb-2">{config.icon}</div>
              <div className="font-semibold text-gray-900">{config.label}</div>
              <div className="text-sm text-gray-600">{config.fields.length} fields available</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {currentConfig.requiresDateRange && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  {selectedFields.length} of {currentConfig.fields.length} fields selected
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Field Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select Fields to Export</h2>
                <button
                  onClick={handleSelectAllFields}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {selectedFields.length === currentConfig.fields.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {currentConfig.fields.map((field) => (
                  <label
                    key={field}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleFieldToggle(field)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">
                      {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>

              {/* Export Button */}
              <button
                onClick={fetchExportData}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Preparing Data...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Preview & Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && exportData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Export Preview</h3>
                <p className="text-sm text-gray-600 mt-1">{exportData.count} records found</p>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6">
              {exportData.results && exportData.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {selectedFields.map((field) => (
                          <th key={field} className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                            {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {exportData.results.map((record, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          {selectedFields.map((field) => (
                            <td key={`${idx}-${field}`} className="py-3 px-4 text-gray-700">
                              {record[field] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No records found for the selected criteria</p>
                </div>
              )}

              <div className="mt-6 flex gap-4 justify-end">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportData
