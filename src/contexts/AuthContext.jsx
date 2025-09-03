// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (token && role) {
      setUser({ token, role })
    }
  }, [])

  const login = ({ token, role }) => {
    localStorage.setItem("token", token)
    localStorage.setItem("role", role)
    setUser({ token, role })
  }

  const logout = async () => {
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
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
