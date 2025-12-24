"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, CheckCircle, TrendingUp, Clock, AlertCircle, ChevronLeft, ChevronRight, Phone, Trash, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
import Swal from "sweetalert2"

const baseUrl = import.meta.env.VITE_BASE_URL
const STATUS_OPTIONS = ["PROSPECTIVE", "QUALIFIED", "LOST", "CONVERTED", "NEGOTIATION"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export default function ListOfLeadsPage() {
    const [leads, setLeads] = useState([])
    const [filteredLeads, setFilteredLeads] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    // --- SORTING STATE ---
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const LEADS_PER_PAGE = 30
    const baseUrl = import.meta.env.VITE_BASE_URL || ""

    useEffect(() => {
        const fetchConvertedLeads = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${baseUrl}/quotations/api/leads/?filter=converted`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                if (!response.ok) throw new Error("Failed to fetch converted leads")
                const data = await response.json()
                setLeads(data.data || data)
                setFilteredLeads(data.data || data)
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
            return (
                lead.customer.name.toLowerCase().includes(searchLower) ||
                lead.customer.email.toLowerCase().includes(searchLower) ||
                lead.customer.company_name.toLowerCase().includes(searchLower) ||
                lead.customer.phone.includes(searchTerm)
            )
        })
        setFilteredLeads(filtered)
        setCurrentPage(1)
    }, [searchTerm, leads])

    // --- SORTING LOGIC ---
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedLeads = useMemo(() => {
        let sortableItems = [...filteredLeads];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                // Helper for nested keys like 'customer.name'
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
        return sortableItems;
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
        link.setAttribute("download", "converted_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            if (!res.ok) throw new Error("Failed to delete lead")
            setLeads((prev) => prev.filter((lead) => lead.id !== id))
            Swal.fire("Deleted!", "The lead has been deleted.", "success")
        } catch (err) {
            Swal.fire("Error!", "Failed to delete lead.", "error")
        }
    }

    // Helper component for Sort Icons
    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1 text-green-600" /> : <ChevronDown className="w-4 h-4 ml-1 text-green-600" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 space-y-6 ">
            <div className="bg-white border-b border-gray-200 p-6 ">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Converted Leads</h1>
                        </div>
                        <p className="text-gray-600">Track and manage successfully converted leads</p>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto ">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                        <span className="text-sm text-gray-500">({filteredLeads.length} total found)</span>
                    </div>

                    <div className="flex items-center gap-4">
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
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                            onClick={handleExport}>
                            <Download className="w-5 h-5" />
                            <span className="text-sm font-medium">Export All</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">Loading leads...</div>
                ) : error ? (
                    <div className="bg-white rounded-lg border border-red-200 p-8 flex items-center gap-3 text-red-600">
                        <AlertCircle className="w-6 h-6" /> Error: {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sno.</th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => requestSort('customer.name')}
                                        >
                                            <div className="flex items-center">Customer <SortIcon columnKey="customer.name" /></div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => requestSort('customer.company_name')}
                                        >
                                            <div className="flex items-center">Company <SortIcon columnKey="customer.company_name" /></div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => requestSort('status')}
                                        >
                                            <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => requestSort('priority')}
                                        >
                                            <div className="flex items-center">Priority <SortIcon columnKey="priority" /></div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => requestSort('assigned_to.name')}
                                        >
                                            <div className="flex items-center">Assigned To <SortIcon columnKey="assigned_to.name" /></div>
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLeads.map((lead, index) => (
                                        <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {((currentPage - 1) * LEADS_PER_PAGE) + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(lead.customer.name)}`}>
                                                        {getInitials(lead.customer.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{lead.customer.name}</p>
                                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                                            <Phone className="w-3 h-3 mr-1" /> {lead.customer.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lead.customer.company_name || "-"}</td>
                                            <td className="px-6 py-4 text-left"><span className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">{lead.status}</span></td>
                                            <td className="px-6 py-4 text-left"><span className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">{lead.priority}</span></td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lead.assigned_to?.name || "-"}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleDeleteLead(lead.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete Lead">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {!loading && filteredLeads.length > 0 && totalPages > 1 && (
                <div className="max-w-7xl mx-auto py-4 flex justify-between items-center border-t border-gray-200 bg-white px-6 rounded-lg shadow-sm mb-8">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * LEADS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * LEADS_PER_PAGE, filteredLeads.length)}</span> of <span className="font-medium">{filteredLeads.length}</span> leads
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                            <ChevronLeft className="w-5 h-5 mr-1 inline" /> Previous
                        </button>
                        <span className="text-sm text-gray-700">Page <span className="font-semibold text-green-600">{currentPage}</span> of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                            Next <ChevronRight className="w-5 h-5 ml-1 inline" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}