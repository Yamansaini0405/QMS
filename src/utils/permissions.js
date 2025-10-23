// src/utils/permissions.js

let cachedPermissions = null;

// 🔹 Fetch permissions from backend
export const fetchUserPermissions = async () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Authentication token not found.");
    return {};
  }

  try {
    const response = await fetch(`${baseUrl}/accounts/api/user/my-permissions/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    

    const result = await response.json();
    const data = result?.data?.user_permissions || {};

    cachedPermissions = data;

    return data;
  } catch (err) {
    console.error("Failed to fetch permissions:", err);
    return {};
  }
};

// 🔹 Get permissions (from cache or localStorage)
export const getUserPermissions = () => {
  if (cachedPermissions) return cachedPermissions;

  const stored = localStorage.getItem("permissions");
  if (stored) {
    cachedPermissions = JSON.parse(stored);
    return cachedPermissions;
  }

  return {};
};

// 🔹 Clear permissions on logout
export const clearUserPermissions = () => {
  cachedPermissions = null;
  localStorage.removeItem("permissions");
};
