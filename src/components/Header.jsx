
import { Settings, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"


const Header = () => {
  const navigate = useNavigate()
  

 const handleLogout = async () => {
    try {
      const token = localStorage.getItem("refreshToken")

      if (token) {
        await fetch("https://qms-2h5c.onrender.com/accounts/api/logout/", {
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

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "https://qms-2h5c.onrender.com/accounts/api/user/current/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 👈 send token
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        console.log("Current user:", data.data.user); // 👀 see the structure
        setUser(data.data.user.username);
        setRole(data.data.user.role)
        console.log(data.data.user.role)
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

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
              <span className="text-white font-medium text-sm">{role === "ADMIN" ? "A" : "S"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link to="/profile">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
            </Link>
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
