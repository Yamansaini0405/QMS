import { QuotationProvider, useQuotation } from "../contexts/QuotationContext";
import CustomerInfoForm from "../components/NewQuotationPageComponents/CustomerInfoForm";
import ProductTable from "../components/NewQuotationPageComponents/ProductTable";
import QuotationSummary from "../components/NewQuotationPageComponents/QuotationSummary";
import TermsAndConditionsSelector from "../components/NewQuotationPageComponents/TermsAndConditionsSelector";
import AdditionalSettings from "../components/NewQuotationPageComponents/AdditionalSettings";
import CreatorInfo from "../components/NewQuotationPageComponents/CreatorInfo";
import QuickActionsSidebar from "../components/NewQuotationPageComponents/QuickActionsSidebar";
import BottomActions from "../components/NewQuotationPageComponents/BottomActions";
import QuotationTemplate from "../components/QuotationTemplate";
import { FileText, Eye, Send, EyeOff } from "lucide-react";
import { useLocation } from "react-router-dom";


function NewQuotationPageContent() {
  const { id, showPreview, formData, setShowPreview, downloadPDF, isGeneratingPDF, createQuotation, availableTerms, pageLoading } = useQuotation();
  const location = useLocation();
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>

              <h1 className="text-2xl font-semibold text-gray-900">{id ? "Edit" : "New"} Quotation</h1>
              <p className="text-gray-600">Create a new quotation for your customer</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
            </button>
            {/* <button
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF</span>
          </button> */}
            {id ? location.pathname.startsWith("/quotations/edit") ?
              <button
                onClick={createQuotation}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isGeneratingPDF ? "Updating..." : `Update & ${formData.send_immediately? "& Send" : ""}`}</span>
              </button> :
              <button
                onClick={createQuotation}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isGeneratingPDF ? "Duplicating..." : `Duplicate ${formData.send_immediately? "& Send" : ""}`}</span>
              </button>

              : <button
                onClick={createQuotation}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isGeneratingPDF ? "Creating..." : `Create ${formData.send_immediately? "& Send" : ""}`}</span>
              </button>}



          </div>
        </div>
        <div className="hidden">
          <QuotationTemplate formData={formData} availableTerms={availableTerms} />
        </div>
        {showPreview ? (
          <QuotationTemplate formData={formData} availableTerms={availableTerms} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CustomerInfoForm />
                <ProductTable />
                <QuotationSummary />
                <TermsAndConditionsSelector />
                <AdditionalSettings />
                <CreatorInfo />
              </div>
              <QuickActionsSidebar />
            </div>
            <BottomActions />
          </>
        )}
      </div>
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <QuotationProvider>
      <NewQuotationPageContent />
    </QuotationProvider>
  );
}