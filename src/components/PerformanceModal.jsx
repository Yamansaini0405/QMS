"use client"

import { useState, useEffect } from "react"
import { X, User, BarChart3, TrendingUp, Calendar, Clock, Target, Award } from "lucide-react"

export default function PerformanceModal({ isOpen, onClose, member }) {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [performanceData, setPerformanceData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && member) {
      fetchPerformanceData()
    }
  }, [isOpen, member])

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${baseUrl}/quotations/api/${member.id}/stats/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch performance data")

      const result = await response.json()
      setPerformanceData(result.data)
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateConversionRate = (closed, total) => {
    if (total === 0) return 0
    return Math.round((closed / total) * 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm  flex items-center justify-center z-50 p-4"
    onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
              <p className="text-gray-600">{member?.fullName || member?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading performance data...</span>
            </div>
          ) : performanceData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Quotations</p>
                      <p className="text-2xl font-bold text-blue-900">{performanceData.total_quotations_created}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Leads</p>
                      <p className="text-2xl font-bold text-green-900">{performanceData.total_leads_created}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Sent Quotations</p>
                      <p className="text-2xl font-bold text-purple-900">{performanceData.sent_quotations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Conversion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {calculateConversionRate(performanceData.closed_leads, performanceData.total_leads_created)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quotations Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotations Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((performanceData.total_quotations_created / 20) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.total_quotations_created}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((performanceData.total_quotations_assigned / 20) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.total_quotations_assigned}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sent</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min((performanceData.sent_quotations / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.sent_quotations}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leads Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((performanceData.total_leads_created / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.total_leads_created}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Open</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${Math.min((performanceData.open_leads / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.open_leads}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Closed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min((performanceData.closed_leads / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceData.closed_leads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium text-gray-900">{performanceData.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{performanceData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date Joined</p>
                      <p className="font-medium text-gray-900">{formatDate(performanceData.date_joined)}</p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No performance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
