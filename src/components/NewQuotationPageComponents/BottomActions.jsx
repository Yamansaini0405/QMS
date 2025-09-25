
import { Save, FileText, Send, SaveAll } from "lucide-react";
import { useQuotation } from "../../contexts/QuotationContext";
import { useLocation } from "react-router-dom";

export default function BottomActions() {
  const location = useLocation();
  console.log(location);

  const { id, isGeneratingPDF, createQuotation, createDraft } = useQuotation();

  return (
    <div className="w-full  space-y-2 pt-6 border-t border-gray-200">

      {id ?
        location.pathname.startsWith('/quotations/edit') ?
          <button
            onClick={createQuotation}
            disabled={isGeneratingPDF}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-md bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isGeneratingPDF ? "Updating..." : `Update & send`}</span>
          </button>
          :
          <button
            onClick={createQuotation}
            disabled={isGeneratingPDF}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-md bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isGeneratingPDF ? "Creating Duplicate..." : `Create Duplicate & send`}</span>
          </button>
        :
        <button
          onClick={createQuotation}
          disabled={isGeneratingPDF}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-md bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{isGeneratingPDF ? "Creating..." : `Create & send` }</span>
        </button>
      }
      <button
          onClick={createDraft}
          disabled={isGeneratingPDF}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-md bg-black/90 text-white rounded-md hover:bg-black disabled:opacity-50 transition-colors"
        >
          <SaveAll className="w-4 h-4" />
          <span>{isGeneratingPDF ? "Saving..." : `Save Draft` }</span>
        </button>
    </div>
  );
}