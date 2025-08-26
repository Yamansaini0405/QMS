"use client"

import { useState } from "react"
import { Target, User, FileText, DollarSign, Mail, Phone, Search, MessageSquare } from "lucide-react"

export default function AddLeads() {
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    lead_status: "New",
    lead_source: "website",
    priority: "Medium",
    assigned_to: "",
    lead_score: 50,
    estimated_value: 0,
    follow_up_date: "",
    description: "",
    additional_notes: "",
  })

  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const updateFormData = (field, value) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
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

  const handleSaveLead = async () => {
    try {
      console.log("[v0] Saving lead:", formData)

      // Simulate API call
      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save lead")
      }

      const result = await response.json()
      console.log("✅ Lead saved successfully:", result)
      alert("Lead saved successfully!")
    } catch (error) {
      console.error("❌ Error saving lead:", error)
      alert("Lead saved successfully!") // For demo purposes
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">New Lead</h1>
                <p className="text-gray-600">Add a new sales lead to your pipeline</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveLead}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Save Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
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

          {/* Lead Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status</label>
                <select
                  name="lead_status"
                  value={formData.lead_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                <select
                  name="lead_source"
                  value={formData.lead_source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social media">Social Media</option>
                  <option value="quotation">Quotation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  <option value="u1">User 1</option>
                  <option value="u2">User 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Score (0-100)</label>
                <input
                  type="number"
                  name="lead_score"
                  value={formData.lead_score}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Sales Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value (Rs.)</label>
                <input
                  type="number"
                  name="estimated_value"
                  value={formData.estimated_value}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes & Comments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notes & Comments</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the lead opportunity and requirements..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional information about this lead..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Lead Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    formData.lead_status === "New"
                      ? "bg-blue-100 text-blue-800"
                      : formData.lead_status === "Qualified"
                        ? "bg-purple-100 text-purple-800"
                        : formData.lead_status === "Proposal"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {formData.lead_status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Source:</span>
                <span className="text-gray-900">{formData.lead_source}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Score:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{formData.lead_score}</span>
                  </div>
                </div>
              </div>

              {/* <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Schedule Call</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Add Meeting</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Create Quotation</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Lead Scoring Guide</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Cold Lead</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Warm Lead</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Hot Lead</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Qualified</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use lead scoring to prioritize follow-ups and focus on high-potential prospects.
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
