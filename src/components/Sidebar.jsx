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
  Shield,
  ScrollText,
  SaveAll,
  Menu,
  TargetIcon,
  Building2,
} from "lucide-react"


const Sidebar = ({ open, onClose }) => {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({})

  const role = localStorage.getItem("role") 

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
      roles: ["ADMIN", "SALESPERSON"], // visible to all
    },
    {
      key: "quotations",
      title: "Quotations",
      icon: FileText,
      hasSubmenu: true,
      roles: ["ADMIN", "SALESPERSON"], // visible to all
      subItems: [
        { title: "Create Quotation", path: "/quotations/new", icon: Plus },
        { title: "List of Quotations", path: "/quotations/all", icon: Menu },
        { title: "Cust. Quotations", path: "/quotations", icon: Eye },
        { title: "Company Quotations", path: "/quotations/company", icon: Building2 },       
        { title: "Draft Quotations", path: "/quotations/draft", icon: SaveAll },
        
      ],
    },
    {
      key: "leads",
      title: "Leads",
      icon: Target,
      hasSubmenu: true,
      roles: ["ADMIN","SALESPERSON"], // only salesperson
      subItems: [
        { title: "Create Lead", path: "/leads/create", icon: Plus },
        { title: "Leads", path: "/leads", icon: LayoutDashboard },
        { title: "List of Leads", path: "/leads/all", icon: Menu },
        { title: "Converted Leads", path: "/leads/converted", icon: TargetIcon },
      ],
    },
    {
      key: "customers",
      title: "Customers",
      icon: Users,
      hasSubmenu: true,
      roles: ["ADMIN", "SALESPERSON"],
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
      roles: ["ADMIN", "SALESPERSON"], // only admin
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
      roles: ["ADMIN"], // only admin
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
      roles: ["ADMIN", "SALESPERSON"], // only admin
      subItems: [
        { title: "Create Terms", path: "/terms/create", icon: Plus },
        { title: "View Terms", path: "/terms", icon: Eye },
      ],
    },
  ]

  // Responsive: show as overlay on mobile, always visible on desktop
  // Hide on mobile unless open
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:flex
        `}
        style={{ minWidth: 0 }}
      >
  {/* Logo & close button for mobile */}
  <div className="px-6 py-4.5 border-b border-gray-200 flex items-center justify-between">
        <Link to="/dashboard">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QMS</h1>
              <p className="text-sm text-gray-500">{role === "ADMIN" ? "Admin Panel" : "Salesperson Panel"}</p>
            </div>
          </div>
        </Link>
        {/* Close button for mobile */}
        <button
          className="block md:hidden ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems
          .filter((item) => item.roles.includes(role)) // ✅ role check here
          .map((item) => (
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
                    {expandedMenus[item.key] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {expandedMenus[item.key] && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                        onClick={onClose}
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
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">© 2025 QMS. All Rights Reserved.</h3>
      
      </div>
      </div>
    
    
    </>
  )
}

export default Sidebar
