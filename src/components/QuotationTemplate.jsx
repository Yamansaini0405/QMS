

function QuotationTemplate({ formData, forPrint = false }) {
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
                <strong>Quotation No:</strong> {formData.quotationNumber || "QT-NK-0001"}
              </p>
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
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-gray-300 p-3 text-left">S.No.</th>
              <th className="border border-gray-300 p-3 text-left">Product/Service</th>
              <th className="border border-gray-300 p-3 text-center">Quantity</th>
              <th className="border border-gray-300 p-3 text-right">Rate</th>
              <th className="border border-gray-300 p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {formData.products && formData.products.length > 0 ? (
              formData.products.map((product, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-3">{index + 1}</td>
                  <td className="border border-gray-300 p-3">{product.name || "[Product/Service]"}</td>
                  <td className="border border-gray-300 p-3 text-center">{product.quantity || 1}</td>
                  <td className="border border-gray-300 p-3 text-right">Rs. {product.rate || "0.00"}</td>
                  <td className="border border-gray-300 p-3 text-right">
                    Rs. {((product.quantity || 1) * (product.rate || 0)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-gray-300 p-3">1</td>
                <td className="border border-gray-300 p-3">[Product/Service]</td>
                <td className="border border-gray-300 p-3 text-center">1</td>
                <td className="border border-gray-300 p-3 text-right">Rs. 0.00</td>
                <td className="border border-gray-300 p-3 text-right">Rs. 0.00</td>
              </tr>
            )}
          </tbody>
        </table>
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
                <span>Rs. {formData.discount}</span>
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
        <div className="text-sm text-gray-700 space-y-2">
          <p>1. Payment terms: Net 30 days from invoice date.</p>
          <p>2. All prices are in Indian Rupees (Rs.) and exclude applicable taxes unless specified.</p>
          <p>3. Quotation is valid for 30 days from the date of issue.</p>
          <p>4. Any changes to the scope of work may result in additional charges.</p>
          <p>5. Delivery timeline will be confirmed upon order confirmation.</p>
          {formData.additionalNotes && (
            <p className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <strong>Additional Notes:</strong> {formData.additionalNotes}
            </p>
          )}
        </div>
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