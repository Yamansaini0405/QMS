"use client"

import { Settings, Calendar } from "lucide-react"
import { useQuotation } from "../../contexts/QuotationContext"

export default function AdditionalSettings() {
  const { formData, updateFormData } = useQuotation()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Additional Settings</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
          <div className="relative">
            <input
              value={formData.quotationDate}
              onChange={(e) => updateFormData("quotationDate", e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
          <div className="relative">
            <input
              value={formData.validUntil}
              onChange={(e) => updateFormData("validUntil", e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            defaultValue="pending"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.status}
            onChange={(e) => updateFormData("status", e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Validity Period Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number</label>
            <input
              type="number"
              min="1"
              value={formData.validityNumber}
              onChange={(e) => updateFormData("validityNumber", Number.parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.validityType === "days"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData("validityType", "days")
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Days
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.validityType === "months"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData("validityType", "months")
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Months
              </label>
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <span>Calculated Follow-up Date: </span>
          <span className="font-medium">{formData.followUpDate}</span>
        </div>
      </div>

      <div className="mt-4">
        {/* <div className="text-sm text-gray-600 mb-2">
          <span>Valid Until: </span>
          <span className="font-medium">{formData.validUntil}</span>
        </div> */}
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
        <textarea
          placeholder="Add any special notes for this quotation..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
          value={formData.additionalNotes}
          onChange={(e) => updateFormData("additionalNotes", e.target.value)}
        />
      </div>
    </div>
  )
}
