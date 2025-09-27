"use client"

import { useState } from "react"
import { UserCog, Phone, Lock } from "lucide-react"
import Swal from "sweetalert2"


export default function CreateMember() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    role: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // ----- Validation -----
  const validateField = (name, value, all = formData) => {
    let message = ""

    switch (name) {
      case "first_name":
        if (!value.trim()) message = "First name is required"
        break
      case "last_name":
        if (!value.trim()) message = "Last name is required"
        break
      case "username":
        if (!value.trim()) message = "Username is required"
        break
      case "email":
        if (!value.trim()) message = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(value)) message = "Invalid email address"
        break
      case "role":
        if (!value) message = "Role is required"
        break
      case "phone": {
        const digits = value.replace(/\D/g, "")
        if (!digits) {
          message = "Phone number is required"
        } else if (digits.length !== 10) {
          message = "Phone must be exactly 10 digits"
        } else if (!/^[6-9]/.test(digits)) {
          message = "Phone number must start with 6, 7, 8, or 9"
        }
        break
      }
      case "password":
        if (!value) message = "Password is required"
        else if (value.length < 6) message = "Password must be at least 6 characters"
        break
      case "confirmPassword":
        if (value !== all.password) message = "Passwords do not match"
        break
      default:
        break
    }
    return message
  }

  const validateForm = (all = formData) => {
    const fields = Object.keys(all)
    const newErrors = {}
    fields.forEach((key) => {
      const msg = validateField(key, all[key], all)
      if (msg) newErrors[key] = msg
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ----- Handlers -----
  const handleInputChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    // normalize specific fields
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10) // digits only, max 10
    }

    const nextForm = { ...formData, [name]: value }
    setFormData(nextForm)

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const msg = validateField(name, value, nextForm)
    setErrors((prev) => ({ ...prev, [name]: msg }))

    if (name === "password" && touched.confirmPassword) {
      const cpMsg = validateField("confirmPassword", nextForm.confirmPassword, nextForm)
      setErrors((prev) => ({ ...prev, confirmPassword: cpMsg }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }))
    }
    const msg = validateField(name, formData[name], formData)
    setErrors((prev) => ({ ...prev, [name]: msg }))
  }

  const handleSaveMember = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors).find(Boolean)
      Swal.fire("Validation Error", firstError, "warning")
      return
    }


    const payload = {
      address: formData.address,
      confirmPassword: formData.confirmPassword.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      password: formData.password.trim(),
      role: formData.role.trim(),
      username: formData.username.trim(),
      phone: formData.phone,
    }
    console.log(payload)
    setIsLoading(true)
    try {

      Swal.fire({
        title: "Saving...",
        text: "Please wait while we save your Member.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await fetch("https://api.nkprosales.com/accounts/api/admin/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save member")

      const data = await response.json()
      console.log("API Response:", data)
      Swal.fire("Saved!", "The member has been saved.", "success")


      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        role: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
      })
      setErrors({})
      setTouched({})
    } catch (err) {
      console.error("Error saving member:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched[field] && errors[field] ? "border-red-500" : "border-gray-300"
    }`

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">New Member</h1>
                <p className="text-sm md:text-md text-gray-600">Add a new member to your system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserCog className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter first name"
                  className={inputClass("first_name")}
                  aria-invalid={!!(touched.first_name && errors.first_name)}
                />
                {touched.first_name && errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter last name"
                  className={inputClass("last_name")}
                  aria-invalid={!!(touched.last_name && errors.last_name)}
                />
                {touched.last_name && errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter username"
                  className={inputClass("username")}
                  aria-invalid={!!(touched.username && errors.username)}
                />
                {touched.username && errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="example@company.com"
                  className={inputClass("email")}
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="9876543210"
                  className={inputClass("phone")}
                  aria-invalid={!!(touched.phone && errors.phone)}
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={inputClass("role")}
                  aria-invalid={!!(touched.role && errors.role)}
                >
                  <option value="" disabled>Select a role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SALESPERSON">Salesperson</option>
                </select>
                {touched.role && errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter password"
                  className={inputClass("password")}
                  aria-invalid={!!(touched.password && errors.password)}
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Confirm password"
                  className={inputClass("confirmPassword")}
                  aria-invalid={!!(touched.confirmPassword && errors.confirmPassword)}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter address..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={handleSaveMember}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg flex items-center justify-center text-lg gap-2 transition-colors cursor-pointer ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
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
              <UserCog className="w-4 h-4" />
              Save Member
            </>
          )}
        </button>
      </div>
    </div>
  )
}
