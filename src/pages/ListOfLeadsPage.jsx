"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, CheckCircle, TrendingUp, Clock, AlertCircle, ChevronLeft, ChevronRight, Phone, Trash, ArrowRightLeft, X, Building, Building2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
import Swal from "sweetalert2"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { getUserPermissions } from "@/utils/permissions"

const baseUrl = import.meta.env.VITE_BASE_URL
const STATUS_OPTIONS = ["PROSPECTIVE", "QUALIFIED", "LOST", "CONVERTED", "NEGOTIATION"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

const AssignLeadModal = ({ isOpen, onClose, lead, salespersons }) => {
    if (!isOpen) return null

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSalespersonId, setSelectedSalespersonId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const filteredSalespersons = salespersons.filter((sp) =>
        sp?.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const handleConfirm = async () => {
        if (!selectedSalespersonId) {
            console.error("No salesperson ID is selected.")
            return
        }

        setIsLoading(true)

        try {
            Swal.fire({
                title: "Reassigning...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            })
            const response = await fetch(`${baseUrl}/quotations/api/leads/${lead.id}/assign/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    assigned_to_id: selectedSalespersonId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `API Error: ${response.status}`)
            }
            Swal.fire("Success!", "Lead has been reassigned.", "success")

            onClose()
            window.location.reload()
        } catch (error) {
            console.error("Failed to assign lead:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Reassign Lead</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="mb-4 text-gray-600">
                    Reassigning lead for: <span className="font-medium text-gray-800">{lead.customer?.name}</span>
                </p>
                <input
                    type="text"
                    placeholder="Search salesperson..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredSalespersons.map((sp) => (
                        <div
                            key={sp.id}
                            onClick={() => setSelectedSalespersonId(sp.id)}
                            className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedSalespersonId === sp.id ? "bg-blue-100 font-semibold" : ""
                                }`}
                        >
                            {sp.username}({sp.role})
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSalespersonId}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:bg-gray-400 hover:bg-gray-800"
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function ListOfLeadsPage() {
    const [leads, setLeads] = useState([])
    const [filteredLeads, setFilteredLeads] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [leadToReassign, setLeadToReassign] = useState(null)
    const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false)
    const [salespersons, setSalespersons] = useState([])

    const [statusFilter, setStatusFilter] = useState("ALL")
    const [priorityFilter, setPriorityFilter] = useState("ALL")

    const navigate = useNavigate();

    // --- SORTING STATE ---
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const LEADS_PER_PAGE = 30
    const baseUrl = import.meta.env.VITE_BASE_URL || ""

    const permissions = getUserPermissions();

    useEffect(() => {
        const fetchConvertedLeads = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${baseUrl}/quotations/api/leads/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                if (!response.ok) throw new Error("Failed to fetch leads")
                const data = await response.json()
                const leadsData = data.data || data
                setLeads(leadsData)
                setFilteredLeads(leadsData)
                setCurrentPage(1);
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchConvertedLeads()
    }, [])

    useEffect(() => {
        const filtered = leads.filter((lead) => {
            const searchLower = searchTerm.toLowerCase()
            const searchMatch = (
                lead.customer.name.toLowerCase().includes(searchLower) ||
                lead.customer.email.toLowerCase().includes(searchLower) ||
                lead.customer.company_name?.toLowerCase().includes(searchLower) ||
                lead.customer.phone.includes(searchTerm)
            )
            const statusMatch = statusFilter === "ALL" || lead.status === statusFilter
            const priorityMatch = priorityFilter === "ALL" || lead.priority === priorityFilter
            return searchMatch && statusMatch && priorityMatch
        })
        setFilteredLeads(filtered)
        setCurrentPage(1)
    }, [searchTerm, leads, statusFilter, priorityFilter])

    useEffect(() => {
        const fetchSalespersons = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${baseUrl}/accounts/api/users/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch salespeople")
                const data = await res.json()
                setSalespersons(data.data.filter((sp) => sp.phone_number !== null) || [])
            } catch (error) {
                console.error("❌ Error fetching salespeople:", error)
            }
        }
        fetchSalespersons()
    }, [])

    // --- SORTING LOGIC ---
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedLeads = useMemo(() => {
        let sortableLeads = [...filteredLeads];
        if (sortConfig.key !== null) {
            sortableLeads.sort((a, b) => {
                const getNestedValue = (obj, path) => {
                    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
                };

                let aValue = getNestedValue(a, sortConfig.key) || "";
                let bValue = getNestedValue(b, sortConfig.key) || "";

                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableLeads;
    }, [filteredLeads, sortConfig]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(sortedLeads.length / LEADS_PER_PAGE)

    const currentLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * LEADS_PER_PAGE
        const endIndex = startIndex + LEADS_PER_PAGE
        return sortedLeads.slice(startIndex, endIndex)
    }, [sortedLeads, currentPage])

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        })
    }

    const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

    const getAvatarColor = (name) => {
        const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
        const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
        return colors[hash % colors.length]
    }

    const handleExport = () => {
        if (leads.length === 0) return;
        const escapeCSVValue = (value) => {
            const stringValue = String(value == null ? '' : value);
            if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
            return stringValue;
        };
        const headers = ["Sno.", "Customer", "Company", "Email", "Phone", "Assigned To", "Converted Date"];
        let csvContent = headers.join(",") + "\n";
        leads.forEach((lead, index) => {
            const row = [index + 1, lead.customer?.name || "-", lead.customer?.company_name || "-", lead.customer?.email || "-", lead.customer?.phone || "-", lead.assigned_to?.name || "-", formatDate(lead.updated_at)];
            csvContent += row.map(escapeCSVValue).join(",") + "\n";
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpdateLead = async (updatePayload, id) => {
        const { status, priority } = updatePayload;
        try {
            Swal.fire({ title: "Updating Lead...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseUrl}/accounts/api/leads/${id}/status/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, priority }),
            });
            if (!res.ok) throw new Error("Failed to update lead");
            setLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...updatePayload } : l));
            Swal.fire("Updated!", "Lead details updated.", "success");
        } catch (err) {
            Swal.fire("Error!", "Failed to update lead.", "error");
        }
    };

    const handleDeleteLead = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?", text: "This lead will be permanently deleted!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it!"
        })
        if (!result.isConfirmed) return
        try {
            Swal.fire({ title: "Deleting...", allowOutsideClick: false, didOpen: () => Swal.showLoading() })
            const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            if (!res.ok) throw new Error("Failed to delete lead")
            setLeads((prev) => prev.filter((l) => l.id !== id))
            Swal.fire("Deleted!", "Lead removed.", "success")
        } catch (err) {
            Swal.fire("Error!", "Delete failed.", "error")
        }
    }

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-green-600" /> : <ChevronDown className="w-4 h-4 text-green-600" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 space-y-6">
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
                        </div>
                        <p className="text-gray-600">Track and manage all leads</p>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto ">
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                        <span className="text-sm text-gray-500">({filteredLeads.length} total)</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
                            <option value="ALL">All Statuses</option>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
                            <option value="ALL">All Priorities</option>
                            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300">
                            <Download className="w-5 h-5" />
                            <span className="text-sm font-medium">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">Loading...</div>
                ) : error ? (
                    <div className="bg-white rounded-lg border border-red-200 p-8 flex items-center gap-3 text-red-600"><AlertCircle /> {error}</div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Unique No.</th>
                                        <th onClick={() => requestSort('customer.name')} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">Customer <SortIcon columnKey="customer.name" /></div>
                                        </th>
                                        <th onClick={() => requestSort('next_date')} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">Follow Up <SortIcon columnKey="next_date" /></div>
                                        </th>
                                        <th onClick={() => requestSort('status')} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">Status <SortIcon columnKey="status" /></div>
                                        </th>
                                        <th onClick={() => requestSort('priority')} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">Priority <SortIcon columnKey="priority" /></div>
                                        </th>
                                        <th onClick={() => requestSort('assigned_to.name')} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">Assigned To <SortIcon columnKey="assigned_to.name" /></div>
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLeads.map((lead, index) => (
                                        <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/leads/view/${lead.id}`)}>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{lead.lead_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(lead.customer.name)}`}>
                                                        {getInitials(lead.customer.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{lead.customer.name}</p>
                                                        <span className="flex items-center text-xs text-gray-500 gap-1"><Building2 className="w-3 h-3" /> {lead.customer.company_name || "-"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lead.next_date || "No Follow-up"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleUpdateLead({ status: e.target.value }, lead.id)}
                                                    className="px-2 py-1 border border-gray-300 rounded bg-transparent focus:ring-1 focus:ring-green-500"
                                                >
                                                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <select
                                                    value={lead.priority}
                                                    onChange={(e) => handleUpdateLead({ priority: e.target.value }, lead.id)}
                                                    className="px-2 py-1 border border-gray-300 rounded bg-transparent focus:ring-1 focus:ring-green-500"
                                                >
                                                    {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>{lead.assigned_to?.name || "Unassigned"}</span>
                                                    <button onClick={() => { setLeadToReassign(lead); setIsAssigneeModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                                        <ArrowRightLeft className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 flex items-center justify-center gap-3">
                                                {permissions?.quotation?.includes("delete") && (
                                                    <button onClick={() => handleDeleteLead(lead.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete"><Trash className="w-4 h-4" /></button>

                                                )}
                                                
                                                <Link to={`/leads/view/${lead.id}`} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors">view</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {!loading && sortedLeads.length > 0 && totalPages > 1 && (
                <div className="max-w-7xl mx-auto py-4 flex justify-between items-center border-t border-gray-200 bg-white px-6 rounded-lg shadow-sm mb-10">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * LEADS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * LEADS_PER_PAGE, sortedLeads.length)}</span> of <span className="font-medium">{sortedLeads.length}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </button>
                        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            <AssignLeadModal isOpen={isAssigneeModalOpen} onClose={() => setIsAssigneeModalOpen(false)} lead={leadToReassign} salespersons={salespersons} />
        </div>
    )
}