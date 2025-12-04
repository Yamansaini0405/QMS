"use client"

import { useState, useEffect } from "react"
import { Bell, Phone, Mail, MapPin, User, Clock, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const baseUrl = import.meta.env.VITE_BASE_URL

export default function TodaysFollowups() {
  const [followups, setFollowups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTodaysFollowups = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(`${baseUrl}/quotations/api/leads/popup/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch today's follow-ups")
        }

        const data = await res.json()

        const today = new Date().toISOString().split("T")[0]
        const todaysFollowups = (data.data || [])
        console.log(data.data)

        setFollowups(todaysFollowups)
      } catch (err) {
        console.error("Error fetching follow-ups:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysFollowups()
  }, [])

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      NEW: { bg: "bg-blue-100", text: "text-blue-800" },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
      QUALIFIED: { bg: "bg-green-100", text: "text-green-800" },
      CONVERTED: { bg: "bg-purple-100", text: "text-purple-800" },
      REVISED: { bg: "bg-orange-100", text: "text-orange-800" },
      LOST: { bg: "bg-red-100", text: "text-red-800" },
    }
    return statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" }
  }

  const getPriorityBadgeColor = (priority) => {
    const priorityColors = {
      HIGH: { bg: "bg-red-100", text: "text-red-800" },
      MEDIUM: { bg: "bg-orange-100", text: "text-orange-800" },
      LOW: { bg: "bg-green-100", text: "text-green-800" },
    }
    return priorityColors[priority] || { bg: "bg-gray-100", text: "text-gray-800" }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's follow-ups...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Today's Follow-ups</h1>
            <p className="text-sm md:text-md text-gray-600">Leads that need follow-up today</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Follow-ups Due Today</p>
            <p className="text-3xl font-bold text-gray-900">{followups.length}</p>
          </div>
          <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center">
            <Clock className="w-7 h-7 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Follow-ups List */}
      {followups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Follow-ups Today</h3>
            <p className="text-gray-600">You're all caught up! No leads require follow-up today.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {followups.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Top Row - Name, Status, Priority */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{lead.customer?.name}</h3>
                    <p className="text-sm text-gray-600">{lead.customer?.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{lead.customer?.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Assigned To</p>
                      <p className="text-sm font-medium text-gray-900">{lead.assigned_to?.name || "-"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(lead.status).bg} ${getStatusBadgeColor(lead.status).text}`}
                    >
                      {lead.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(lead.priority).bg} ${getPriorityBadgeColor(lead.priority).text}`}
                    >
                      {lead.priority}
                    </span>
                  </div>
                </div>

                {/* Contact Details Grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{lead.customer?.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Assigned To</p>
                      <p className="text-sm font-medium text-gray-900">{lead.assigned_to?.name || "-"}</p>
                    </div>
                  </div>

                </div> */}

                {/* Primary Address */}
                {lead.customer?.primary_address && (
                  <div className="flex items-start space-x-3 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Address</p>
                      <p className="text-sm text-gray-900">{lead.customer.primary_address}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {lead.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{lead.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <Link to={`/leads/view/${lead.id}`}>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
