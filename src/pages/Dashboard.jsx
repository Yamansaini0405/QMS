"use client"

import { FileText, Clock, Target, TrendingUp, Plus, Eye, Trophy, Users, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import DashboardSkeleton from "@/components/DashboardSkeleton"
import Swal from "sweetalert2"


const Dashboard = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [quotations, setQuotations] = useState([])
  const [leads, setLeads] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        // fetch quotations
        const qRes = await fetch(`${baseUrl}/quotations/api/quotations/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const qData = await qRes.json()
        setQuotations(qData.data || qData)

        // fetch leads
        const lRes = await fetch(`${baseUrl}/quotations/api/leads/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const lData = await lRes.json()
        setLeads(lData.data || lData)

        // fetch top performers
        const tpRes = await fetch(`${baseUrl}/quotations/stats/top-performers/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const tpData = await tpRes.json()
        setTopPerformers(tpData.data || [])

      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExportTopPerformers = () => {
    if (topPerformers.length === 0) {
      Swal.fire("Info", "No performance data to export", "info");
      return;
    }

    const escapeCSVValue = (value) => {
      const stringValue = String(value == null ? '' : value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = ["Rank", "Name", "Email", "Phone", "Quotations Sent", "Accepted", "Conversion Rate (%)"];
    let csvContent = headers.join(",") + "\n";

    topPerformers.forEach((performer, index) => {
      const row = [
        index + 1,
        performer.name,
        performer.email,
        performer.phone || "-",
        performer.total_sent,
        performer.total_accepted,
        performer.conversion_rate.toFixed(2)
      ];
      csvContent += row.map(escapeCSVValue).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Performance_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter(
    (q) => q.status?.toLowerCase() === "pending" || q.status?.toLowerCase() === "sent",
  ).length
  const totalRevenue = quotations
    .filter((q) => q.status?.toLowerCase() === "accepted")
    .reduce((sum, q) => sum + (Number(q.total) || 0), 0)
  const activeLeads = leads.filter((l) => l.status?.toLowerCase() !== "closed").length

  const stats = [
    {
      title: "Total Quotations",
      value: totalQuotations,
      subtitle: `${quotations.filter((q) => new Date(q.created_at).getMonth() === new Date().getMonth()).length} this month`,
      icon: FileText,
      color: "border-l-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      url: "/quotations",
    },
    {
      title: "Pending Quotations",
      value: pendingQuotations,
      subtitle: "Awaiting customer response",
      icon: Clock,
      color: "border-l-amber-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      url: "/quotations",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue.toFixed(2)}`,
      subtitle: "From accepted quotations",
      icon: TrendingUp,
      color: "border-l-emerald-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      url: "/dashboard",
    },
    {
      title: "Active Leads",
      value: activeLeads,
      subtitle: `${leads.length} customers total`,
      icon: Target,
      color: "border-l-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      url: "/leads",
    },
  ]

  const handleViewQuotation = (quotation) => {
    if (quotation.url) {
      window.open(quotation.url, "_blank")
    } else {
      Swal.fire("Error!", "PDF not available for this quotation.", "error")
    }
  }

  const recentQuotations = quotations.slice(-3).reverse() // last 3
  const recentLeads = leads.slice(-3).reverse()

  if (loading) return <DashboardSkeleton />

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border-l-4 ${stat.color} p-6 hover:shadow-md transition-shadow duration-200`}
          >
            <Link to={stat.url}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Top Performers section */}
      {localStorage.getItem("role") === "ADMIN" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-h-[500px] overflow-y-scroll ">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-900">Team Performance</h2>
            </div>
            <button
              onClick={handleExportTopPerformers}
              className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Sales Person</th>
                  <th className="px-6 py-3 text-center">Sent</th>
                  <th className="px-6 py-3 text-center">Accepted</th>
                  <th className="px-6 py-3">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topPerformers?.map((performer, index) => (
                  <tr key={performer.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-100 text-gray-600" :
                            index === 2 ? "bg-orange-100 text-orange-700" : "text-gray-400"
                        }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {performer.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                          <div className="text-xs text-gray-500">{performer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {performer.total_sent}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-emerald-600">
                        {performer.total_accepted}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 min-w-[120px]">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                          <div
                            className={`h-1.5 rounded-full ${performer.conversion_rate > 20 ? "bg-emerald-500" :
                                performer.conversion_rate > 10 ? "bg-yellow-500" : "bg-gray-400"
                              }`}
                            style={{ width: `${Math.min(performer.conversion_rate, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${performer.conversion_rate > 20 ? "text-emerald-600" :
                            performer.conversion_rate > 10 ? "text-yellow-600" : "text-gray-600"
                          }`}>
                          {performer.conversion_rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!topPerformers || topPerformers.length === 0) && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">No performance data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Quotations and Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-1">

                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Recent Quotations</h2>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/quotations/new">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors duration-200">
                    <Plus className="w-4 h-4" />
                    <span>New Quotation</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentQuotations.map((quotation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{quotation.quotation_number}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800`}>
                        {quotation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{quotation.customer.company_name}</p>
                    <p className="text-xs text-gray-500">{quotation.follow_up_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-2">Rs {quotation.total.toFixed(2)}</p>
                    <div className="flex items-center justify-center space-x-2 bg-purple-500 rounded-lg w-12 ml-8 ">
                      <button
                        className="p-1 text-white hover:text-gray-600 transition-colors duration-200 flex items-center justify-center gap-2 "
                        onClick={() => handleViewQuotation(quotation)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recentQuotations?.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No Recent Quotations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-1">

                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Recent Leads</h2>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/leads/create">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors duration-200">
                    <Plus className="w-4 h-4" />
                    <span>New Lead</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLeads.map((lead, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{lead.customer.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800`}>
                        {lead.status}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-600">{lead.customer.company_name}</h3>
                    <p className="text-xs text-gray-500">{lead.follow_up_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{lead.source}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-md text-gray-900">{lead.assigned_to.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recentLeads?.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No Recent Leads found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
