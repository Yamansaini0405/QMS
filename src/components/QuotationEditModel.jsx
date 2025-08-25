"use client"
import { useState, useEffect } from "react"
import { X, Save, User, Package, FileText, Settings, PenTool, Plus, Search, Calendar } from "lucide-react"

export default function QuotationEditModal({ quotation, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    products: [{ id: "", name: "", quantity: 1, selling_price: 0, tax_rate: 0 }],
    subtotal: "0.00",
    discount: 0,
    tax: "0.00",
    totalAmount: "0.00",
    quotationDate: "",
    validUntil: "",
    status: "PENDING",
    additionalNotes: "",
    createdBy: "Admin User",
    digitalSignature: "",
    id: "",
  })

  const [selectedTerms, setSelectedTerms] = useState([])
  const [showTermsDropdown, setShowTermsDropdown] = useState(false)
  const [termsSearchQuery, setTermsSearchQuery] = useState("")

  const [availableTerms, setAvailableTerms] = useState([])

  const [allProducts, setAllProducts] = useState([])
const [productSearchStates, setProductSearchStates] = useState({})
  const [productSearchResults, setProductSearchResults] = useState({})
  const [isSearchingProducts, setIsSearchingProducts] = useState({})


  const fetchTerms = async () => {
  try {
    const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/terms/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    const data = await response.json()
    if (data) {
      setAvailableTerms(data) // assumes API returns an array
    }
  } catch (error) {
    console.error("Error fetching terms:", error)
  }
}

const fetchProducts = async () => {
  try {
    const response = await fetch(
      "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/products/",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    )
    const data = await response.json()
    if (data?.data) {
      setAllProducts(data.data)
    }
  } catch (error) {
    console.error("Error fetching products:", error)
  }
}

useEffect(() => {
  if (isOpen) {
    fetchProducts()
  }
}, [isOpen])

 useEffect(() => {
    console.log("Product search results:", productSearchResults)
  }, [productSearchResults])
  

// fetch terms only when modal opens
useEffect(() => {
  if (isOpen && quotation) {
    // fetch available terms from backend
    fetchTerms()

    // pre-fill already selected terms
    if (quotation.terms) {
      setSelectedTerms(quotation.terms.map((t) => t.id))
    }
  }
}, [isOpen, quotation])

// filtering for search
const filteredTerms = availableTerms.filter((term) =>
  term.title.toLowerCase().includes(termsSearchQuery.toLowerCase())
)

