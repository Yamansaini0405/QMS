"use client"

import { useState, useEffect } from "react"
import { Target, User, FileText, DollarSign, Mail, Phone, Search, MessageSquare, UserCog } from "lucide-react"
import Swal from "sweetalert2"


export default function AddLeads() {
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    lead_status: "NEW",
    lead_source: "WEBSITE",
    priority: "MEDIUM",
    assigned_to: "",
    follow_up_date: "",
    description: "",
    additional_notes: "",
  })
  const [formErrors, setFormErrors] = useState({})

  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [salespersonQuery, setSalespersonQuery] = useState("");
  const [salespersonResults, setSalespersonResults] = useState([]);
  const [isSearchingSalesperson, setIsSearchingSalesperson] = useState(false);
  const [showSalespersonSearch, setShowSalespersonSearch] = useState(false);
  const [salespersonSelected, setSalespersonSelected] = useState(false);
  const [role, setRole] = useState(null)
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    try {
      setRole(localStorage.getItem("role"))
    } catch { }
  }, [])


  // const handleInputChange = (e) => {
  //   const { name, value } = e.target
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }))
  // }
  // const updateFormData = (field, value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }))
  // }


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
      address: customer.primary_address,
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

  const searchSalespersons = async (query) => {
    if (!query.trim()) {
      setSalespersonResults([]);
      return;
    }

    setIsSearchingSalesperson(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://4g1hr9q7-8000.inc1.devtunnels.ms/accounts/api/users/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data && data.data) {
        const salespersonsOnly = data.data.filter(
          (user) => user.role && user.role.toUpperCase() === "SALESPERSON"
        );

        const filtered = salespersonsOnly.filter((sp) => {
          const fullName = `${sp.first_name || ""} ${sp.last_name || ""}`.trim();
          return (
            fullName.toLowerCase().includes(query.toLowerCase()) ||
            (sp.username && sp.username.toLowerCase().includes(query.toLowerCase())) ||
            (sp.email && sp.email.toLowerCase().includes(query.toLowerCase())) ||
            (sp.phone_number && String(sp.phone_number).toLowerCase().includes(query.toLowerCase()))
          );
        });


        setSalespersonResults(filtered);
        console.log("Filtered salespersons:", filtered);
      } else {
        setSalespersonResults([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setSalespersonResults([]);
    } finally {
      setIsSearchingSalesperson(false);
    }
  };



  // ---- Handle selection ----
  const selectSalesperson = (sp) => {
    const fullName = sp.username

    setFormData((prev) => ({
      ...prev,
      assigned_to: sp.id,
      salespersonName: fullName,
      salespersonPhone: sp.phone_number || "",
      salespersonEmail: sp.email || "",
      salespersonAddress: sp.address || "",
    }))

    setSalespersonQuery(fullName)
    setSalespersonSelected(true)
    setShowSalespersonSearch(false)
    setSalespersonResults([])
  }



  const handleSaveLead = async () => {
    validateField("email", formData.email)
    validateField("phone", formData.phone)

    if (role === "ADMIN") {
      validateField("salespersonEmail", formData.salespersonEmail || "")
      validateField("salespersonPhone", formData.salespersonPhone || "")
    }

    // Stop if any errors exist
    if (Object.values(formErrors).some((err) => err)) {
      Swal.fire("Validation Error", "Please fix all errors before saving.", "error")
      return
    }
    setIsLoading(true)
    try {
      let followUpDate = formData.follow_up_date
      if (followUpDate) {
        const [year, month, day] = followUpDate.includes("-") && followUpDate.split("-").length === 3
          ? followUpDate.split("-")
          : []

        // if user somehow typed or you reformatted into DD-MM-YYYY
        if (year.length !== 4) {
          const [dd, mm, yyyy] = followUpDate.split("-")
          followUpDate = `${yyyy}-${mm}-${dd}` // ✅ convert to YYYY-MM-DD
        }
      }

      const payload = {
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_company: formData.companyName,
        customer_primary_address: formData.address,
        status: formData.lead_status,
        lead_source: formData.lead_source,
        follow_up_date: followUpDate,
        notes: formData.description,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
      }

      console.log("Saving lead payload:", payload)

      const response = await fetch(
        "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/leads/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save lead: ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Lead saved successfully:", result)

      Swal.fire("Saved!", "Lead saved successfully!", "success")


      // ✅ Reset form after success
      setFormData({
        customerName: "",
        companyName: "",
        email: "",
        phone: "",
        address: "",
        lead_status: "NEW",
        lead_source: "WEBSITE",
        priority: "MEDIUM",
        assigned_to: "",
        follow_up_date: "",
        description: "",
        additional_notes: "",
      })

      setCustomerSearchQuery("")
      setSalespersonQuery("")
      setSalespersonSelected(false)

    } catch (error) {
      console.error("❌ Error saving lead:", error)
      Swal.fire("Error!", "Failed to save lead. Please try again.", "error")

    } finally {
      setIsLoading(false)
    }
  }

  const validateField = (name, value) => {
    let error = ""

    // Email validation
    if (name === "email" || name === "salespersonEmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) error = "Email is required"
      else if (!emailRegex.test(value)) error = "Invalid email address"
    }

    // Phone validation
    if (name === "phone" || name === "salespersonPhone") {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!value) error = "Phone number is required"
      else if (!phoneRegex.test(value))
        error = "Phone must be 10 digits and start with 6-9"
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }))
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    validateField(field, value)
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
          {/* <button
            onClick={handleSaveLead}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Save Lead
          </button> */}

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
                    onBlur={() => setTimeout(() => setShowCustomerSearch(false), 150)}
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
                            onMouseDown={() => selectCustomer(customer)}
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
             

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Enter email"
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
      ${formErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
      ${formErrors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
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
                  <option value="NEW">New</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="CONVERTED">Converted</option>
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
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="SOCIALMEDIA">Social Media</option>
                  <option value="QUOTATION">Quotation</option>
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
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
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

          {/* Assigning Information */}
          {role === "ADMIN" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Assigned To</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salesperson Name</label>
                  <div className="relative">
                    <input
                      placeholder="Search salesperson..."
                      value={salespersonQuery}
                      onChange={(e) => {
                        const q = e.target.value
                        setSalespersonQuery(q)
                        setSalespersonSelected(false) // ✅ reset if typing again
                        setFormData((prev) => ({
                          ...prev,
                          salespersonName: q,
                          salespersonPhone: "",
                          salespersonEmail: "",
                          salespersonAddress: "",
                        }))
                        if (q.trim()) {
                          setShowSalespersonSearch(true)
                          searchSalespersons(q)
                        } else {
                          setShowSalespersonSearch(false)
                          setSalespersonResults([])
                        }
                      }}
                      onFocus={() => {
                        if (salespersonQuery.trim()) setShowSalespersonSearch(true)
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowSalespersonSearch(false), 100)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Dropdown */}
                    {showSalespersonSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {isSearchingSalesperson ? (
                          <div className="px-4 py-3 text-sm text-gray-500">Searching salespersons...</div>
                        ) : salespersonResults.length > 0 ? (
                          salespersonResults.map((sp) => (
                            <div
                              key={sp.id}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                selectSalesperson(sp)
                              }}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {sp.first_name || sp.last_name
                                  ? `${sp.first_name || ""} ${sp.last_name || ""}`.trim()
                                  : sp.username}
                              </div>
                              <div className="text-sm text-gray-600">{sp.email}</div>
                              {sp.phone_number && <div className="text-sm text-gray-500">{sp.phone_number}</div>}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">No salespersons found, enter manually</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone No.</label>
                  <input
                    name="salespersonPhone"
                    type="tel"
                    value={formData.salespersonPhone || ""}
                    placeholder="Enter phone"
                    onChange={(e) => updateFormData("salespersonPhone", e.target.value)}
                    readOnly={salespersonSelected}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
      ${formErrors.salespersonPhone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"} 
      ${salespersonSelected ? "bg-gray-100" : ""}`}
                  />
                  {formErrors.salespersonPhone && <p className="text-red-500 text-sm mt-1">{formErrors.salespersonPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    name="salespersonEmail"
                    
                    value={formData.salespersonEmail || ""}
                    placeholder="Enter phone"
                    onChange={(e) => updateFormData("salespersonEmail", e.target.value)}
                    readOnly={salespersonSelected}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
      ${formErrors.salespersonEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"} 
      ${salespersonSelected ? "bg-gray-100" : ""}`}
                  />
                  {formErrors.salespersonEmail && <p className="text-red-500 text-sm mt-1">{formErrors.salespersonEmail}</p>}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    placeholder="Enter address"
                    value={formData.salespersonAddress || ""}
                    onChange={(e) => updateFormData("salespersonAddress", e.target.value)}
                    readOnly={salespersonSelected}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${salespersonSelected ? "bg-gray-100" : "focus:ring-blue-500"
                      }`}
                  />
                </div>
              </div>
            </div>
          )}

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
                  className={`px-2 py-1 rounded-full text-sm ${formData.lead_status === "New"
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
                <span className="text-gray-600">Priority: </span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-gray-900 text-sm font-medium">{formData.priority}</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 w-full">
        <button
          onClick={handleSaveLead}
          disabled={isLoading}
          className={`w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <UserCog className="w-4 h-4" />
              Create Lead
            </>
          )}
        </button>
      </div>
    </div>
  )
}
