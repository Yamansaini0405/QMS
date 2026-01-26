import { useState, useRef } from "react"
import { Plus, Loader2, Package } from "lucide-react"
import Swal from "sweetalert2"

const baseUrl = import.meta.env.VITE_BASE_URL

export default function QuickAddProductForm({ onProductAdded }) {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Ref to reset the file input
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // --- Basic Validation ---
    if (!name.trim()) {
      Swal.fire("Validation Error", "Please enter a product name.", "error")
      return
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      Swal.fire(
        "Validation Error",
        "Please enter a valid selling price.",
        "error"
      )
      return
    }

    // --- Get Token ---
    const token = localStorage.getItem("token")
    if (!token) {
      Swal.fire("Auth Error", "Could not find user token.", "error")
      return
    }

    setIsLoading(true)

    // --- Create FormData ---
    const formData = new FormData()
    formData.append("name", name)
    formData.append("selling_price", sellingPrice)
    if (image) {
      formData.append("images", image)
    }
    try {
      const response = await fetch(
        `${baseUrl}/quotations/api/products/create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create product.")
      }

      const newProduct = await response.json()

      Swal.fire("Success!", "Product added successfully.", "success")

      // --- Reset Form ---
      setName("")
      setSellingPrice("")
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" 
      }

      if (onProductAdded) {
        onProductAdded(newProduct.data)
      }

    } catch (error) {
      console.error("Error creating product:", error)
      Swal.fire("Error", error.message || "Could not add product.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 md:p-6 bg-white shadow-sm rounded-lg"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-5 h-5 text-gray-600" />
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Add Products with Image</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3 md:space-x-3">
        {/* --- Product Name Input --- */}
        <div className="flex-1">
          <label
            htmlFor="quick_product_name"
            className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
          >
            Product Name
          </label>
          <input
            type="text"
            id="quick_product_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="E.g., 'Test Product'"
            disabled={isLoading}
          />
        </div>

        {/* --- Selling Price Input --- */}
        <div className="w-full md:w-40">
          <label
            htmlFor="quick_selling_price"
            className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
          >
            Selling Price (Rs.)
          </label>
          <input
            type="number"
            id="quick_selling_price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="E.g., 1500"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>

        {/* --- Image Input --- */}
        <div className="flex-1">
          <label
            htmlFor="quick_product_image"
            className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
          >
            Product Image
          </label>
          <input
            type="file"
            id="quick_product_image"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="w-full text-xs md:text-sm text-gray-500 file:mr-2 md:file:mr-4 file:py-2 file:px-3 md:file:px-4 file:rounded-md file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*"
            disabled={isLoading}
          />
        </div>

        {/* --- Submit Button --- */}
        <div className="w-full md:flex-shrink-0 md:w-auto">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto inline-flex items-center justify-center md:justify-start px-4 py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </form>
  )
}