const updateProduct = (product, productIndex) => {
    const updatedProducts = [...formData.products]
    const index = updatedProducts.findIndex((p) => p.id === product.id)

    if (index !== -1) {
      updatedProducts[index] = { ...updatedProducts[index], ...product }
    }
    else {
      updatedProducts[productIndex] = { ...updatedProducts[productIndex], ...product }
    }
    setFormData((prev) => ({ ...prev, products: updatedProducts }))
    calculateTotals(updatedProducts)
  }

  const searchProducts = async (query, productIndex) => {
    if (!query.trim()) {
      setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }))
      return
    }

    setIsSearchingProducts((prev) => ({ ...prev, [productIndex]: true }))
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/products/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log("Product search data:", data.data)

      if (data) {
        setProductSearchResults((prev) => ({ ...prev, [productIndex]: data.data }))

      } else {
        console.error("Failed to search products:", data.error)
        setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }))
      }
    } catch (error) {
      console.error("Error searching products:", error)
      setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }))
    } finally {
      setIsSearchingProducts((prev) => ({ ...prev, [productIndex]: false }))
    }

  }
    const selectProduct = (product, productIndex, name) => {
    updateProduct({ id: product.id, name: name || product.name, selling_price: product.selling_price }, productIndex)

    setProductSearchStates((prev) => ({
      ...prev,
      [productIndex]: {
        ...prev[productIndex],
        query: product.name,
        showResults: false,
      },
    }));
    setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }));
  };
  const handleChangeProductDetail = (e, productIndex) => {
    const { name, value } = e.target
    const product = { [name]: name === "quantity" ? parseInt(value) || 0 : value === "selling_price" ? parseFloat(value) || 0 : value }

    setFormData((prev) => {
      const updatedProducts = [...prev.products]
      updatedProducts[productIndex] = { ...updatedProducts[productIndex], ...product }
      return { ...prev, products: updatedProducts }
    });
  }
  const handleProductSearchChange = (e, productIndex) => {
    const query = e.target.value

    setProductSearchStates((prev) => ({
      ...prev,
      [productIndex]: {
        query,
        showResults: query.trim().length > 0,
      },
    }))

    if (query.trim()) {
      searchProducts(query, productIndex)
    } else {
      setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }))
    }
  }


  // format ISO date -> YYYY-MM-DD for input[type=date]
  const formatDate = (isoDate) => {
    if (!isoDate) return ""
    return new Date(isoDate).toISOString().split("T")[0]
  }

  useEffect(() => {
    if (quotation) {
      setFormData({
        customerName: quotation.customer?.name || "",
        companyName: quotation.customer?.company_name || "",
        email: quotation.customer?.email || "",
        phone: quotation.customer?.phone || "",
        address: quotation.customer?.address || "",
        products:
          quotation.products?.map((p) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            selling_price: p.unit_price,
            tax_rate: p.tax_rate,
          })) || [{ id: "", name: "", quantity: 1, selling_price: 0, tax_rate: 0 }],
        subtotal: quotation.subtotal?.toFixed(2) || "0.00",
        discount: quotation.discount || 0,
        tax: quotation.tax_total?.toFixed(2) || "0.00",
        totalAmount: quotation.total?.toFixed(2) || "0.00",
        quotationDate: formatDate(quotation.created_at),
        validUntil: formatDate(quotation.follow_up_date),
        status: quotation.status || "PENDING",
        additionalNotes: quotation.additionalNotes || "",
        createdBy: quotation.created_by || "Admin User",
        digitalSignature: quotation.digitalSignature || "",
        id: quotation.id || "",
      })
    }
  }, [quotation])

  const addProductRow = () => {
    const newProducts = [...formData.products, { id: "", name: "", quantity: 1, selling_price: 0 }]
    setFormData((prev) => ({ ...prev, products: newProducts }))
  }

 const removeProductRow = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, products: updatedProducts }));
      calculateTotals(updatedProducts)

      setProductSearchStates((prev) => {
        // Remap productSearchStates to match the new indices of formData.products
        const newStates = {};
        formData.products.forEach((_, i) => {
          if (i < index) {
            newStates[i] = prev[i];
          } else if (i > index) {
            newStates[i - 1] = prev[i];
          }
          // skip the removed index
        });
        return newStates;
      });
      setProductSearchResults((prev) => {
        const newResults = { ...prev }
        delete newResults[index]
        return newResults
      })
      setIsSearchingProducts((prev) => {
        const newSearching = { ...prev }
        delete newSearching[index]
        return newSearching
      })
    }
  }


  const calculateTotals = (products) => {
    const subtotal = products.reduce((sum, product) => {
      return sum + (product.quantity || 0) * (product.selling_price || 0)
    }, 0)

    const tax = subtotal * 0.18 // 18% tax
    const discount = subtotal*(Number.parseFloat(formData.discount))/10 || 0
    const totalAmount = subtotal + tax - discount

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      discount: prev.discount,
    }))
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTermSelection = (termId) => {
    setSelectedTerms((prev) => (prev.includes(termId) ? prev.filter((id) => id !== termId) : [...prev, termId]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // map back to backend structure
    const payload = {
      ...quotation,
      customer: {
        ...quotation.customer,
        name: formData.customerName,
        company_name: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      products: formData.products.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unit_price: p.selling_price,
        tax_rate: p.tax_rate,
        description: p.name,
      })),
      subtotal: Number(formData.subtotal),
      discount: Number(formData.discount) || 0,
      tax_total: Number(formData.tax),
      total: Number(formData.totalAmount),
      status: formData.status.toUpperCase(),
      follow_up_date: formData.validUntil || null,
      created_at: formData.quotationDate,
      terms: selectedTerms, 

    }

    try {
      const token = localStorage.getItem("token");


      console.log("Final payload to backend:", payload);

      const response = await fetch(
        "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/quotations/create/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create quotation: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Quotation Updated successfully:", result);

      alert("Quotation updated successfully!");
    } catch (error) {
      console.error("Error sending quotation:", error);
      alert("Error updating quotation. Please try again.");
    }
    console.log("Submitting updated quotation:", payload)
    // onSave(payload)
    onClose()
  }

  if (!isOpen || !quotation) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Quotation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => updateFormData("customerName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => updateFormData("companyName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    placeholder="+1 234567890 (10 digits)"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Add Products/Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Add Products/Services</h2>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="percentage-discount"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="percentage-discount" className="text-sm text-gray-600">
                        Enable Percentage Discount Column
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="amount-discount"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="amount-discount" className="text-sm text-gray-600">
                        Enable Amount Discount Column
                      </label>
                    </div>
                  </div>

                  <div className="">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">S.No.</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product/Service</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Quantity</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Rate</th>
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
                                          onClick={() => selectProduct(searchProduct, index)}
                                          className="px-4 py-3  hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                          <div className="font-medium text-gray-900">{searchProduct.name}</div>
                                          <div className="text-sm text-gray-600">{searchProduct.description}</div>
                                          <div className="text-sm text-gray-500 flex justify-between">
                                            
                                          </div>
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
                                type="number"
                                value={product.selling_price}
                                name="selling_price"
                                onChange={(e) => handleChangeProductDetail(e, index)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="py-3 px-2 text-sm font-medium">
                              Rs. {((product.quantity || 0) * (product.selling_price || 0)).toFixed(2)}
                            </td>
                            <td className="py-3 px-2">
                              {formData.products.length > 1 && (
                                <button
                                type="button"
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
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-semibold">Rs. {formData.subtotal}</span>
                    </div>
                    <button
                    type="button"
                      onClick={addProductRow}
                      className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product Row</span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add All Products</span>
                    </button>
                  </div>
                </div>

          {/* Quotation Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
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
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="special-discount"
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
                  <span className="text-sm font-medium">Rs. {formData.discount || "0.00"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-xs text-gray-500">18%</span>
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

          {/* Terms & Conditions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Terms & Conditions</label>
                <div
                  className="relative"
                  tabIndex={0}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setShowTermsDropdown(false)
                    }
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search and select terms & conditions..."
                      value={termsSearchQuery}
                      onChange={(e) => setTermsSearchQuery(e.target.value)}
                      onFocus={() => setShowTermsDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {selectedTerms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTerms.map((termId) => {
                        const term = availableTerms.find((t) => t.id === termId)
                        return term ? (
                          <span
                            key={termId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {term.title}
                            <button
                              type="button"
                              onClick={() => handleTermSelection(termId)}
                              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {showTermsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredTerms.length > 0 ? (
                        filteredTerms.map((term) => (
                          <div
                            key={term.id}
                            onClick={() => handleTermSelection(term.id)}
                            className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTerms.includes(term.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{term.title}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {termsSearchQuery ? "No terms found matching your search" : "No terms available"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">{selectedTerms.length} term(s) selected</p>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Additional Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.quotationDate}
                    onChange={(e) => updateFormData("quotationDate", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => updateFormData("validUntil", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
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

          {/* Creator Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PenTool className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Creator Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created By *</label>
                <input
                  value={formData.createdBy}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Digital Signature</label>
                <input
                  placeholder="Enter signature or initials"
                  value={formData.digitalSignature}
                  onChange={(e) => updateFormData("digitalSignature", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
