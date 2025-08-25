

import { useState } from "react"
import { ArrowLeft, FileText, Plus, Trash2, Save, Eye, Copy, Download } from "lucide-react"

export default function AddTermsConditions() {
  const [formData, setFormData] = useState({
    title: "",
    points: [""],
  })

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
  try {
    // Convert points array into comma-separated string
    const contentHtml = formData.points
      .map((point) => `*${point}*`) // wrap each with *
      .join(" "); // separate with space

    const formattedData = {
      title: formData.title,
      content_html: contentHtml,
    }

    console.log("[v0] Sending terms and conditions:", formattedData)

    // Send to API
    const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/terms/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify(formattedData),
    })

    if (!response.ok) {
      throw new Error("Failed to save terms and conditions")
    }

    const result = await response.json()
    console.log("✅ Saved successfully:", result)
    alert("Terms and Conditions saved successfully!")
    setFormData({ title: "", points: [""] })
  } catch (error) {
    console.error("[v0] Error saving terms:", error)
    alert("Error saving terms and conditions")
  }
}


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
          <button
            onClick={handleSaveTerms}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Terms
          </button>
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
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
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
        </div>

        {/* Right Column - Summary & Actions */}
       
      </div>
    </div>
  )
}
