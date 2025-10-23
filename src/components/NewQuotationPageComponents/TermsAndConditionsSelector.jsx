"use client"

import { Search, X } from "lucide-react"
import { useQuotation } from "../../contexts/QuotationContext"

export default function TermsAndConditionsSelector() {
  const {
    availableTerms,
    selectedTerms,
    setSelectedTerms,
    termsSearchQuery,
    setTermsSearchQuery,
    showTermsDropdown,
    setShowTermsDropdown,
    handleTermSelection,
    filteredTerms,
  } = useQuotation()

  const formatTermsContent = (contentHtml) => {
    if (!contentHtml) return ""
    // Remove asterisks and split by them to create bullet points
    return contentHtml
      .split("*")
      .filter((item) => item.trim())
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        {selectedTerms.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Selected Terms & Conditions Content</h3>
            <div className="space-y-4">
              {selectedTerms.map((termId) => {
                const term = availableTerms.find((t) => t.id === termId)
                if (!term) return null

                const formattedContent = formatTermsContent(term.content_html)

                return (
                  <div key={termId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">{term.title}</h4>
                    <div className="text-sm text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        {formattedContent.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
