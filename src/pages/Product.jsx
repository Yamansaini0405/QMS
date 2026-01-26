"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import {
  Package,
  CheckCircle,
  Grid3X3,
  IndianRupee,
  TrendingUp,
  Star,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import ProductViewModal from "../components/ProductViewModel"
import ProductEditModal from "../components/ProductEditModel"
import * as XLSX from "xlsx"
import { fetchUserPermissions, getUserPermissions } from "@/utils/permissions"



export default function Products() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState([])   // store category list
  const [categoryFilter, setCategoryFilter] = useState("All Categories")  // store selected value

  const [statusFilter, setStatusFilter] = useState("All Status")
  const [products, setProducts] = useState([]) // ✅ real data here
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  const permission = getUserPermissions();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token") // 👈 ensure token exists
  const res = await fetch(`${baseUrl}/quotations/api/products/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch products")

        const data = await res.json()
        

        setProducts(data.data) 
        await fetchUserPermissions();
      } catch (err) {
        console.error(err)
        setError("Could not load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [editModalOpen])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token")
  const res = await fetch(`${baseUrl}/quotations/api/categories/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch categories")

        const data = await res.json()
        setCategories(data)   // ✅ update categories list
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [])

  const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        })
    }



  const totalProducts = products.length

  const activeProducts = products.filter((p) => p.active).length

  const uniqueCategories = [...new Set(products.map((p) => p.category))].length

  const avgPrice = products.reduce((sum, p) => sum + Number(p.selling_price || 0), 0) / (products.length || 1)

  // Monthly sales calculation
  // const monthlySales = products.reduce((acc, p) => {
  //   const date = new Date(p.created_at)
  //   const month = date.toLocaleString("default", { month: "short", year: "numeric" }) // e.g., "Aug 2025"
  //   if (!acc[month]) acc[month] = 0
  //   acc[month] += Number(p.selling_price || 0)
  //   return acc
  // }, {})
  // const totalMonthlySales = Object.values(monthlySales).reduce((sum, val) => sum + val, 0)

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Grid3X3,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Categories",
      value: uniqueCategories,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Avg. Price",
      value: avgPrice.toFixed(2),
      icon: IndianRupee,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    // {
    //   title: "Monthly Sales",
    //   value: totalMonthlySales.toFixed(2),
    //   icon: TrendingUp,
    //   color: "text-pink-500",
    //   bgColor: "bg-pink-100",
    // },
  ]

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0
    const valueA = a[sortConfig.key] ?? ""
    const valueB = b[sortConfig.key] ?? ""
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const filteredProducts = sortedProducts.filter((product) => {
    // Search filter
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.selling_price).toLowerCase().includes(searchTerm.toLowerCase())
      product.unit?.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter

    // Status filter
    const matchesStatus = statusFilter === "All Status" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setViewModalOpen(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setEditModalOpen(true)
  }

  const handleSaveProduct = (updatedProduct) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
  }

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
  title: "Are you sure?",
  text: "This product will be permanently deleted!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#d33",
  cancelButtonColor: "#3085d6",
  confirmButtonText: "Yes, delete it!",
})

if (!result.isConfirmed) return
    

    try {
      Swal.fire({
      title: "Deleting...",
      text: "Please wait while we delete your Product.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
      const token = localStorage.getItem("token")

      const res = await fetch(`${baseUrl}/quotations/api/products/create/?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })


      if (!res.ok) throw new Error("Failed to delete product")

      // ✅ Remove from local state
      setProducts(products.filter((p) => p.id !== id))

      Swal.fire("Deleted!", "The product has been deleted.", "success")

    } catch (err) {
      console.error(err)
      Swal.fire("Error!", "Failed to delete product. Please try again.", "error")

    }
  }

  const handleExportExcel = () => {
    if (!products.length) {
      Swal.fire("No Product to export", "Please add product to export", "warning")
      return
    }

    // Map only selected fields instead of entire raw object
    const exportData = products.map((p, index) => ({
      "S.No.": index + 1,
      Name: p.name,
      Description: p.description,
      Category: p.category,
      "Cost Price": p.cost_price,
      "Selling Price": p.selling_price,
      Unit: p.unit,
      warrenty: p.warranty_months + " months",
      Status: p.active ? "Active" : "Inactive",
      "Created At": p.created_at ? p.created_at.split("T")[0] : "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products")

    XLSX.writeFile(workbook, "products.xlsx")
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Products Catalog</h1>
              <p className="text-sm md:text-md text-gray-600">Manage your product inventory</p>
            </div>
          </div>
        </div>
       
        <Link to="/products/create">
        <button className="flex items-center md:space-x-2 px-2 py-1 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          <span className="text-lg">+</span>
          <span>New Product</span>
        </button>
        </Link>

       
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Filters & Search</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>




            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={handleExportExcel}>
              <Download className="w-4 h-4" />
              <span>Export All {filteredProducts.length}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">Showing 6 of 6 products</p>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">S.No.</th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Product <SortIcon column="name" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  Category <SortIcon column="category" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("selling_price")}
                >
                  Price <SortIcon column="selling_price" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("unit")}
                >
                  Unit <SortIcon column="unit" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("active")}
                >
                  Status <SortIcon column="active" />
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  Created <SortIcon column="created_at" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-medium`}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.category === "services"
                        ? "bg-blue-100 text-blue-800"
                        : product.category === "support"
                          ? "bg-purple-100 text-purple-800"
                          : product.category === "hardware"
                            ? "bg-blue-100 text-blue-800"
                            : product.category === "consulting"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">{product.selling_price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{product.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === "Active" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{formatDate(product.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="View product details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {permission?.product?.includes("edit") && <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>}
                      {permission?.product?.includes("delete") && <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No Products found</p>
          </div>
        )}
      </div>
      <ProductViewModal product={selectedProduct} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <ProductEditModal
        product={selectedProduct}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
