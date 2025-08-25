"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Target,
  ChevronDown,
  ChevronRight,
  Plus,
  Eye,
  UserPlus,
  Settings,
  Shield,
  ScrollText,
  PlusCircle
} from "lucide-react"

const Sidebar = () => {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({})

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      key: "quotations",
      title: "Quotations",
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { title: "Create Quotation", path: "/quotations/new", icon: Plus },
        { title: "All Quotations", path: "/quotations", icon: Eye },
      ],
    },
    {
      key: "leads",
      title: "Leads",
      icon: Target,
      hasSubmenu: true,
      subItems: [
        { title: "Create Lead", path: "/leads/create", icon: Plus },
        { title: "All Leads", path: "/leads", icon: LayoutDashboard },
      ],
    },
    {
      key: "customers",
      title: "Customers",
      icon: Users,
      hasSubmenu: true,
      subItems: [
        
        { title: "Create Customer", path: "/customers/create", icon: UserPlus },
        { title: "View Customers", path: "/customers", icon: Eye },
      ],
    },
    {
      key: "products",
      title: "Products",
      icon: Package,
      hasSubmenu: true,
      subItems: [
        { title: "Add Product", path: "/products/create", icon: Plus },
        { title: "View Products", path: "/products", icon: Eye },
      ],
    },
    {
      key: "members",
      title: "Members",
      icon: Shield,
      hasSubmenu: true,
      subItems: [
        { title: "Create Member", path: "/members/create", icon: UserPlus },
        { title: "View Members", path: "/members", icon: Eye },
      ],
    },
    {
      key: "terms",
      title: "Terms",
      icon: ScrollText,
      hasSubmenu: true,
      subItems: [
        { title: "Create Terms", path: "/terms/create", icon: Plus },
        { title: "View Terms", path: "/terms", icon: Eye },
      ],
    }
  ]

  return (
    <div className="w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4.5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">QMS</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <div key={item.key}>
            {item.hasSubmenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.key)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {expandedMenus[item.key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {expandedMenus[item.key] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                          isActive(subItem.path)
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Quick Links */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
