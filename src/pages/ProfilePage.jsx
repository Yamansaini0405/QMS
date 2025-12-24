"use client"

import { useState, useEffect, useRef } from "react"
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Edit3, 
  PhoneCall, Lock, Eye, EyeOff, X, Save, Upload, Trash2, FileText 
} from "lucide-react"
import Swal from "sweetalert2"

export default function ProfilePage() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const signatureApi = "https://devapi.nkprosales.com/accounts/api/signature/";
  
  // State Management
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Signature State
  const [signature, setSignature] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Form States
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  })

  // Password States
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })

  // --- API Functions ---

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch User and Signature in parallel
      const [userRes, sigRes] = await Promise.all([
        fetch(`${baseUrl}/accounts/api/user/current/`, { headers }),
        fetch(signatureApi, { headers })
      ]);

      if (userRes.ok) {
        const userDataResponse = await userRes.json();
        const user = userDataResponse.data.user;
        setUserData(user);
        setEditFormData({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address || "",
        });
      }

      if (sigRes.ok) {
        const sigData = await sigRes.json();
        setSignature(sigData.data.image_url || sigData.url || null);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); 

    setIsUploading(true);
    try {
      const response = await fetch(signatureApi, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }
      setSignature(result.data?.signature || result.url); 
      await Swal.fire("Success", "Signature updated!", "success");
      fetchData(); 
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSignature = async () => {
    const confirm = await Swal.fire({
      title: "Delete Signature?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it"
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(signatureApi, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Delete failed");

        setSignature(null);
        Swal.fire("Deleted", "Signature removed", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete signature", "error");
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${baseUrl}/accounts/api/users/${userData.id}/edit/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error("Update failed");

      await fetchData();
      setIsEditing(false);
      Swal.fire("Success", "Profile updated", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(`${baseUrl}/accounts/api/user/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      Swal.fire("Success", "Password changed", "success");
      setShowPasswordDialog(false);
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper Functions
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const getRoleColor = (role) => role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  const handleInputChange = (field, value) => setEditFormData(prev => ({ ...prev, [field]: value }));
  const togglePasswordVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-500">Manage your identity and signature</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg hover:bg-white flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                <button onClick={handleSaveProfile} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</button>
            )}
            <button onClick={() => setShowPasswordDialog(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><Lock className="w-4 h-4" /> Security</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-purple-600"/> Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "First Name", field: "first_name" },
                  { label: "Last Name", field: "last_name" }
                ].map((item) => (
                  <div key={item.field}>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</label>
                    {isEditing ? (
                      <input type="text" value={editFormData[item.field]} onChange={(e) => handleInputChange(item.field, e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    ) : (
                      <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-900 border border-transparent">{userData[item.field]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account & Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600"/> Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                  {isEditing ? (
                    <input type="email" value={editFormData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-gray-900"><Mail className="w-4 h-4 text-gray-400"/> {userData.email}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                  {isEditing ? (
                    <input type="tel" value={editFormData.phone_number} onChange={(e) => handleInputChange("phone_number", e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-gray-900"><PhoneCall className="w-4 h-4 text-gray-400"/> {userData.phone_number}</div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                {isEditing ? (
                  <textarea value={editFormData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg h-24" />
                ) : (
                  <div className="flex items-start gap-2 mt-1 text-gray-900"><MapPin className="w-4 h-4 text-gray-400 mt-1"/> {userData.address || "No address set"}</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Signature & Role */}
          <div className="space-y-6">
            
            {/* Signature Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600"/> Signature</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 min-h-[200px]">
                {signature ? (
                  <>
                    <img src={signature} alt="Signature" className="max-h-24 mb-4 object-contain bg-white p-2 rounded border" />
                    <div className="flex gap-2">
                      <button onClick={handleDeleteSignature} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-4">No signature uploaded</p>
                    <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-semibold rounded-lg hover:bg-purple-100 transition-colors">
                      {isUploading ? "Uploading..." : "Upload Now"}
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleSignatureUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            {/* Role Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4 tracking-wider">Account Role</h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getRoleColor(userData.role)}`}>
                <Shield className="w-4 h-4 mr-2" /> {userData.role}
              </div>
              <p className="text-xs text-gray-500 mt-4">Joined on {formatDate(userData.date_joined)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-purple-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button onClick={() => setShowPasswordDialog(false)}><X/></button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {["old", "new", "confirm"].map((type) => (
                <div key={type}>
                  <label className="text-sm font-medium text-gray-700 capitalize">{type.replace("_", " ")} Password</label>
                  <div className="relative mt-1">
                    <input 
                      type={showPasswords[type] ? "text" : "password"} 
                      required 
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                      value={passwordData[`${type}_password`]}
                      onChange={(e) => setPasswordData(p => ({...p, [`${type}_password`]: e.target.value}))}
                    />
                    <button type="button" onClick={() => togglePasswordVisibility(type)} className="absolute right-3 top-2.5 text-gray-400">
                      {showPasswords[type] ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
              ))}
              {passwordMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                  {passwordMessage.text}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordDialog(false)} className="flex-1 py-2 border rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={passwordLoading} className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}