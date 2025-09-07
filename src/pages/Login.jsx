"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, FileText, ChevronDown } from "lucide-react"

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin", // Added role field with default value
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username) {
      newErrors.username = "Username is required"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (!formData.role) {
      newErrors.role = "Role is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    console.log("username:", formData.username)
      console.log("password:", formData.password)
    try {
      const apiEndpoint =
        formData.role === "admin"
          ? "https://qms-2h5c.onrender.com/accounts/api/admin/login/"
          : "https://qms-2h5c.onrender.com/accounts/api/salesperson/login/"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Invalid username or password")
      }

      const data = await response.json()

      localStorage.setItem("token", data.tokens.access)
      localStorage.setItem("role", data.data.user.role)
      localStorage.setItem("refreshToken", data.tokens.refresh)

      // formData.role === "admin" ? navigate("/dashboard") : navigate("/salesperson")
      navigate("/dashboard")
    } catch (error) {
      setErrors({
        general: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

       

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white ${
                    errors.role ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="salesperson">Salesperson</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.username ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Submit Button with Loader */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform 
                ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700"}`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">© 2024 Quotation Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
