// src/components/ManageMemberModal.js

"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import Swal from "sweetalert2"

export default function ManageMemberModal({ isOpen, onClose, member, onMemberUpdate }) {
  if (!isOpen || !member) return null

  const baseUrl = import.meta.env.VITE_BASE_URL
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    phone_number: "",
    username: "",
    password: "", // Keep password empty by default for security
    is_active: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Pre-fill the form when the modal opens or the selected member changes
  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        address: member.address || "",
        phone_number: member.phone_number || null ,
        username: member.username || "",
        password: "", // Always start with an empty password field
        is_active: member.is_active,
      })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    // Construct payload, excluding password if it's empty
    const payload = { ...formData }
    if (!payload.password) {
      delete payload.password
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${baseUrl}/accounts/api/user/${member.id}/manage/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Failed to update member.")
      }

      const updatedMemberData = await res.json()
      
      // Notify the parent component of the successful update
      onMemberUpdate(updatedMemberData.data)

      Swal.fire("Success!", "Member details updated successfully.", "success")
      onClose() // Close modal on success
    } catch (error) {
      Swal.fire("Error!", error.message, "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Manage Member - {member.username}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {/* Form Fields */}
            <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
            <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <InputField label="New Password" name="password" type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} />
            
            <div className="flex items-center space-x-3 mt-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="is_active" className="font-medium text-gray-700">
                Account Active
              </label>
            </div>
          </div>
          <div className="p-6 flex justify-end space-x-3 bg-gray-50 border-t rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-700">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper component for form inputs to reduce repetition
const InputField = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={props.name}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      {...props}
    />
  </div>
)