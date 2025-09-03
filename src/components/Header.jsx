
import { Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()

 const handleLogout = async () => {
    try {
      const token = localStorage.getItem("refreshToken")

      if (token) {
        await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/accounts/api/logout/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (err) {
      console.error("Logout API failed:", err)
    } finally {
      // Clear local data even if API fails
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      localStorage.removeItem("refreshToken")
    //   setUser(null)
      navigate("/login")
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management System</h1>
          <p className="text-sm text-gray-500">Comprehensive business management platform</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
