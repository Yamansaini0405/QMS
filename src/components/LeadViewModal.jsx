"use client"

import { X, Target, User, FileText, DollarSign } from "lucide-react"

export default function LeadViewModal({ customer, lead, isOpen, onClose }) {
  if (!isOpen || !lead) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
      onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
              <p className="text-gray-600">View lead information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <p className="text-gray-900">{customer.name}</p>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <p className="text-gray-900">{lead.contact_person}</p>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{customer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{customer.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <p className="text-gray-900">{customer.company_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900">{customer.primary_address}</p>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.status === "New"
                      ? "bg-blue-100 text-blue-800"
                      : lead.status === "Qualified"
                        ? "bg-purple-100 text-purple-800"
                        : lead.status === "Proposal"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {lead.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <p className="text-gray-900">{lead.lead_source}</p>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <p className="text-gray-900">{lead.priority}</p>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <p className="text-gray-900">{lead.assigned_to.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <p className="text-gray-900">{lead.follow_up_date}</p>
              </div>
              
            </div>
          </div>



          {/* Notes & Comments */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notes & Comments</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{lead.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <p className="text-gray-900">{lead.additional_notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
