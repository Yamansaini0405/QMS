"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mail, MapPin, User, FileText, Calendar, Plus, AlertCircle, MessageSquare, History, Eye, Tag, IndianRupee, Notebook } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

const baseUrl = import.meta.env.VITE_BASE_URL
const STATUS_OPTIONS = ["PROSPECTIVE", "QUALIFIED", "LOST", "CONVERTED", "NEGOTIATION"];
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
                    headers: { Authorization: `Bearer ${token}` },
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
        if (!formData.description.trim() || !formData.next_date) {
            Swal.fire("Warning", "Please fill in all fields", "warning")
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
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error("Failed to add description")
            const newDescription = await res.json()
            setDescriptions([newDescription, ...descriptions])
            setFormData({ description: "", next_date: "" })
            Swal.fire("Success", "Description added successfully", "success")
        } catch (error) {
            Swal.fire("Error", "Failed to add description", "error")
        } finally {
            setAddingDescription(false)
        }
    }

    const handleUpdateLead = async (updatePayload) => {
        try {
            Swal.fire({ title: "Updating Lead...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseUrl}/accounts/api/leads/${id}/status/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: updatePayload.status || lead.status,
                    priority: updatePayload.priority || lead.priority,
                }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setLead(prev => ({ ...prev, ...updatePayload }));
            Swal.fire("Updated!", "Lead updated successfully.", "success");
        } catch (err) {
            Swal.fire("Error!", "Failed to update lead.", "error");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            QUALIFIED: "bg-green-100 text-green-700",
            PROSPECTIVE: "bg-blue-100 text-blue-700",
            LOST: "bg-red-100 text-red-700",
            NEGOTIATION: "bg-purple-100 text-purple-700",
            CONVERTED: "bg-emerald-100 text-emerald-700"
        }
        return colors[status] || "bg-gray-100 text-gray-700"
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
    )

    if (!lead) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <button onClick={() => navigate(-1)} className="text-orange-600 font-medium">Go back</button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 rounded-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-2 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Leads</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>

                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{lead.customer?.name}</h1>
                            <p className="text-sm text-gray-500">{lead.customer?.company_name}</p>
                        </div>
                        <div className=" gap-2">
                            <span className="text-sm font-semibold text-orange-500">Unique No: {lead.lead_number}</span>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                </span>
                                {lead.priority && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">
                                        {lead.priority}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Source Quotation Details */}
                        {lead.quotation && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-orange-600" />
                                    <span>Source Quotation</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quote Number</span>
                                        <span className="font-bold text-gray-900">{lead.quotation.quotation_number}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quote Date</span>
                                        <span className="text-gray-900">{new Date(lead.quotation.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-gray-400 uppercase">Products</span>
                                        <div className="mt-2 space-y-2">
                                            {lead.quotation.items?.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                                                    <span className="font-medium text-gray-800">{item.product?.name}</span>
                                                    <span className="text-gray-500">Qty: {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-600">Total Value</span>
                                        <span className="text-lg font-bold text-orange-600 flex items-center">
                                            <IndianRupee className="w-4 h-4 mr-0.5" />
                                            {lead.quotation.total?.toLocaleString()}
                                        </span>
                                    </div>
                                    {lead.quotation.pdf_url ? (
                                        <button
                                            onClick={() => window.open(lead.quotation.pdf_url, '_blank')}
                                            className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-blue-600 hover:bg-blue-50 py-2 border border-blue-100 rounded-lg transition-all"
                                        >
                                            <Eye className="w-4 h-4" /> View Original PDF
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/quotations/edit/${lead.quotation.id}`)}
                                            className="w-full text-white hover:underline bg-green-700 px-2 py-1 rounded-lg"
                                        >
                                            Create
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-600" />
                                <span>Customer Details</span>
                            </h3>
                            <div className="space-y-4">
                                {lead.customer?.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">Phone</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{lead.customer.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.customer?.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{lead.customer.email}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.customer?.primary_address && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">Address</p>
                                            <p className="text-sm font-medium text-gray-900 leading-snug">{lead.customer.primary_address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lead Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Notebook className="w-5 h-5 text-orange-600" />
                                <span>Lead Notes</span>
                            </h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-orange-200 pl-4">{lead.notes}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Manage Lead Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Lead Controls</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Change Status</label>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => handleUpdateLead({ status: e.target.value })}
                                        className="w-full text-sm font-medium border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-gray-50"
                                    >
                                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Set Priority</label>
                                    <select
                                        value={lead.priority}
                                        onChange={(e) => handleUpdateLead({ priority: e.target.value })}
                                        className="w-full text-sm font-medium border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-gray-50"
                                    >
                                        {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Add Description Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-orange-600" />
                                <span>Add New Update</span>
                            </h3>
                            <form onSubmit={handleAddDescription} className="space-y-4">
                                <div>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter progress notes..."
                                        rows="3"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all outline-none bg-gray-50"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Next Follow-up</label>
                                        <input
                                            type="date"
                                            value={formData.next_date}
                                            onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={addingDescription}
                                            className="w-full bg-orange-600 text-white font-bold text-sm py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 shadow-lg shadow-orange-200 transition-all active:scale-95"
                                        >
                                            {addingDescription ? "SAVING..." : "SAVE UPDATE"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Description History */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-gray-900 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-600" /> History</span>
                                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{descriptions.length} updates</span>
                            </h3>
                            <div className="space-y-4">
                                {descriptions.map((desc) => (
                                    <div key={desc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-hover hover:shadow-md">
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                                            <div className="flex items-center text-xs text-gray-400 gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(desc.created_at).toLocaleString()}
                                            </div>
                                            {desc.next_date && (
                                                <div className="inline-flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                                                    Next Follow-up: {new Date(desc.next_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-orange-200 pl-4">{desc.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Logs Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center gap-3">
                                <History className="w-5 h-5 text-orange-600" />
                                <h3 className="text-base font-semibold text-gray-900">Activity Logs</h3>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {lead.activity_logs?.map((log) => (
                                    <div key={log.id} className="bg-white p-4 rounded-lg border border-gray-100 text-sm shadow-sm">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
                                                {log.action?.replace("_", " ")}
                                            </span>
                                            <span className="text-[10px] text-gray-400">• {new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-600 leading-tight">{log.message}</p>
                                        </div>
                                        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                                            <User className="w-3 h-3" /> BY: {log.actor?.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}