"use client"

import { FileText } from "lucide-react"
import { useQuotation } from "@/contexts/QuotationContext"
import { useEffect } from "react"

export default function QuotationSummary() {
  const { formData, updateFormData, calculateTotals } = useQuotation()

  const handleDiscountTypeChange = (type) => {
    updateFormData("discountType", type)
    // Reset discount value when changing type
    updateFormData("discount", "")
    calculateTotals(formData.products)
  }

  useEffect(() => {
    calculateTotals(formData.products)
  }, [formData.discount, formData.discountType, formData.taxRate, formData.specialDiscountEnabled])

  useEffect(() => {
    if (formData.discount) {
      calculateTotals(formData.products)
    }
  }, [formData.discount])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-8">
        <FileText className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Quotation Summary</h2>
      </div>

      <div className="space-y-6">
        {/* GROUP 1: Items and Subtotal */}
        <div className="space-y-0 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <span className="text-md text-gray-600">Items:</span>
            <span className="text-md font-medium text-gray-900">{formData.products.length}</span>
          </div>
          <div className="bg-white px-4 py-3 flex justify-between items-center">
            <span className="text-md text-gray-600">Subtotal:</span>
            <span className="text-md font-medium text-gray-900">Rs. {formData.subtotal}</span>
          </div>
        </div>

        {/* GROUP 2: Special Discount and Discount Type */}
        <div className="bg-blue-50 px-4 py-4 rounded-lg border border-blue-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="special-discount"
                checked={!!formData.discount}
                onChange={(e) => {
                  const checked = e.target.checked
                  updateFormData("specialDiscountEnabled", checked)
                  if (!checked) {
                    updateFormData("discount", "")
                  } else {
                    if (!formData.discount) {
                      updateFormData("discount", "0")
                    }
                  }
                  calculateTotals(formData.products)
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="special-discount" className="text-md text-gray-600">
                Special Discount
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                className="w-28 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                type="number"
                value={formData.discount}
                onChange={(e) => {
                  updateFormData("discount", e.target.value)
                  calculateTotals(formData.products)
                }}
              />
              <span className="text-sm font-medium text-gray-900">
                {formData.discountType === "percentage" ? "%" : "Rs."} {formData.discount || "0.00"}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Discount Type:</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.discountType === "percentage"}
                  onChange={() => handleDiscountTypeChange("percentage")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Percentage</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={formData.discountType === "amount"}
                  onChange={() => handleDiscountTypeChange("amount")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Amount</span>
              </label>
            </div>
          </div>
        </div>

        {/* GROUP 3: Additional Charges */}
        <div className="bg-teal-50 px-4 py-4 rounded-lg border border-teal-200">
          <p className="text-gray-700 text-md font-medium mb-3">Additional Charges:</p>
          <div className="flex items-center justify-between space-x-2">
            <input
              type="text"
              value={formData.additional_charge_name}
              onChange={(e) => updateFormData("additional_charge_name", e.target.value)}
              placeholder="Charge name"
              className="flex-1 border max-w-80 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              value={formData.additional_charge_amount}
              onChange={(e) => updateFormData("additional_charge_amount", e.target.value)}
              placeholder="Amount"
              className="border border-gray-300 rounded-md p-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* GROUP 4: Grand Total */}
        <div className="bg-green-50 px-4 py-4 rounded-lg border border-green-200 flex items-center justify-between">
          <p className="text-gray-900 font-semibold text-md">Grand Total</p>
          <span className="text-md font-bold text-green-700">
            Rs. {(() => {
              const subtotal = Number.parseFloat(formData.subtotal) || 0
              const discountVal = Number.parseFloat(formData.discount) || 0
              const additional = Number.parseFloat(formData.additional_charge_amount) || 0
              const discountAmount =
                formData.discountType === "percentage" ? (subtotal * discountVal) / 100 : discountVal
              return (subtotal - discountAmount + additional).toFixed(2)
            })()}
          </span>
        </div>

        {/* GROUP 5: Tax Rate */}
        <div className="bg-red-50 px-4 py-4 rounded-lg border border-red-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-md text-gray-600">Tax Rate:</span>
            <input
              className="w-12 h-7 px-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              type="text"
              value={formData.taxRate}
              onChange={(e) => {
                updateFormData("taxRate", e.target.value)
                calculateTotals(formData.products)
              }}
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
          <span className="text-md font-medium text-gray-900">Rs. {formData.tax}</span>
        </div>

        {/* GROUP 6: Total Amount */}
        <div className="bg-green-600 px-4 py-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-white">Total Amount:</span>
            <span className="text-lg font-bold text-white">Rs. {formData.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
