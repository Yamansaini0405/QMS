import {
  Save,
  Send,
  Plus,
  Search,
  Calendar,
  User,
  Package,
  FileText,
  Settings,
  Eye,
  EyeOff,
  PenTool,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import QuotationTemplate from "../components/QuotationTemplate"

export default function NewQuotationPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [availableTerms, setAvailableTerms] = useState([])
  const [selectedTerms, setSelectedTerms] = useState([])
  const [termsSearchQuery, setTermsSearchQuery] = useState("")
  const [showTermsDropdown, setShowTermsDropdown] = useState(false)


  const [productSearchStates, setProductSearchStates] = useState({})
  const [productSearchResults, setProductSearchResults] = useState({})
  const [isSearchingProducts, setIsSearchingProducts] = useState({})
  const [formData, setFormData] = useState({
    quotationDate: "23/08/2025",
    validUntil: "21-09-2025",
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    products: [{ id: "", name: "", quantity: 1, selling_price: 0 }],
    subtotal: "0.00",
    discount: "",
    tax: "0.00",
    totalAmount: "0.00",
    additionalNotes: "",
    createdBy: "Admin User",
    digitalSignature: "",
  })


  useEffect(() => {
    console.log("Products updated:", formData.products)
  }, [formData.products])

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
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

  useEffect(() => {
    console
  }, [productSearchResults])

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
    const discount = Number.parseFloat(formData.discount) || 0
    const totalAmount = subtotal + tax - discount

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }))
  }

  const searchCustomers = async (query) => {
    if (!query.trim()) {
      setCustomerSearchResults([])
      return
    }

    setIsSearchingCustomers(true)
    // /api/customers?search=${encodeURIComponent(query)}
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/customers/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data) {
        setCustomerSearchResults(data.data)
      } else {
        console.error("Failed to search customers:", data.error)
        setCustomerSearchResults([])
      }
    } catch (error) {
      console.error("Error searching customers:", error)
      setCustomerSearchResults([])
    } finally {
      setIsSearchingCustomers(false)
    }
  }

  const selectCustomer = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id, // ✅ backend customer ID
      customerName: customer.name,
      companyName: customer.company_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    }));

    setCustomerSearchQuery(customer.name);
    setShowCustomerSearch(false);
    setCustomerSearchResults([]);
  };


  const handleCustomerSearchChange = (e) => {
    const query = e.target.value
    setCustomerSearchQuery(query)

    if (query.trim()) {
      setShowCustomerSearch(true)
      searchCustomers(query)
    } else {
      setShowCustomerSearch(false)
      setCustomerSearchResults([])
    }
  }

  const mapFormDataToPayload = (formData, selectedTerms) => {
    return {
      customer: {
        // ✅ include backend ID
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
      },
      auto_assign: false,
      status: "PENDING",
      email_template: 1,
      // follow_up_date: formData.validUntil,
      terms: selectedTerms,
      items: formData.products.map((p) => ({
        product: p.id,
        // description: p.description || p.name || "",
        quantity: p.quantity,
        // name: p.name,
        // unit_price: p.selling_price ? String(p.selling_price) : "0.00",
        // tax_rate: p.tax_rate ? String(p.tax_rate) : "0.00",
      })),
    };
  };

  const createQuotation = async () => {


    try {
      const token = localStorage.getItem("token");

      // ✅ Use mapper to prepare backend payload
      const payload = mapFormDataToPayload(formData, selectedTerms);

      console.log("Final payload to backend:", payload);

      const response = await fetch(
        "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/quotations/create/",
        {
          method: "POST",
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
      console.log("Quotation created successfully:", result);

      alert("Quotation created and sent successfully!");
    } catch (error) {
      console.error("Error sending quotation:", error);
      alert("Error creating quotation. Please try again.");
    }
  };


  const generatePDFAndSend = async () => {
    setIsGeneratingPDF(true)

    try {
      console.log("[v0] Starting PDF generation...")

      // For now, just send the form data to backend without PDF generation
      // You can add PDF generation library later
      const response = await fetch("/api/quotations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotationData: formData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Quotation sent successfully:", result)
        alert("Quotation created and sent successfully!")
      } else {
        throw new Error("Failed to send quotation to backend")
      }
    } catch (error) {
      console.error("[v0] Error sending quotation to backend:", error)
      alert("Error creating quotation. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const downloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      console.log("[v0] Starting PDF download...")

      const wasShowingPreview = showPreview
      if (!wasShowingPreview) {
        setShowPreview(true)
        // Wait for DOM to update
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Create a new window with just the quotation content
      const printWindow = window.open("", "_blank")
      const quotationElement = document.getElementById("quotation-template")

      if (!quotationElement) {
        throw new Error("Quotation template not found")
      }

      // Create the print document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quotation_${formData.quotationNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .bg-white { background: white !important; }
            .bg-gray-50 { background: #f9fafb !important; }
            .bg-blue-50 { background: #eff6ff !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-400 { color: #9ca3af !important; }
            .border { border: 1px solid #d1d5db !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .border-blue-600 { border-color: #2563eb !important; }
            .border-gray-400 { border-color: #9ca3af !important; }
            .border-t { border-top: 1px solid #d1d5db !important; }
            .border-b-2 { border-bottom: 2px solid !important; }
            .border-l-4 { border-left: 4px solid !important; }
            .border-yellow-400 { border-color: #fbbf24 !important; }
            .rounded-lg { border-radius: 8px !important; }
            .p-8 { padding: 32px !important; }
            .p-4 { padding: 16px !important; }
            .p-3 { padding: 12px !important; }
            .pb-6 { padding-bottom: 24px !important; }
            .mb-8 { margin-bottom: 32px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mt-4 { margin-top: 16px !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .text-3xl { font-size: 30px !important; line-height: 36px !important; }
            .text-2xl { font-size: 24px !important; line-height: 32px !important; }
            .text-lg { font-size: 18px !important; line-height: 28px !important; }
            .text-sm { font-size: 14px !important; line-height: 20px !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .italic { font-style: italic !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-end { justify-content: flex-end !important; }
            .items-start { align-items: flex-start !important; }
            .items-end { align-items: flex-end !important; }
            .w-full { width: 100% !important; }
            .w-80 { width: 320px !important; }
            .w-48 { width: 192px !important; }
            .max-w-4xl { max-width: 896px !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #d1d5db !important; padding: 12px !important; }
            th { background-color: #eff6ff !important; }
            @media print {
              body { print-color-adjust: exact; }
              .shadow-sm { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          ${quotationElement.outerHTML}
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)

      console.log("[v0] PDF download initiated")

      if (!wasShowingPreview) {
        setShowPreview(false)
      }
    } catch (error) {
      console.error("[v0] Error downloading PDF:", error)
      alert("Error downloading PDF. Please try again.")

      if (!showPreview) {
        setShowPreview(false)
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const fetchTerms = async () => {
    try {
      const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/terms/", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      console.log("Fetched terms:", data)
      if (data) {
        setAvailableTerms(data)
      }
    } catch (error) {
      console.error("Error fetching terms:", error)
    }
  }

  const handleTermSelection = (termId) => {
    const updatedSelectedTerms = selectedTerms.includes(termId)
      ? selectedTerms.filter((id) => id !== termId)
      : [...selectedTerms, termId]

    setSelectedTerms(updatedSelectedTerms)
    setFormData((prev) => ({
      ...prev,
      selectedTerms: updatedSelectedTerms,
    }))
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const filteredTerms = availableTerms.filter(
    (term) =>
      term.title.toLowerCase().includes(termsSearchQuery.toLowerCase()) ||
      term.content_html.toLowerCase().includes(termsSearchQuery.toLowerCase()),
  )

  useEffect(() => {
    console.log("Product search states updated:", productSearchStates)
  }, [productSearchStates])




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>

                <h1 className="text-2xl font-semibold text-gray-900">New Quotation</h1>
                <p className="text-gray-600">Create a new quotation for your customer</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={generatePDFAndSend}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isGeneratingPDF ? "Creating..." : "Create & Send"}</span>
            </button>
          </div>
        </div>

        <div className="hidden">
          <QuotationTemplate formData={formData} />
        </div>

        {showPreview ? (
          <QuotationTemplate formData={formData} />
        ) : (
          <>
            {/* Quotation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Number</label>
                      <input
                        value={formData.quotationNumber}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date</label>
                      <div className="relative">
                        <input
                          value={formData.quotationDate}
                          onChange={(e) => updateFormData("quotationDate", e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                      <div className="relative">
                        <input
                          placeholder="Search and select customer..."
                          value={customerSearchQuery}
                          onChange={handleCustomerSearchChange}
                          onFocus={() => {
                            if (customerSearchQuery.trim()) {
                              setShowCustomerSearch(true)
                            }
                          }}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />

                        {showCustomerSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {isSearchingCustomers ? (
                              <div className="px-4 py-3 text-sm text-gray-500">Searching customers...</div>
                            ) : customerSearchResults.length > 0 ? (
                              customerSearchResults.map((customer) => (
                                <div
                                  key={customer.id}
                                  onClick={() => selectCustomer(customer)}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-sm text-gray-600">{customer.company}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                </div>
                              ))
                            ) : customerSearchQuery.trim() ? (
                              <div className="px-4 py-3 text-sm text-gray-500">No customers found</div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

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
                                            {/* <span>{searchProduct.category}</span> */}
                                            {/* <span>
                                              Rs. {searchProduct.selling_price}/{searchProduct.unit}
                                            </span> */}
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Terms & Conditions</label>
                      <div className="relative"
                        tabIndex={0}
                        onBlur={(e) => {
                          // Only close if the next focused element is outside this container
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setShowTermsDropdown(false)
                          }
                        }}>
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

                        {/* Selected Terms Display */}
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

                        {/* Dropdown */}
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
                                    onChange={() => { }}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{term.title}</div>
                                    {/* <div className="text-xs text-gray-600 mt-1">{term.content_html}</div> */}
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
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        defaultValue="pending"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <span>Valid Until: </span>
                      <span className="font-medium">{formData.validUntil}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Status: </span>
                      <span className="font-medium">pending</span>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                    <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add New Customer</span>
                    </button>
                    <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Search className="w-4 h-4" />
                      <span>Browse Templates</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
              <button className="flex items-center space-x-2 px-6 py-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-6 py-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={createQuotation}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-6 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isGeneratingPDF ? "Creating..." : "Create & Send"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}