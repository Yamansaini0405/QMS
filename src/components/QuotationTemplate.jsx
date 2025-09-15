import Logo from "../assets/Godrej_Logo.svg.png"
import EurekaLogo from "../assets/logo-eureka-forbes.png"
import CarysilLogo from "../assets/Carysil-Logo-Vector.svg-.png"

function QuotationTemplate({ formData, forPrint = false, availableTerms }) {
  console.log("Rendering QuotationTemplate with formData:", formData)
  return (
    <div
      className={`bg-white p-8 rounded-lg ${forPrint ? "" : "shadow-sm border"} max-w-4xl mx-auto`}
      id="quotation-template"
    >
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          {/* Company Information */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif text-[#1d3b82]">N.K. Prosales Private Limited</h1>
                <p className="text-sm">391/1, Arharya puri, Gurgaon-122001 Ph-01124 - 2308638, Email : neelamgt2004@yahoo.co.in</p>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent w-30 h-16 ">
                <img src={Logo} alt="" />
              </div>
            </div>
            <div className="text-sm text-gray-900 border-t-2 border-red-600">

              <p className="font-medium">Wholesale Dealer of : GODREJ & Boyce Mfg. Co. Ltd., Carsyll, Eureka Forbes</p>
            </div>
          </div>

          {/* Godrej Logo */}
          <div className="ml-8">

          </div>
        </div>

        {/* Quotation Details */}
        <div className="flex justify-between items-start mt-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QUOTATION</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Date:</strong> {formData.quotationDate || "23/08/2025"}
              </p>
              <p>
                <strong>Valid Until:</strong> {formData.validUntil || "21-09-2025"}
              </p>
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
              <p className="font-semibold">
                <span className="font-semibold text-md">Customer Name:</span> {formData.customerName}
              </p>
              {formData.contactPerson && (
                <p>
                  <span className="font-semibold text-md">Contact Person:</span> {formData.contactPerson}
                </p>
              )}
              {formData.email && (
                <p>
                  <span className="font-semibold text-md">Email:</span> {formData.email}
                </p>
              )}
              {formData.phone && (
                <p>
                  <span className="font-semibold text-md">Phone:</span> {formData.phone}
                </p>
              )}
              {formData.address && (
                <p>
                  <span className="font-semibold text-md">Address:</span> {formData.address}
                </p>
              )}
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
              const showDiscountColumn = formData.products.some((p) => (p.percentage_discount || 0) > 0)

              return (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-3 text-left">S.No.</th>
                      <th className="border border-gray-300 p-3 text-left">Product/Service</th>
                      <th className="border border-gray-300 p-3 text-center">Quantity</th>
                      <th className="border border-gray-300 p-3 text-right">Rate</th>

                      {/* Conditionally render Discount column */}
                      {showDiscountColumn && <th className="border border-gray-300 p-3 text-right">Discount</th>}

                      <th className="border border-gray-300 p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((product, index) => {
                      const qty = product.quantity || 1
                      const rate = product.selling_price || 0
                      const discountPct = product.percentage_discount || 0

                      const baseAmount = qty * rate
                      const discountAmount = (baseAmount * discountPct) / 100
                      const finalAmount = baseAmount - discountAmount

                      return (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">{index + 1}</td>
                          <td className="border border-gray-300 p-3">{product.name || "[Product/Service]"}</td>
                          <td className="border border-gray-300 p-3 text-center">{qty}</td>
                          <td className="border border-gray-300 p-3 text-right">Rs. {rate.toFixed(2)}</td>

                          {/* Conditionally render Discount column */}
                          {showDiscountColumn && (
                            <td className="border border-gray-300 p-3 text-right">
                              {discountPct > 0 ? `${discountPct}%` : "—"}
                            </td>
                          )}

                          <td className="border border-gray-300 p-3 text-right">Rs. {finalAmount.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
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
                    {formData.discount}% (Rs. {((formData.subtotal * formData.discount) / 100).toFixed(2)})
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
              const items = term.content_html ? term.content_html.split("*").filter((item) => item.trim()) : []

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

      <div className="pt-6 mt-8">
        {/* Brand Logos */}
        <div className="flex justify-center items-center space-x-12">
          <div className="text-center w-40 h-20">
            <img src={EurekaLogo} alt="" />
          </div>

          <div className="text-center w-40 h-20">
            <img src={CarysilLogo} alt="" />
          </div>
        </div>

        {/* Product Information */}
        <div className="text-xs text-gray-600 text-center leading-relaxed border-t-2 border-red-600">
          <p className="leading-tight">
            <strong>Godrej :</strong> Modular Office Furniture Systems and Storage Products <span className="text-red-600">•</span> Physical, Electronics &
            Premises Security Equipment <span className="text-red-600">•</span> Optimiser <span className="text-red-600">•</span> Heavy Duty Ind. Rack.
          </p>
          <p className="leading-tight">
            <strong>Eureka Forbes :</strong> Commercial & Industrial Pressures <span className="text-red-600">•</span> Vacuum Cleaner <span className="text-red-600">•</span> Scrubber Drier <span className="text-red-600">•</span>
            Sweeper <span className="text-red-600">•</span> High Jet Pressure <span className="text-red-600">•</span> Water Cooler.
          </p>
          <p className="leading-tight">
            <strong>Carsyll :</strong> Slice <span className="text-red-600">•</span> Faucet <span className="text-red-600">•</span> Chimney <span className="text-red-600">•</span> Hobs etc.
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="flex justify-center items-center mt-8">
        <div>
          <p className="text-sm text-gray-600">Thank you for your business!</p>
        </div>
        {/* <div className="text-center">
          <div className="border-t border-gray-400 w-48 mb-2"></div>
          <p className="text-sm text-gray-600">
            {formData.createdBy || "N.K. Prosales Pvt. Ltd."}
            <br />
            {formData.digitalSignature && `Signature: ${formData.digitalSignature}`}
          </p>
        </div> */}
      </div>
    </div>
  )
}

export default QuotationTemplate
