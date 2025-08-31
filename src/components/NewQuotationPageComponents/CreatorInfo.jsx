import { PenTool } from "lucide-react";
import { useQuotation } from "../../contexts/QuotationContext";

export default function CreatorInfo() {
  const { formData, updateFormData } = useQuotation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PenTool className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Creator Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Created By *</label>
          <input
            value={formData.createdBy}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Digital Signature</label>
          <input
            placeholder="Enter signature or initials"
            value={formData.digitalSignature}
            onChange={(e) => updateFormData("digitalSignature", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}