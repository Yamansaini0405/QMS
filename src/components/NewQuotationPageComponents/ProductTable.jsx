"use client"

import { Package, Plus } from "lucide-react"
import { useQuotation } from "../../contexts/QuotationContext"
import { useState, useEffect } from "react"

export default function ProductTable() {
  const {
    formData,
    productSearchStates,
    productSearchResults,
    isSearchingProducts,
    handleProductSearchChange,
    handleChangeProductDetail,
    selectProduct,
    addProductRow,
    removeProductRow,
    setProductSearchStates,
  } = useQuotation()

const [showPercentageDiscount, setShowPercentageDiscount] = useState(false);

useEffect(() => {
  if (formData.products?.some(p => p.percentage_discount && Number(p.percentage_discount) > 0)) {
    setShowPercentageDiscount(true);
  } else {
    setShowPercentageDiscount(false);
  }
}, [formData.products]);


  const calculateFinalAmount = (product) => {
    const baseAmount = (product.quantity || 0) * (product.selling_price || 0)
    let finalAmount = baseAmount

    if (showPercentageDiscount && product.percentage_discount) {
      finalAmount = finalAmount - finalAmount * (product.percentage_discount / 100)
    }

    return Math.max(0, finalAmount)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-scroll no-scrollbar">
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Add Products/Services</h2>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="percentage-discount"
            checked={showPercentageDiscount}
            onChange={(e) => setShowPercentageDiscount(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="percentage-discount" className="text-sm text-gray-600">
            Enable Percentage Discount Column
          </label>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">S.No.</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product/Service</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Quantity</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Rate</th>
            {showPercentageDiscount && (
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Discount %</th>
            )}
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {formData.products.map((product, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-3 px-2 text-sm text-gray-600">{index + 1}</td>
              <td className="py-3 px-2">
                <div className="relative">
                  <input
                    placeholder="Search and select product..."
                    value={productSearchStates[index]?.query || product.name}
                    onChange={(e) => handleProductSearchChange(e, index)}
                    onFocus={() => {
                      const currentQuery = productSearchStates[index]?.query || product.name
                      if (currentQuery.trim()) {
                        setProductSearchStates((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            showResults: true,
                          },
                        }))
                      }
                    }}
                    onBlur={() => setTimeout(() =>setProductSearchStates((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            showResults: false,
                          },
                        })), 150 )}
                    
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {productSearchStates[index]?.showResults && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isSearchingProducts[index] ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Searching products...</div>
                      ) : productSearchResults[index]?.length > 0 ? (
                        productSearchResults[index].map((searchProduct) => (
                          <div
                            key={searchProduct.id}
                            onMouseDown={() => selectProduct(searchProduct, index)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{searchProduct.name}</div>
                            <div className="text-sm text-gray-600">{searchProduct.description}</div>
                          </div>
                        ))
                      ) : (productSearchStates[index]?.query || product.name).trim() ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                      ) : null}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-2">
                <input
                  type="number"
                  value={product.quantity}
                  name="quantity"
                  onChange={(e) => handleChangeProductDetail(e, index)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </td>
              <td className="py-3 px-2">
                <input
                  type="text"
                  value={product.selling_price}
                  placeholder="0"
                  name="selling_price"
                  onChange={(e) => handleChangeProductDetail(e, index)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </td>
              {showPercentageDiscount && (
                <td className="py-3 px-2">
                  <input
                    type="number"
                    value={product.percentage_discount || ""}
                    name="percentage_discount"
                    onChange={(e) => handleChangeProductDetail(e, index)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </td>
              )}
              <td className="py-3 px-2 text-sm font-medium">Rs. {calculateFinalAmount(product).toFixed(2)}</td>
              <td className="py-3 px-2">
                {formData.products.length > 1 && (
                  <button
                    onClick={() => removeProductRow(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">Rs. {formData.subtotal}</span>
        </div>
        <button
          onClick={addProductRow}
          className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Row</span>
        </button>
      </div>
    </div>
  )
}
