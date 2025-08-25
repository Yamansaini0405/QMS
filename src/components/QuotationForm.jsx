const QuotationForm = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Customer Details</h2>
      <input
        type="text"
        placeholder="Customer Name"
        value={formData.customerName}
        onChange={(e) => updateFormData("customerName", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Contact Person"
        value={formData.contactPerson}
        onChange={(e) => updateFormData("contactPerson", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      {/* Add email, phone, address same way */}
    </div>
  );
};

export default QuotationForm;
