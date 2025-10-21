"use client"
import { X, History, User, Calendar, MessageSquare } from "lucide-react"

const ViewLogsModal = ({ quotationLogs, isOpen, onClose }) => {
  if (!isOpen || !quotationLogs) return null

  const { logs, quotationNumber } = quotationLogs

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getActionColor = (action) => {
    switch (action) {
      case "QUOTATION_CREATED ":
        return "bg-green-100 text-green-800"
      case "LEAD_ASSIGNED":
        return "bg-purple-100 text-purple-800"
      case "QUOTATION_UPDATED":
        return "bg-blue-100 text-blue-800"
      case "LEAD_UPDATED":
        return "bg-indigo-100 text-indigo-800"
      case "STATUS_CHANGED":
        return "bg-yellow-100 text-yellow-800"
      case "QUOTATION_SENT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Logs</h2>
              <p className="text-sm text-gray-600">Quotation #{quotationNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace("_", " ")}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{log.actor?.name || "Unknown User"}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(log.created_at)}</span>
                    </div>
                  </div>

                  {log.message && (
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">{log.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Logs</h3>
              <p className="text-gray-600">No activity logs found for this quotation.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewLogsModal
