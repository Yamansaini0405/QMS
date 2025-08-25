import { FileText, Clock, Target, TrendingUp, Download, Plus, Eye, Edit, MoreHorizontal } from "lucide-react"

const Dashboard = () => {
  const stats = [
    {
      title: "Total Quotations",
      value: "3",
      subtitle: "0 this month",
      icon: FileText,
      color: "border-l-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Quotations",
      value: "1",
      subtitle: "Awaiting customer response",
      icon: Clock,
      color: "border-l-amber-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Total Revenue",
      value: "Rs. 885.00",
      subtitle: "From accepted quotations",
      icon: TrendingUp,
      color: "border-l-emerald-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Active Leads",
      value: "3",
      subtitle: "5 customers total",
      icon: Target,
      color: "border-l-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ]

  const recentQuotations = [
    {
      id: "QT-NK-0001",
      company: "Acme Corporation",
      date: "15/01/2024",
      amount: "Rs. 2950.00",
      status: "pending",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "QT-NK-0002",
      company: "Tech Solutions Ltd",
      date: "20/01/2024",
      amount: "Rs. 885.00",
      status: "accepted",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "QT-NK-0003",
      company: "StartupCo",
      date: "10/01/2024",
      amount: "Rs. 590.00",
      status: "rejected",
      statusColor: "bg-red-100 text-red-800",
    },
  ]

  const recentLeads = [
    {
      name: "John Smith",
      source: "website",
      date: "15/01/2024",
      value: "Rs. 50000.00",
      status: "qualified",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      name: "Sarah Johnson",
      source: "referral",
      date: "20/01/2024",
      value: "Rs. 25000.00",
      status: "new",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      name: "Mike Wilson",
      source: "quotation",
      date: "10/01/2024",
      value: "Rs. 75000.00",
      status: "proposal",
      statusColor: "bg-gray-100 text-gray-800",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border-l-4 ${stat.color} p-6 hover:shadow-md transition-shadow duration-200`}
          >
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
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                  <span>New Quotation</span>
                </button>
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
                      <h3 className="font-semibold text-gray-900">{quotation.id}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${quotation.statusColor}`}>
                        {quotation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{quotation.company}</p>
                    <p className="text-xs text-gray-500">{quotation.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-2">{quotation.amount}</p>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
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
                <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                  <span>New Lead</span>
                </button>
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
                      <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{lead.source}</p>
                    <p className="text-xs text-gray-500">{lead.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-2">{lead.value}</p>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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
