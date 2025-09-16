import { FileText, Clock, Target, TrendingUp, Download, Plus, Eye, Edit, MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import {Link} from "react-router-dom"
import DashboardSkeleton from "@/components/DashboardSkeleton"

const Dashboard = () => {

  const [quotations, setQuotations] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        // fetch quotations
        const qRes = await fetch("https://qms-2h5c.onrender.com/quotations/api/quotations/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const qData = await qRes.json()
        setQuotations(qData.data || qData)


        // fetch leads
        const lRes = await fetch("https://qms-2h5c.onrender.com/quotations/api/leads/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const lData = await lRes.json()
        setLeads(lData.data || lData)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  console.log(quotations)
  console.log(leads)
   const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter(q => q.status?.toLowerCase() === "pending" || q.status?.toLowerCase() ===  "sent").length
  const totalRevenue = quotations
    .filter(q => q.status?.toLowerCase() === "accepted")
    .reduce((sum, q) => sum + (Number(q.total) || 0), 0)
  const activeLeads = leads.filter(l => l.status?.toLowerCase() !== "closed").length

  const stats = [
    {
      title: "Total Quotations",
      value: totalQuotations,
      subtitle: `${quotations.filter(q => new Date(q.created_at).getMonth() === new Date().getMonth()).length} this month`,
      icon: FileText,
      color: "border-l-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      url:"/quotations"
    },
    {
      title: "Pending Quotations",
      value: pendingQuotations,
      subtitle: "Awaiting customer response",
      icon: Clock,
      color: "border-l-amber-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      url:"/quotations"
    },
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue.toFixed(2)}`,
      subtitle: "From accepted quotations",
      icon: TrendingUp,
      color: "border-l-emerald-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      url:"/dashboard"
    },
    {
      title: "Active Leads",
      value: activeLeads,
      subtitle: `${leads.length} customers total`,
      icon: Target,
      color: "border-l-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      url:"/leads"
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

      {/* Recent Quotations and Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Quotations</h2>
              <div className="flex items-center space-x-3">
                {/* <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button> */}
                <Link to="/quotations/new">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
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
                    <div className="flex items-center justify-center space-x-2 bg-blue-700 rounded-lg w-12 ml-8 ">
                      <button className="p-1 text-white hover:text-gray-600 transition-colors duration-200 flex items-center justify-center gap-2 "
                      onClick={() => handleViewQuotation(quotation)}>
                        <Eye className="w-4 h-4" />
                        
                      </button>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Leads</h2>
              <div className="flex items-center space-x-3">
                {/* <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button> */}
                <Link to="/leads/create">
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors duration-200">
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
                    <h3 className="ftext-sm text-gray-600">{lead.customer.company_name}</h3>
                    
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
