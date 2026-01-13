import { User, Search, Building2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { useQuotation } from "../../contexts/QuotationContext";

export default function CustomerInfoForm() {
  const {
    // Search states from Context
    customerSearchQuery, handleCustomerSearchChange, showCustomerSearch, setShowCustomerSearch,
    customerSearchResults, isSearchingCustomers, selectCustomer, 
    
    // Form data and errors
    formData, updateFormData, formErrors, 
    
    // Company search states from Context
    showCompanyDropdown, setShowCompanyDropdown,
    companySearchResults, handleCompanySearchChange, selectCustomerCompany
  } = useQuotation();

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowCompanyDropdown]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <User className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
      </div>

      <div className="space-y-4">
        {/* Global Search Tooltip */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select Existing Customer</label>
          <div className="relative">
            <input
              placeholder="Search by name, company, or phone..."
              value={customerSearchQuery}
              onChange={handleCustomerSearchChange}
              onFocus={() => {
                if (customerSearchQuery.trim()) setShowCustomerSearch(true);
              }}
              onBlur={() => setTimeout(() => setShowCustomerSearch(false), 200)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            
            {showCustomerSearch && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearchingCustomers ? (
                  <div className="px-4 py-3 text-sm text-gray-500 italic">Searching database...</div>
                ) : customerSearchResults.length > 0 ? (
                  customerSearchResults.map((customer) => (
                    <div
                      key={customer.id}
                      onMouseDown={() => selectCustomer(customer)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {customer.company_name} • {customer.phone}
                      </div>
                    </div>
                  ))
                ) : customerSearchQuery.trim() ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No matching customers found</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Enter customer name"
              value={formData.customerName}
              onChange={(e) => updateFormData("customerName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                formErrors.customerName ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {formErrors.customerName && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.customerName}</p>}
          </div>

          {/* Searchable Company Name Input (NEW LOGIC) */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Type to search or enter new company..."
              value={formData.companyName}
              onChange={handleCompanySearchChange}
              onFocus={() => {
                if (formData.companyName.trim()) setShowCompanyDropdown(true);
              }}
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                formErrors.companyName ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            {/* Suggestions Dropdown */}
            {showCompanyDropdown && companySearchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
                {companySearchResults.map((customer, index) => (
                  <div
                    key={customer.id || index}
                    onMouseDown={() => selectCustomerCompany(customer)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <div>
                        <div className="font-medium text-gray-900">{customer.company_name}</div>
                        
                    </div>
                  </div>
                ))}
              </div>
            )}
            {formErrors.companyName && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.companyName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="10 digit number"
              value={formData.phone}
              onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  updateFormData("phone", val);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                formErrors.phone ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.phone}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                formErrors.email ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              placeholder="Enter street address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* GST No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST No</label>
            <input
              placeholder="Enter GSTIN"
              value={formData.gst_number}
              onChange={(e) => updateFormData("gst_number", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}