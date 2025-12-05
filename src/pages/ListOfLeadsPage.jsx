"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, CheckCircle, TrendingUp, Clock, AlertCircle, ChevronLeft, ChevronRight, Phone, Trash } from "lucide-react"
import Swal from "sweetalert2"

const baseUrl = import.meta.env.VITE_BASE_URL
const STATUS_OPTIONS = ["PENDING", "QUALIFIED", "LOST", "CONVERTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function ListOfLeadsPage() {
    const [leads, setLeads] = useState([])
    const [filteredLeads, setFilteredLeads] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1) // New state for current page

    // Leads per page constant
    const LEADS_PER_PAGE = 30

    const baseUrl = import.meta.env.VITE_BASE_URL || ""

    // Fetch converted leads from API
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

                if (!response.ok) {
                    throw new Error("Failed to fetch converted leads")
                }

                const data = await response.json()
                setLeads(data.data || data)
                setFilteredLeads(data.data || data)
                setCurrentPage(1); // Reset to first page on new data fetch
            } catch (err) {
                setError(err.message)
                console.error("Error fetching leads:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchConvertedLeads()
    }, [])

    // Handle search - Resets to page 1 on search change
    useEffect(() => {
        const filtered = leads.filter((lead) => {
            const searchLower = searchTerm.toLowerCase()
            return (
                lead.customer.name.toLowerCase().includes(searchLower) ||
                lead.customer.email.toLowerCase().includes(searchLower) ||
                lead.customer.company_name.toLowerCase().includes(searchLower) ||
                lead.customer.phone.includes(searchTerm)
            )
        })
        setFilteredLeads(filtered)
        setCurrentPage(1) // Important: Reset page when filtering
    }, [searchTerm, leads])

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE)

    const currentLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * LEADS_PER_PAGE
        const endIndex = startIndex + LEADS_PER_PAGE
        return filteredLeads.slice(startIndex, endIndex)
    }, [filteredLeads, currentPage])

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Calculate stats (unchanged)
    const totalConverted = leads.length
    const avgConversionTime =
        leads.length > 0
            ? Math.round(
                leads.reduce((acc, lead) => {
                    const created = new Date(lead.created_at)
                    const updated = new Date(lead.updated_at)
                    return acc + (updated - created) / (1000 * 60 * 60 * 24)
                }, 0) / leads.length,
            )
            : 0

    const withQuotations = leads.filter((lead) => lead.quotation).length

    // Format date (unchanged)
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Get initials for avatar (unchanged)
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    // Get avatar color based on name (unchanged)
    const getAvatarColor = (name) => {
        const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
        const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
        return colors[hash % colors.length]
    }

    // Handle CSV Export (unchanged)
    const handleExport = () => {
        if (leads.length === 0) {
            console.log("No data to export");
            return;
        }

        // Helper to escape values for CSV
        const escapeCSVValue = (value) => {
            const stringValue = String(value == null ? '' : value); // Handle null/undefined
            if (/[",\n]/.test(stringValue)) {
                // If it contains quotes, newlines, or commas, wrap in double quotes
                // and double up any existing double quotes
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        // Define Headers
        const headers = ["Sno.", "Customer", "Company", "Email", "Phone", "Assigned To", "Converted Date"];
        let csvContent = headers.join(",") + "\n";

        // Add Data Rows
        leads.forEach((lead, index) => {
            const row = [
                index + 1,
                lead.customer?.name || "-",
                lead.customer?.company_name || "-",
                lead.customer?.email || "-",
                lead.customer?.phone || "-",
                lead.assigned_to?.name || "-",
                formatDate(lead.updated_at)
            ];

            csvContent += row.map(escapeCSVValue).join(",") + "\n";
        });

        // Create Blob and Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "converted_leads.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleUpdateLead = async (updatePayload, id) => {
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

                    status: status, // Use new value or existing
                    priority: priority, // Use new value or existing
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update lead on server");
            }

            // Update local state
            setLeads((prevLeads) =>
                prevLeads.map((lead) =>
                    lead.id === id
                        ? {
                            ...lead,
                            status: status !== undefined ? status : lead.status,
                            priority: priority !== undefined ? priority : lead.priority,
                        }
                        : lead
                )
            );
            Swal.fire("Updated!", "The lead has been successfully updated.", "success");
        } catch (err) {
            console.error("Error updating lead:", err);
            Swal.fire("Error!", "Failed to update lead. Please try again.", "error");
        }
    };

    const handleDeleteLead = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This lead will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        })

        if (!result.isConfirmed) return

        try {
            // 🔹 call backend API
            Swal.fire({
                title: "Deleting...",
                text: "Please wait while we delete your Lead.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            const res = await fetch(`${baseUrl}/quotations/api/leads/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            if (!res.ok) {
                throw new Error("Failed to delete lead from server")
            }
            // 🔹 update local state
            setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id))

            Swal.fire("Deleted!", "The lead has been deleted.", "success")
        } catch (err) {
            console.error(err)
            Swal.fire("Error!", "Failed to delete lead. Please try again.", "error")


        }
    }

    return (
        <div className="min-h-screen bg-gray-50 space-y-6 "> {/* Added p-8 for better spacing */}
            {/* Header (unchanged) */}
            <div className="bg-white border-b border-gray-200 p-6 "> {/* Adjusted margins to span width */}
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


            {/* Search and Filter (unchanged) */}
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                        <span className="hidden md:blocktext-sm text-gray-500">({filteredLeads.length} total leads found)</span>
                    </div>

                    <div className="flex items-center gap-1 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads by name, email, company, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={handleExport}>
                            <Download className="w-5 h-5" />
                            <span className="text-sm font-medium">Export All {totalConverted}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-600">Loading converted leads...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg border border-red-200 p-8 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-600">
                            {searchTerm ? "No leads found matching your search." : "No converted leads yet."}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLeads.map((lead, index) => ( // Mapped over currentLeads
                                        <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-center text-gray-900">
                                                {((currentPage - 1) * LEADS_PER_PAGE) + index + 1} {/* Corrected Sno. calculation */}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(lead.customer.name)}`}
                                                    >
                                                        {getInitials(lead.customer.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{lead.customer.name}</p>

                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">

                                                            <span className="flex items-center space-x-1">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{lead.customer.phone}</span>
                                                            </span>
                                                        </div>
                                                    </div>


                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{lead.customer.company_name || "-"}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600"><select
                                                value={lead.status}
                                                onChange={(e) => handleUpdateLead({ status: e.target.value }, lead.id)}
                                                className={` inline-block px-1 py-1 rounded-md text-sm font-semibold cursor-pointer  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select></td>
                                            <td className="px-4 py-4 text-sm text-gray-600"><select
                                                value={lead.priority}
                                                onChange={(e) => handleUpdateLead({ priority: e.target.value }, lead.id)}
                                                className={`inline-block px-1 py-1 rounded-md text-sm font-semibold cursor-pointer border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200`}
                                            >
                                                {PRIORITY_OPTIONS.map((priority) => (
                                                    <option key={priority} value={priority}>
                                                        {priority}
                                                    </option>
                                                ))}

                                            </select></td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lead.assigned_to?.name || "-"}</td>
                                            <td className="px-6 py-4 text-sm text-center text-gray-600"><button
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete Lead"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button></td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && filteredLeads.length > 0 && totalPages > 1 && (
                <div className="max-w-7xl mx-auto py-4 flex justify-between items-center border-t border-gray-200 bg-white px-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * LEADS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * LEADS_PER_PAGE, filteredLeads.length)}</span> of <span className="font-medium">{filteredLeads.length}</span> leads
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page <span className="font-semibold text-green-600">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}