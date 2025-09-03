import { User, Search } from "lucide-react";
import { useQuotation } from "../../contexts/QuotationContext";

export default function CustomerInfoForm() {
  const {
    customerSearchQuery, handleCustomerSearchChange, showCustomerSearch, setShowCustomerSearch,
    customerSearchResults, isSearchingCustomers, selectCustomer, formData, updateFormData
  } = useQuotation();

  return (
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
                if (customerSearchQuery.trim()) setShowCustomerSearch(true);
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
                      <div className="text-sm text-gray-600">{customer.company_name}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
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
  );
}