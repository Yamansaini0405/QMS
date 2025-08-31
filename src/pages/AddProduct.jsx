
import { useState, useEffect } from "react"
import { Save, Package, DollarSign, FileText } from "lucide-react"

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "hardware",
    brand: "",
    is_available: true,
    active: true,
    cost_price: 100,
    selling_price: 150,
    unit: "piece",
    tax_rate: 18,
    weight: 0.00,
    dimensions: "10x5x3 cm",
    warranty_months: "",   // backend expects this field
  })

  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("https://qms-2h5c.onrender.com/quotations/api/categories/", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await res.json()
        setCategories(data.data || [])
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  console.log(categories)

  const handleAddCategory = async () => {
    setIsLoading(true)
    if (!newCategory.trim()) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://qms-2h5c.onrender.com/quotations/api/categories/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory }),
      })
      if (!res.ok) throw new Error("Failed to add category")

      const data = await res.json()
      setCategories((prev) => [...prev, data]) // add new category to list
      setFormData((prev) => ({ ...prev, category: data.id })) // select it
      setNewCategory("")
      alert("Category added successfully!")
    } catch (err) {
      console.error("Error adding category:", err)
    } finally {
      setIsLoading(false)
    }
  }


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const calculateProfitMargin = () => {
    const cost = Number.parseFloat(formData.cost_price) || 0
    const selling = Number.parseFloat(formData.selling_price) || 0
    if (cost === 0) return "0.0"
    return (((selling - cost) / cost) * 100).toFixed(1)
  }

  const handleSaveProduct = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      const payload = {
        ...formData,
        cost_price: Number(formData.cost_price),
        selling_price: Number(formData.selling_price),
        tax_rate: Number(formData.tax_rate),
        weight: Number(formData.weight),
        warranty_months: formData.warranty_months
          ? Number(formData.warranty_months)
          : null,
      }

      console.log("Sending payload:", payload)

      const res = await fetch(
        "https://qms-2h5c.onrender.com/quotations/api/products/create/",
        {
          method: "POST",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) throw new Error("Failed to save product")

      const data = await res.json()
      alert("Product saved successfully!")
      console.log("Product saved:", data)
    } catch (err) {
      console.error("Error saving product:", err)
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
                <p className="text-gray-600">Add a new product to your catalog</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveProduct}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${isLoading
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
                Save Product
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed product description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* Add New Category inline */}
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Product brand"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Product is active and available for sale</label>
            </div>
          </div>

          {/* Pricing & Tax */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Tax</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="piece">piece</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="meter">meter</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin</label>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-medium text-green-600">{calculateProfitMargin()}%</span>
                  <span className="text-gray-500">profit margin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×W×H)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="10x5x3 cm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Period</label>
                <input
                  type="text"
                  name="warranty_months"
                  value={formData.warranty_months}
                  onChange={handleInputChange}
                  placeholder="e.g. 1 year, 6 months"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Product Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Category:</span>
                <span className="text-gray-900">{formData.category}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Pricing:</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost:</span>
                    <span className="text-gray-900">Rs. {formData.cost_price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Selling:</span>
                    <span className="text-green-600 font-medium">
                      Rs. {formData.selling_price} / {formData.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Margin:</span>
                    <span className="text-green-600 font-medium">{calculateProfitMargin()}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${formData.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {formData.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax Rate:</span>
                <span className="text-gray-900">{formData.tax_rate}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
