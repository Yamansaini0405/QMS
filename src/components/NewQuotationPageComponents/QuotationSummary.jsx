"use client"

import { FileText } from "lucide-react"
import { useQuotation } from "../../contexts/QuotationContext"
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
            <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quotation Summary</h2>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="text-sm font-medium">{formData.products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">Rs. {formData.subtotal}</span>
                </div>


                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="special-discount"
                                checked={!!formData.discount}
                                onChange={(e) => {
                                    const checked = e.target.checked;

                                    updateFormData("specialDiscountEnabled", checked);

                                    if (!checked) {
                                        // User turned OFF special discount → clear discount value
                                        updateFormData("discount", "");
                                    } else {
                                        // User turned it back ON → set default discount if empty
                                        if (!formData.discount) {
                                            updateFormData("discount", "0");
                                        }
                                    }

                                    calculateTotals(formData.products);
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />

                            <label htmlFor="special-discount" className="text-sm text-gray-600">
                                Special Discount
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                className="w-16 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                type="number"
                                value={formData.discount}
                                onChange={(e) => {
                                    updateFormData("discount", e.target.value)
                                    calculateTotals(formData.products)
                                }}
                            />
                            <span className="text-sm font-medium">
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
                    <div>
                        <p className="text-gray-700 text-sm">Additional Charges:</p>
                        <div className="flex items-center justify-between space-x-2 mt-1">
                            <input type="text" value={formData.additional_charge_name} onChange={(e) => updateFormData("additional_charge_name", e.target.value)} className="border border-gray-300 rounded-md p-1" />
                            <input type="number" value={formData.additional_charge_amount} onChange={(e) => updateFormData("additional_charge_amount", e.target.value)} className="border border-gray-300 rounded-md p-1 w-20" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between space-x-2 mt-1">
                        <p className="text-gray-900 font-semibold text-sm">Grand Total</p>
                        <span className="text-md font-bold text-gray-900">
                            Rs. {(() => {
                                const subtotal = parseFloat(formData.subtotal) || 0;
                                const discountVal = parseFloat(formData.discount) || 0;
                                const additional = parseFloat(formData.additional_charge_amount) || 0;
                                const discountAmount = formData.discountType === "percentage"
                                    ? (subtotal * discountVal) / 100
                                    : discountVal;
                                return (subtotal - discountAmount + additional).toFixed(2);
                            })()}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className="text-sm text-gray-600">Tax Rate:</span>
                        <input
                            className="w-12 h-7 px-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            value={formData.taxRate}
                            onChange={(e) => {
                                updateFormData("taxRate", e.target.value)
                                calculateTotals(formData.products)
                            }}
                        />
                        <span className="text-xs text-gray-500">%</span>
                    </div>
                    <span className="text-sm font-medium">Rs. {formData.tax}</span>
                </div>



                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-lg font-bold text-blue-600">Rs. {formData.totalAmount}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
