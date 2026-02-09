import React, { useState, useRef, useEffect } from "react";
import { Search, Target, ClipboardList } from "lucide-react";
import { useQuotation } from "../../contexts/QuotationContext";

export default function LeadSelection() {
  const [isLeadMode, setIsLeadMode] = useState(false);
  const searchContainerRef = useRef(null);
  const { 
    leadSearchQuery, setLeadSearchQuery, 
    leadSearchResults, isSearchingLeads, 
    showLeadSearch, setShowLeadSearch,
    searchLeads, selectLead, updateFormData, formData
  } = useQuotation();

  const handleToggle = (val) => {
    setIsLeadMode(val);
    if (!val) updateFormData("lead_id", null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowLeadSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowLeadSearch]);

  // Show warning if no customer selected
  const showCustomerWarning = isLeadMode && !formData.customerName;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Lead Association</h2>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Do you want to make a quotation for an existing lead?
        </label>
        
        <div className="flex space-x-4">
          {["Yes", "No"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option === "Yes")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                (option === "Yes" ? isLeadMode : !isLeadMode)
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {isLeadMode && (
          <div className="mt-4 relative animate-in fade-in slide-in-from-top-2" ref={searchContainerRef}>
            {showCustomerWarning && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  ⚠️ Please select a customer first to view their associated leads.
                </p>
              </div>
            )}

            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search Leads for {formData.customerName ? `"${formData.customerName}"` : "Customer"}
            </label>
            <div className="relative">
              <input
                placeholder="Search by Lead #, Quotation #..."
                value={leadSearchQuery}
                onChange={(e) => {
                    if (formData.customerName) {
                      setLeadSearchQuery(e.target.value);
                      searchLeads(e.target.value, formData.customerName);
                      setShowLeadSearch(true);
                    }
                }}
                disabled={!formData.customerName}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {showLeadSearch && formData.customerName && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto">
                {isSearchingLeads ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Searching Leads...</div>
                ) : leadSearchResults.length > 0 ? (
                  leadSearchResults.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => selectLead(lead)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-700">{lead.lead_number}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{lead.status}</span>
                      </div>
                      <div className="text-sm text-gray-800 mt-1">{lead.customer?.name}</div>
                      <div className="text-xs text-gray-500">{lead.customer?.phone} • Qtn: {lead.quotation_number || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No leads found for this customer</div>
                )}
              </div>
            )}
            
            {formData.lead_id && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Lead #{formData.lead_id} selected</p>
                      <p className="text-xs text-green-700">Customer info auto-filled</p>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}