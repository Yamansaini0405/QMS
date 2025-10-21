// src/components/GrantPermissionModal.js

"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import Swal from "sweetalert2"

// 1. Hardcoded the list of all possible system permissions
const SYSTEM_PERMISSIONS = {
  "quotation": ["edit", "delete"],
  "lead": ["edit", "delete"],
  "customer": ["edit", "delete"],
  "product": ["edit", "delete"],
  "terms": ["edit", "delete"],
};

// Helper function to make permission names more readable
const formatPermissionName = (name) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function GrantPermissionModal({ isOpen, onClose, member }) {
  if (!isOpen || !member) return null

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 2. Simplified useEffect: It now only fetches the specific user's permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!member) return;
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl}/accounts/api/salespeople/${member.id}/permissions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not fetch user's permissions.");
        
        const userPermsData = await res.json();
        const userHasPerms = userPermsData.data;

        // Create the flat state for our checkboxes
        const permissionsState = {};
        for (const category in SYSTEM_PERMISSIONS) {
          for (const action of SYSTEM_PERMISSIONS[category]) {
            const permissionName = `${action}_${category}`; // e.g., "edit_quotation"
            permissionsState[permissionName] = userHasPerms[category]?.includes(action) || false;
          }
        }
        setPermissions(permissionsState);

      } catch (error) {
        console.error("Permission fetch error:", error);
        Swal.fire("Error", error.message, "error");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, [member, baseUrl, onClose]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Transform the flat checkbox state back into the nested object the API expects
      const payload = {};
      for (const permissionName in permissions) {
        if (permissions[permissionName]) {
          const [action, category] = permissionName.split('_');
          if (!payload[category]) {
            payload[category] = [];
          }
          payload[category].push(action);
        }
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/accounts/api/salespeople/${member.id}/permissions/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update permissions.");
      }

      Swal.fire("Success!", "Permissions updated successfully.", "success");
      onClose();
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Grant Permissions for {member.username}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center p-8">Loading permissions...</div>
          ) : (
            <div className="space-y-6">
              {/* 3. Render the UI dynamically from the hardcoded SYSTEM_PERMISSIONS constant */}
              {Object.entries(SYSTEM_PERMISSIONS).map(([category, actions]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {actions.map((action) => {
                      const permissionName = `${action}_${category}`;
                      return (
                        <label key={permissionName} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            name={permissionName}
                            checked={!!permissions[permissionName]}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-700">{formatPermissionName(action)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 flex justify-end items-center bg-gray-50 border-t rounded-b-lg">
           <div className="flex space-x-3">
             <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
               Cancel
             </button>
             <button onClick={handleSave} disabled={isSaving || isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-green-700">
               {isSaving ? "Saving..." : "Save Permissions"}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}