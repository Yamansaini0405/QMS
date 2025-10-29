import { useState } from "react"
import { UserCog, User, Building, MapPin, FileText, Mail, Phone, FileEdit, Calendar, BarChart3 } from "lucide-react"
import Swal from "sweetalert2"


export default function AddCustomer() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    title: "",
    phoneNumber: "",
    companyName: "",
    website: "",
    gst_number: "",
    primaryAddress: "",
    billingAddress: "",
    shippingAddress: "",
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = (name, value, all = formData) => {
    let msg = ""

    switch (name) {
      case "fullName":
        if (!value.trim()) msg = "Full name is required"
        break
      case "email":
        if (!value.trim()) msg = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(value)) msg = "Invalid email format"
        break
      case "phoneNumber": {
        const digits = value.replace(/\D/g, "")
        if (!digits) {
          msg = "Phone number is required"
        } else if (digits.length !== 10) {
          msg = "Phone must be exactly 10 digits"
        } else if (!/^[6-9]/.test(digits)) {
          msg = "Phone must start with 6, 7, 8, or 9"
        }
        break
      }
      case "companyName":
        if (!value.trim()) msg = "Company name is required"
        break
      case "primaryAddress":
        if (!value.trim()) msg = "Primary address is required"
        break
      default:
        break
    }
    return msg
  }

  const validateForm = (all = formData) => {
    const newErrors = {}
    Object.keys(all).forEach((key) => {
      const msg = validateField(key, all[key], all)
      if (msg) newErrors[key] = msg
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleInputChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === "phoneNumber") {
      value = value.replace(/\D/g, "").slice(0, 10) // only digits, max 10
    }

    const nextForm = { ...formData, [name]: value }
    setFormData(nextForm)

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }))
    }

    const msg = validateField(name, value, nextForm)
    setErrors((prev) => ({ ...prev, [name]: msg }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }))
    }
    const msg = validateField(name, formData[name], formData)
    setErrors((prev) => ({ ...prev, [name]: msg }))
  }

  const handleSaveCustomer = async () => {
    if (!validateForm()) return

    const payload = {
      name: formData.fullName.trim(),
      company_name: formData.companyName.trim(),
      email: formData.email.trim(),
      phone: formData.phoneNumber.trim(),
      title: formData.title.trim(),
      website: formData.website.trim(),
      gst_number: formData.gst_number.trim(),
      primary_address: formData.primaryAddress.trim(),
      billing_address: formData.billingAddress.trim(),
      shipping_address: formData.shippingAddress.trim(),
    }

    setIsLoading(true)
    try {

      Swal.fire({
      title: "Saving...",
      text: "Please wait while we save your Constumer.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

      const res = await fetch(`${baseUrl}/quotations/api/customers/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save customer")

      const data = await res.json()
      Swal.fire("Saved!", "The customer has been saved.", "success")


      setFormData({
        fullName: "",
        email: "",
        title: "",
        phoneNumber: "",
        companyName: "",
        website: "",
        gst_number: "",
        primaryAddress: "",
        billingAddress: "",
        shippingAddress: "",
      })
      setErrors({})
      setTouched({})
    } catch (err) {
      console.error("Error saving customer:", err)
      Swal.fire("Error!", "Failed to save customer. Please try again.", "error")

    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched[field] && errors[field] ? "border-red-500" : "border-gray-300"
    }`



  return (
    <div className="min-h-screen bg-gray-50 p-">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">New Customer</h1>
                <p className="text-sm md:text-md text-gray-600">Add a new customer to your database</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name / Contact Person *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter full name"
                  className={inputClass("fullName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title / Position</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Manager, Director"
                  className={inputClass("title")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="customer@company.com"
                  className={inputClass("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  className={inputClass("phoneNumber")}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Company Information </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter company name"
                  className={inputClass("companyName")}
                />
                {touched.companyName && errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.company.com"
                  className={inputClass("website")}
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST No.</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                  placeholder="Enter gst no."
                  className={inputClass("gst_number")}
                />
              </div>
            </div>
          </div>


          {/* Address Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Address *</label>
                <textarea
                  name="primaryAddress"
                  value={formData.primaryAddress}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter primary address..."
                  rows={3}
                  className={inputClass("primaryAddress")}
                />
                {touched.primaryAddress && errors.primaryAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.primaryAddress}</p>
            )}
              </div>

              {/* ✅ Checkbox for same address */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={formData.billingAddress === formData.primaryAddress && formData.shippingAddress === formData.primaryAddress && formData.primaryAddress !== ""}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData((prev) => ({
                        ...prev,
                        billingAddress: prev.primaryAddress,
                        shippingAddress: prev.primaryAddress,
                      }))
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        billingAddress: "",
                        shippingAddress: "",
                      }))
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="sameAddress" className="text-sm text-gray-700">
                  Billing & Shipping same as Primary Address
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                  <textarea
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter billing address (if different)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter shipping address (if different)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center">
        <button
          onClick={handleSaveCustomer}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg flex items-center justify-center text-lg gap-2 transition-colors cursor-pointer ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
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
              Create Member
            </>
          )}
        </button>
      </div>


        </div>
      </div>
    </div>
  )
}