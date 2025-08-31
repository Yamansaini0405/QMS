
import { Save, FileText, Send } from "lucide-react";
import { useQuotation } from "../../contexts/QuotationContext";

export default function BottomActions() {

  const { isGeneratingPDF, createQuotation, downloadPDF } = useQuotation();

  return (
    <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
      
      <button
        onClick={createQuotation}
        disabled={isGeneratingPDF}
        className="flex items-center space-x-2 px-6 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <Send className="w-4 h-4" />
        <span>{isGeneratingPDF ? "Creating..." : "Create & Send"}</span>
      </button>
    </div>
  );
}