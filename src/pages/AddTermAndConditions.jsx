

import { useState } from "react"
import { ArrowLeft, FileText, Plus, Trash2, Save, Eye, Copy, Download } from "lucide-react"
import Swal from "sweetalert2"


export default function AddTermsConditions() {
  const [formData, setFormData] = useState({
    title: "",
    points: [""],
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points]
    newPoints[index] = value
    setFormData((prev) => ({
      ...prev,
      points: newPoints,
    }))
  }

  const addNewPoint = () => {
    setFormData((prev) => ({
      ...prev,
      points: [...prev.points, ""],
    }))
  }

  const removePoint = (index) => {
    if (formData.points.length > 1) {
      const newPoints = formData.points.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        points: newPoints,
      }))
    }
  }

const handleSaveTerms = async () => {
  // Validation
  if (!formData.title.trim()) {
    Swal.fire("Missing Title", "Please enter a title for Terms & Conditions.", "warning")
    return;
  }

  // Check if at least one point is non-empty
  const validPoints = formData.points.filter((p) => p.trim() !== "");
  if (validPoints.length === 0) {
    Swal.fire("Missing Points", "Please add at least one term/condition point.", "warning")
    return;
  }

  setIsLoading(true);
  try {

    Swal.fire({
      title: "Saving...",
      text: "Please wait while we save your Terms & Conditions.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    // Convert points array into comma-separated string
    const contentHtml = validPoints
      .map((point) => `*${point}*`)
      .join(" "); // separate with space

    const formattedData = {
      title: formData.title,
      content_html: contentHtml,
    };

    console.log("[v0] Sending terms and conditions:", formattedData);

    // Send to API
    const response = await fetch(
      "http://69.62.80.202/quotations/api/terms/create/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formattedData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save terms and conditions");
    }

    const result = await response.json();
    console.log("✅ Saved successfully:", result);
    Swal.fire("Saved!", "Terms and Conditions saved succesfully.", "success")

    setFormData({ title: "", points: [""] });
  } catch (error) {
    console.error("[v0] Error saving terms:", error);
    Swal.fire("Error!","Error saving terms and conditions", "error");
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
           
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">New Terms & Conditions</h1>
                <p className="text-gray-600">Create terms and conditions for your business</p>
              </div>
            </div>
          </div>
           {/* <button
            onClick={handleSaveTerms}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Terms
              </>
            )}
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Document Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Terms and Conditions for Service Agreement"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Terms & Conditions Points */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions Points</h2>
              </div>
              <button
                onClick={addNewPoint}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            </div>

            <div className="space-y-4">
              {formData.points.map((point, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      placeholder={`Enter term/condition point ${index + 1}...`}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  {formData.points.length > 1 && (
                    <button
                      onClick={() => removePoint(index)}
                      className="flex-shrink-0 w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              {formData.title ? (
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">{formData.title}</h3>
              ) : (
                <h3 className="text-xl font-semibold text-gray-400 mb-6 text-center">Terms & Conditions Title</h3>
              )}

              <div className="space-y-4">
                {formData.points.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 text-gray-600 font-medium">{index + 1}.</span>
                    <p className="text-gray-700 leading-relaxed">
                      {point || `Term/condition point ${index + 1} will appear here...`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
            onClick={handleSaveTerms}
            disabled={isLoading}
            className={`w-full py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Terms
              </>
            )}
          </button>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
       
      </div>
    </div>
  )
}
