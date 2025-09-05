"use client"

import { useState, useEffect } from "react"
import { X, FileText, Plus, Trash2, Save, AlertCircle } from "lucide-react"
import Swal from "sweetalert2"

export default function TermEditModal({ term, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    points: [""],
    status: "Active",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (term && isOpen) {
      const points = term.content_html
        .split("*")
        .map(p => p.trim())
        .filter(p => p.length > 0)
      setFormData({
        title: term.title,
        points: points.length > 0 ? points : [""],
        



      })
      setError("")
    }
  }, [term, isOpen])

  if (!isOpen || !term) return null

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

  const handleSubmit = async (termId, e) => {
    console.log(termId)
    e.preventDefault()
    setLoading(true)
    setError("")
    console.log("terms edit starts")
    try {
      // Convert points array back to content_html format
      const contentHtml = formData.points
        .filter((point) => point.trim())
        .map((point) => `*${point.trim()}*`)
        .join(" ")

      const updatedTerm = {
        ...term,
        title: formData.title,
        content_html: contentHtml,
        updated_at: new Date().toISOString(),
      }

      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/terms/${termId}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTerm),
      })

      if (!response.ok) {
        throw new Error("Failed to update terms and conditions. Please try again.")
      }

      const result = await response.json()

      // Only update local state and close modal after successful API response
      Swal.fire("Updated", "Terms and conditions updated successfully", "success")
      onSave(updatedTerm)
      onClose()
    } catch (err) {
      // Show error message and keep modal open
      setError(err.message || "An error occurred while updating the terms and conditions.")
      console.log("[v0] Terms update failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Terms & Conditions</h2>
              <p className="text-sm text-gray-600">Update terms and conditions details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(term.id, e)} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Document Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Terms and Conditions for Service Agreement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions Points</h3>
                </div>
                <button
                  type="button"
                  onClick={addNewPoint}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                    {formData.points.length > 1 && (
                      <button
                        type="button"
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

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
