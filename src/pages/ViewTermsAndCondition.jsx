"use client"

import { useState, useEffect } from "react"
import { FileText, Calendar, User, Eye, Edit, Trash2, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import TermViewModal from "../components/TermViewModal"
import TermEditModal from "../components/TermEditModal"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"


export default function ViewTermsAndCondition() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  useEffect(() => {
    const fetchTerms = async () => {
      try {

        console.log("[v0] Fetching terms and conditions...")
        const response = await fetch(`https://api.nkprosales.com/quotations/api/terms/`)
        if (!response.ok) throw new Error("Failed to fetch terms")
        const data = await response.json()
        console.log("[v0] Fetched terms:", data)
        setTerms(data)
      } catch (error) {
        console.error("❌ Error fetching terms:", error)
        alert("Error fetching terms. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchTerms()
  }, [])

  const filteredTerms = terms.filter(
    (term) =>
      term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

 const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    )
  }  

  const sortedTerms = [...filteredTerms].sort((a, b) => {
    if (!sortConfig.key) return 0
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]

    if (sortConfig.key === "created_at") {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else {
      aVal = aVal ?? ""
      bVal = bVal ?? ""
      if (typeof aVal === "string") aVal = aVal.toLowerCase()
      if (typeof bVal === "string") bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const handleViewTerm = (term) => {
    console.log("[v0] Opening view modal for term:", term.title)
    setSelectedTerm(term)
    setViewModalOpen(true)
  }

  const handleEditTerm = (term) => {
    console.log("[v0] Opening edit modal for term:", term.title)
    setSelectedTerm(term)
    setEditModalOpen(true)
  }

  const handleDeleteTerm = async (termId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    })

    if (result.isConfirmed) {
      try {

        Swal.fire({
      title: "Deleting...",
      text: "Please wait while we delete your Terms & Conditions.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

        console.log("[v0] Deleting term:", termId)

        const token = localStorage.getItem("token")
        const res = await fetch(
          `https://api.nkprosales.com/quotations/api/terms/${termId}/delete/`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        )

        if (!res.ok) {
          throw new Error("Failed to delete term")
        }


        setTerms((prev) => prev.filter((term) => term.id !== termId))

        Swal.fire("Deleted!", "The term has been deleted.", "success")
      } catch (error) {
        console.error("❌ Error deleting term:", error)
        Swal.fire("Error!", "Failed to delete the term. Please try again.", "error")
      }
    }
  }

  const handleSaveTerm = (updatedTerm) => {
    console.log("[v0] Saving term:", updatedTerm.title)
    setTerms((prev) => prev.map((term) => (term.id === updatedTerm.id ? updatedTerm : term)))
    setEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms and conditions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Terms & Conditions</h1>
              <p className="text-gray-600">Manage your terms and conditions</p>
            </div>
          </div>
        </div>
        <Link to="/terms/create">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <span className="text-lg">+</span>
            <span>New Terms</span>
          </button></Link>
      </div>

      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                placeholder="Search terms and conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left  font-semibold text-gray-900">S.No.</th>
                <th
                  onClick={() => handleSort("title")}
                  className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Title <SortIcon column="title" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("created_by")}
                  className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Created By <SortIcon column="created_by" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Created at <SortIcon column="created_at" />
                  </span>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTerms.map((term, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{term.title}</p>
                        <p className="text-sm text-gray-500">
                          {(term?.content_html || "")
                            .split("*")
                            .map(s => s.trim())
                            .filter(Boolean).length} points
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{term.created_by}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(term.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTerm(term)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                        title="View Terms"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditTerm(term)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit Terms"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete Terms"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TermViewModal term={selectedTerm} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} />

      <TermEditModal
        term={selectedTerm}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveTerm}
      />
    </div>
  )
}