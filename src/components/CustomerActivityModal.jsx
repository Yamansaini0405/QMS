"use client"
import { X, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Send, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function CustomerActivityModal({ customer, isOpen, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && customer?.id) {
      fetchCustomerActivity(customer.id)
    }
  }, [isOpen, customer?.id])

  const fetchCustomerActivity = async (customerId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://69.62.80.202/quotations/api/customers/${customerId}/`,{
        headers: {
            Authorization : `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (!response.ok) {
        throw new Error("Failed to fetch customer activity")
      }
      const data = await response.json()
      console.log(data)
      setLogs(data.data.logs || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching customer activity:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  const getActionIcon = (action) => {
    switch (action) {
      case "QUOTATION_CREATED":
        return <FileText className="w-4 h-4 text-blue-600" />
      case "QUOTATION_SENT":
        return <Send className="w-4 h-4 text-green-600" />
      case "QUOTATION_UPDATED":
        return <AlertCircle className="w-4 h-4 text-amber-600" />
      case "QUOTATION_ACCEPTED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "QUOTATION_REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "QUOTATION_CREATED":
        return "bg-blue-50 border-blue-200"
      case "QUOTATION_SENT":
        return "bg-green-50 border-green-200"
      case "QUOTATION_UPDATED":
        return "bg-amber-50 border-amber-200"
      case "QUOTATION_ACCEPTED":
        return "bg-green-50 border-green-200"
      case "QUOTATION_REJECTED":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 overflow-scroll no-scrollbar">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customer Activity</h2>
              <p className="text-gray-600">
                {customer.name} - {customer.company_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Activity...</h3>
              <p className="text-gray-600">Fetching customer activity logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activity</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchCustomerActivity(customer.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">No activity logs found for this customer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
                <span className="text-sm text-gray-500">{logs.length} activities</span>
              </div>

              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`border rounded-lg p-2 py-3 ${getActionColor(log.action)} transition-all duration-200 hover:shadow-sm`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {log.action
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h4>
                          <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{log.message}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {log.actor.name} ({log.actor.email})
                            </span>
                          </div>

                          {log.entity_type && log.entity_id && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                {log.entity_type} ID: {log.entity_id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  )
}
