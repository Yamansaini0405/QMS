"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mail, MapPin, User, FileText, Calendar, Plus, Trash2, AlertCircle, ChevronDown } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

const baseUrl = import.meta.env.VITE_BASE_URL
const STATUS_OPTIONS = ["NEW", "PENDING", "QUALIFIED", "LOST", "CONVERTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function LeadDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [lead, setLead] = useState(null)
    const [descriptions, setDescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [addingDescription, setAddingDescription] = useState(false)
    const [formData, setFormData] = useState({ description: "", next_date: "" })


    useEffect(() => {
        console.log("Fetching details for lead ID:", id)
        const fetchLeadDetails = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) throw new Error("Failed to fetch lead")
                const data = await res.json()
                setLead(data.data)
            } catch (error) {
                console.error("Error fetching lead:", error)
                Swal.fire("Error", "Failed to load lead details", "error")
            } finally {
                setLoading(false)
            }
        }

        const fetchDescriptions = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/descriptions/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) throw new Error("Failed to fetch descriptions")
                const data = await res.json()
                setDescriptions(Array.isArray(data.descriptions) ? data.descriptions : data.data || [])
            } catch (error) {
                console.error("Error fetching descriptions:", error)
            }
        }

        if (id) {
            fetchLeadDetails()
            fetchDescriptions()
        }
    }, [id])

    const handleAddDescription = async (e) => {
        e.preventDefault()

        if (!formData.description.trim()) {
            Swal.fire("Warning", "Description cannot be empty", "warning")
            return
        }

        if (!formData.next_date) {
            Swal.fire("Warning", "Please select a follow-up date", "warning")
            return
        }

        setAddingDescription(true)

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/descriptions/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description: formData.description,
                    next_date: formData.next_date,
                }),
            })

            if (!res.ok) throw new Error("Failed to add description")

            const newDescription = await res.json()
            setDescriptions([newDescription, ...descriptions])
            setFormData({ description: "", next_date: "" })

            Swal.fire("Success", "Description added successfully", "success")
        } catch (error) {
            console.error("Error adding description:", error)
            Swal.fire("Error", "Failed to add description", "error")
        } finally {
            setAddingDescription(false)
        }
    }

    const handleDeleteDescription = async (descriptionId) => {
        Swal.fire({
            title: "Delete Description?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token")
                    const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/descriptions/${descriptionId}/`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if (!res.ok) throw new Error("Failed to delete description")

                    setDescriptions(descriptions.filter((d) => d.id !== descriptionId))
                    Swal.fire("Deleted", "Description removed successfully", "success")
                } catch (error) {
                    console.error("Error deleting description:", error)
                    Swal.fire("Error", "Failed to delete description", "error")
                }
            }
        })
    }

    const getStatusColor = (status) => {
        const colors = {
            PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100" },
            QUALIFIED: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100" },
            NEW: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100" },
            LOST: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100" },
        }
        return colors[status] || { bg: "bg-gray-50", text: "text-gray-700", badge: "bg-gray-100" }
    }

    const getPriorityColor = (priority) => {
        const colors = {
            HIGH: { badge: "bg-red-100", text: "text-red-700" },
            MEDIUM: { badge: "bg-orange-100", text: "text-orange-700" },
            LOW: { badge: "bg-green-100", text: "text-green-700" },
        }
        return colors[priority] || { badge: "bg-gray-100", text: "text-gray-700" }
    }

    const handleUpdateLead = async (updatePayload) => {
        const { status, priority } = updatePayload;

        try {
            Swal.fire({
                title: "Updating Lead...",
                text: "Please wait while we update the lead details.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const token = localStorage.getItem("token");
            const res = await fetch(`${baseUrl}/accounts/api/leads/${id}/status/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: status !== undefined ? status : lead.status, // Use new value or existing
                    priority: priority !== undefined ? priority : lead.priority, // Use new value or existing
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update lead on server");
            }

            setLead((prevLead) => ({
                ...prevLead,
                status: status !== undefined ? status : prevLead.status,
                priority: priority !== undefined ? priority : prevLead.priority,
            }));
            Swal.fire("Updated!", "The lead has been successfully updated.", "success");
        } catch (err) {
            console.error("Error updating lead:", err);
            Swal.fire("Error!", "Failed to update lead. Please try again.", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading lead details...</p>
                </div>
            </div>
        )
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold mb-2">Lead not found</p>
                    <button onClick={() => navigate(-1)} className="text-orange-600 hover:text-orange-700 font-medium">
                        Go back
                    </button>
                </div>
            </div>
        )
    }

    const statusColors = getStatusColor(lead.status)
    const priorityColors = getPriorityColor(lead.priority)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 ">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Leads</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lead.customer?.name || "Lead"}</h1>
                            <p className="text-gray-600 mt-1">{lead.customer?.company_name}</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="space-y-4">
                                {lead.assigned_to && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                                        <p className="text-gray-900 font-medium">{lead.assigned_to.name}</p>
                                        <p className="text-xs text-gray-500">{lead.assigned_to.email}</p>
                                    </div>
                                )}

                            </div>
                            <div className="hidden md:block">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors.badge} ${statusColors.text}`}
                                >
                                    {lead.status}
                                </span>
                                {lead.priority && (
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors.badge} ${priorityColors.text}`}
                                    >
                                        {lead.priority}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Lead Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <User className="w-5 h-5 text-orange-600" />
                                <span>Customer Details</span>
                            </h3>
                            <div className="space-y-4">
                                {lead.customer?.phone && (
                                    <div className="flex items-start space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="text-gray-900 font-medium">{lead.customer.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.customer?.email && (
                                    <div className="flex items-start space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="text-gray-900 font-medium break-all">{lead.customer.email}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.customer?.primary_address && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600">Address</p>
                                            <p className="text-gray-900 font-medium text-sm">{lead.customer.primary_address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lead Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                <span>Lead Information</span>
                            </h3>
                            <div className=" space-y-4">
                                <div className="flex items-center justify-start gap-12">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        
                                        {/* 🆕 Status Dropdown */}
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleUpdateLead({ status: e.target.value })}
                                            className={` inline-block px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${statusColors.badge} ${statusColors.text} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                                        >
                                            {STATUS_OPTIONS.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {lead.priority && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Priority</p>
                                            {/* 🆕 Priority Dropdown */}
                                            <select
                                                value={lead.priority}
                                                onChange={(e) => handleUpdateLead({ priority: e.target.value })}
                                                className={`inline-block px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${priorityColors.badge} ${priorityColors.text} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                                            >
                                                {PRIORITY_OPTIONS.map((priority) => (
                                                    <option key={priority} value={priority}>
                                                        {priority}
                                                    </option>
                                                ))}
                                                
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-start gap-12">
                                    {lead.follow_up_date && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Follow-up Date</p>
                                            <p className="text-gray-900 font-medium">{new Date(lead.follow_up_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {lead.source && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Source</p>
                                            <p className="text-gray-900 font-medium">{lead.source}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Assignment Info Card */}
                        {(lead.assigned_to || lead.created_by) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <User className="w-5 h-5 text-orange-600" />
                                    <span>Team</span>
                                </h3>
                                <div className="space-y-4">
                                    {lead.assigned_to && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                                            <p className="text-gray-900 font-medium">{lead.assigned_to.name}</p>
                                            <p className="text-xs text-gray-500">{lead.assigned_to.email}</p>
                                        </div>
                                    )}
                                    {lead.created_by && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Created By</p>
                                            <p className="text-gray-900 font-medium">{lead.created_by.name}</p>
                                            <p className="text-xs text-gray-500">{lead.created_by.role}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Content - Descriptions */}
                    <div className="lg:col-span-2">
                        {/* Add Description Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Plus className="w-5 h-5 text-orange-600" />
                                <span>Add Description</span>
                            </h3>
                            <form onSubmit={handleAddDescription} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter your description..."
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-up Date</label>
                                    <input
                                        type="date"
                                        value={formData.next_date}
                                        onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingDescription}
                                    className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {addingDescription ? "Adding..." : "Add Description"}
                                </button>
                            </form>
                        </div>

                        {/* Descriptions List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <span>Description History</span>
                                <span className="text-sm font-normal text-gray-600 ml-auto">{descriptions.length} entries</span>
                            </h3>

                            {descriptions.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No descriptions yet</p>
                                    <p className="text-sm text-gray-500">Add a description to track lead progress</p>
                                </div>
                            ) : (
                                descriptions.map((desc) => (
                                    <div key={desc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(desc.created_at).toLocaleDateString()}{" "}
                                                        {new Date(desc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                                {desc.next_date && (
                                                    <p className="text-sm font-medium text-orange-600">
                                                        Follow-up: {new Date(desc.next_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            {/* <button
                                                onClick={() => handleDeleteDescription(desc.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button> */}
                                        </div>
                                        <p className="text-gray-900 leading-relaxed">{desc.description || desc.discription}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
