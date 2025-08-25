"use client"

import { useState } from "react"
import { UserCog, Plus, Search, Filter, Download, Trash2 } from "lucide-react"

export default function ViewMembers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")

  // Mock admin data
  const [admins, setAdmins] = useState([
    {
      id: 1,
      fullName: "John Smith",
      username: "john.smith",
      email: "john.smith@company.com",
      role: "SALESPERSON",
      department: "IT",
      phoneNumber: "+1 (555) 123-4567",
      status: "Active",
      createdDate: "2024-01-15",
      lastLogin: "2024-01-20",
    },
    {
      id: 2,
      fullName: "Sarah Johnson",
      username: "sarah.johnson",
      email: "sarah.johnson@company.com",
      role: "ADMIN",
      department: "Sales",
      phoneNumber: "+1 (555) 234-5678",
      status: "Active",
      createdDate: "2024-01-10",
      lastLogin: "2024-01-19",
    },
    {
      id: 3,
      fullName: "Mike Wilson",
      username: "mike.wilson",
      email: "mike.wilson@company.com",
      role: "ADMIN",
      department: "Marketing",
      phoneNumber: "+1 (555) 345-6789",
      status: "Inactive",
      createdDate: "2024-01-05",
      lastLogin: "2024-01-18",
    },
  ])

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      try {
        // Simulate API call
        console.log("[v0] Deleting admin:", adminId)

        // Remove admin from local state
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== adminId))

        alert("Admin deleted successfully!")
      } catch (error) {
        console.log("[v0] Error deleting admin:", error)
        alert("Error deleting admin. Please try again.")
      }
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || admin.status === statusFilter
    const matchesRole = roleFilter === "All Roles" || admin.role === roleFilter
    const matchesDepartment = departmentFilter === "All Departments" || admin.department === departmentFilter

    return matchesSearch && matchesStatus && matchesRole && matchesDepartment
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Members</h1>
            <p className="text-gray-600">Manage and track system members</p>
          </div>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Member
        </button>
      </div>

    

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>All Roles</option>
            <option>ADMIN</option>
            <option>SALESPERSON</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>All Departments</option>
            <option>IT</option>
            <option>Sales</option>
            <option>Marketing</option>
            <option>HR</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAdmins.length} of {admins.length} members
          </p>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
            Export All ({admins.length})
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                 <th className="text-left py-3 px-6 font-medium text-gray-900">SNo.</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Admin</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Phone No.</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                
                <th className="text-left py-3 px-6 font-medium text-gray-900">Created</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900">{index + 1}</td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{admin.fullName}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                      <div className="text-sm text-gray-500">@{admin.username}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === "SALESPERSON" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{admin.phoneNumber}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-gray-900">{admin.createdDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Admin"
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
    </div>
  )
}
