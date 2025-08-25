"use client"

import { X, Package, DollarSign, Calendar, Tag, Weight, Ruler, Shield } from "lucide-react"

export default function ProductViewModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
              <p className="text-gray-600">View product information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                <p className="text-gray-900 font-medium">{product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.category === "services"
                      ? "bg-blue-100 text-blue-800"
                      : product.category === "support"
                        ? "bg-purple-100 text-purple-800"
                        : product.category === "hardware"
                          ? "bg-blue-100 text-blue-800"
                          : product.category === "consulting"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.category}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <p className="text-gray-900">{product.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Brand</label>
                <p className="text-gray-900">{product.brand || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing & Tax
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Cost Price</label>
                <p className="text-gray-900 font-medium">Rs. {product.cost_price}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Selling Price</label>
                <p className="text-green-600 font-medium">Rs. {product.selling_price}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
                <p className="text-gray-900">{product.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tax Rate</label>
                <p className="text-gray-900">{product.tax_rate || 0}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Profit Margin</label>
                <p className="text-green-600 font-medium">
                  {product.cost_price
                    ? (((product.selling_price - product.cost_price) / product.cost_price) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weight</label>
                <p className="text-gray-900 flex items-center">
                  <Weight className="w-4 h-4 mr-1" />
                  {product.weight || 0} kg
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Dimensions</label>
                <p className="text-gray-900 flex items-center">
                  <Ruler className="w-4 h-4 mr-1" />
                  {product.dimensions || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Warranty</label>
                <p className="text-gray-900 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {product.warranty_months ? `${product.warranty_months} months` : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {product.created_at ? product.created_at.split("T")[0] : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
