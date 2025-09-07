

function QuotationTemplate({ formData, forPrint = false, availableTerms }) {
  console.log("Rendering QuotationTemplate with formData:", formData)
  return (
    <div
      className={`bg-white p-8 rounded-lg ${forPrint ? "" : "shadow-sm border"} max-w-4xl mx-auto`}
      id="quotation-template"
    >
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
            <div className="text-sm text-gray-600 space-y-1">

              <p>
                <strong>Date:</strong> {formData.quotationDate || "23/08/2025"}
              </p>
              <p>
                <strong>Valid Until:</strong> {formData.validUntil || "21-09-2025"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-2">Your Company</div>
            <div className="text-sm text-gray-600">
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>Phone: +1 234 567 8900</p>
              <p>Email: info@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {formData.customerName ? (
            <>
              <p className="font-semibold"><span className="font-semibold text-md">Customer Name:</span> {formData.customerName}</p>
              {formData.contactPerson && <p><span className="font-semibold text-md">Contact Person:</span> {formData.contactPerson}</p>}
              {formData.email && <p><span className="font-semibold text-md">Email:</span> {formData.email}</p>}
              {formData.phone && <p><span className="font-semibold text-md">Phone:</span> {formData.phone}</p>}
              {formData.address && <p><span className="font-semibold text-md">Address:</span> {formData.address}</p>}
            </>
          ) : (
            <p className="text-gray-400 italic">No customer selected</p>
          )}
        </div>
      </div>

      {/* Products/Services Table */}
      <div className="mb-8">
        {formData.products && formData.products.length > 0 && (
          <>
          
            {(() => {
              const showDiscountColumn = formData.products.some(
                (p) => (p.percentage_discount || 0) > 0
              );

              return (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-3 text-left">S.No.</th>
                      <th className="border border-gray-300 p-3 text-left">Product/Service</th>
                      <th className="border border-gray-300 p-3 text-center">Quantity</th>
                      <th className="border border-gray-300 p-3 text-right">Rate</th>

                      {/* Conditionally render Discount column */}
                      {showDiscountColumn && (
                        <th className="border border-gray-300 p-3 text-right">Discount</th>
                      )}

                      <th className="border border-gray-300 p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((product, index) => {
                      const qty = product.quantity || 1;
                      const rate = product.selling_price || 0;
                      const discountPct = product.percentage_discount || 0;

                      const baseAmount = qty * rate;
                      const discountAmount = (baseAmount * discountPct) / 100;
                      const finalAmount = baseAmount - discountAmount;

                      return (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">{index + 1}</td>
                          <td className="border border-gray-300 p-3">
                            {product.name || "[Product/Service]"}
                          </td>
                          <td className="border border-gray-300 p-3 text-center">{qty}</td>
                          <td className="border border-gray-300 p-3 text-right">
                            Rs. {rate.toFixed(2)}
                          </td>

                          {/* Conditionally render Discount column */}
                          {showDiscountColumn && (
                            <td className="border border-gray-300 p-3 text-right">
                              {discountPct > 0 ? `${discountPct}%` : "—"}
                            </td>
                          )}

                          <td className="border border-gray-300 p-3 text-right">
                            Rs. {finalAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </>
        )}
      </div>


      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {formData.subtotal || "0.00"}</span>
            </div>
            {formData.discount && (
              <div className="flex justify-between">
                <span>Discount:</span>
                {formData.discountType === "percentage" ? (
                  <span>
                    {formData.discount}% (Rs. {(formData.subtotal * formData.discount / 100).toFixed(2)})
                  </span>
                ) : (
                  <span>Rs. {formData.discount}</span>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (18%):</span>
              <span>Rs. {formData.tax || "0.00"}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-blue-600">Rs. {formData.totalAmount || "0.00"}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Terms & Conditions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions:</h2>

        {formData.selectedTerms && formData.selectedTerms.length > 0 ? (
          <div className="text-sm text-gray-700 space-y-4">
            {formData.selectedTerms.map((termId, idx) => {
              const term = availableTerms.find((t) => t.id === termId)
              if (!term) return null

              // Split content_html by "*" into bullet points
              const items = term.content_html
                ? term.content_html.split("*").filter((item) => item.trim())
                : []

              return (
                <div key={termId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {idx + 1}. {term.title}
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-400 italic">No terms & conditions selected</p>
        )}

        {formData.additionalNotes && (
          <p className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <strong>Additional Notes:</strong> {formData.additionalNotes}
          </p>
        )}
      </div>


      {/* Signature */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-600">Thank you for your business!</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 w-48 mb-2"></div>
          <p className="text-sm text-gray-600">
            {formData.createdBy || "Admin User"}
            <br />
            {formData.digitalSignature && `Signature: ${formData.digitalSignature}`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuotationTemplate