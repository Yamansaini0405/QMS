"use client"

import { useEffect, useState } from "react"
import { UserCog, Plus, Search, Filter, Download, Trash2 } from "lucide-react"

export default function ViewMembers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("https://qms-2h5c.onrender.com/accounts/api/users/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }) // <-- your backend API endpoint
      if (!res.ok) throw new Error("Failed to fetch members")
      const data = await res.json()
      setMembers(data.data)
    } catch (error) {
      console.error("Error fetching members:", error)
      alert("Error loading members.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleDeleteMember = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      try {
        // Simulate API call
        console.log("[v0] Deleting member:", memberId)

        // Remove member from local state
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId))

        alert("Member deleted successfully!")
      } catch (error) {
        console.log("[v0] Error deleting member:", error)
        alert("Error deleting member. Please try again.")
      }
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      // member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || member.status === statusFilter
    const matchesRole = roleFilter === "All Roles" || member.role === roleFilter
    const matchesDepartment = departmentFilter === "All Departments" || member.department === departmentFilter

    return matchesSearch && matchesStatus && matchesRole && matchesDepartment
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>All Roles</option>
            <option>ADMIN</option>
            <option>SALESPERSON</option>
          </select>

  
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </p>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
            Export All ({members.length})
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                 <th className="text-left py-3 px-6 font-medium text-gray-900">SNo.</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Member</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Phone No.</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                
                <th className="text-left py-3 px-6 font-medium text-gray-900">Created</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900">{index + 1}</td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.fullName}
                      </div>
                      <div className="text-sm text-black font-bold">{member.username}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === "SALESPERSON" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{member.phone_number}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.is_active? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-gray-900">{member.date_joined.split("T")[0]}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Member"
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
