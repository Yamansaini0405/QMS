"use client"

import { useState, useEffect } from "react"
import {
    FileText,
    Search,
    Eye,
    DollarSign,
    User,
    Building2,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeftRight,
    ArrowUp,
    ArrowDown,
    Edit
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function DraftQuotations() {
    const [quotations, setQuotations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [quotationSortConfig, setQuotationSortConfig] = useState({ key: null, direction: "asc" })

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuotations = async () => {
            setLoading(true)
            try {
                // Replace with your actual API endpoint
                const response = await fetch("https://api.nkprosales.com/quotations/api/quotations/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                })
                const data = await response.json()
                setQuotations(data.data || [])
                console.log(data.data)
            } catch (error) {
                console.error("Error fetching quotations:", error)
                setQuotations([])
            } finally {
                setLoading(false)
            }
        }

        fetchQuotations()
    }, [])

    const getStatusIcon = (status) => {
        switch (status) {
            case "SENT":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "ACCEPTED":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "REJECTED":
                return <XCircle className="w-4 h-4 text-red-500" />
            case "REVISED":
                return <ArrowLeftRight className="w-4 h-4 text-black" />
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
        switch (status) {
            case "SENT":
                return `${baseClasses} bg-blue-100 text-blue-800`
            case "ACCEPTED":
                return `${baseClasses} bg-green-100 text-green-800`
            case "REJECTED":
                return `${baseClasses} bg-red-100 text-red-800`
            case "REVISED":
                return `${baseClasses} bg-black text-white`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const filteredQuotations = quotations
        .filter((quotation) => quotation.status === "DRAFT")
        .filter((quotation) => {
            const matchesSearch =
                quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quotation.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quotation.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "All" || quotation.status === statusFilter

            return matchesSearch && matchesStatus
        })




    //sorting quotation logic ---start--
    const handleQuotationSort = (key) => {
        let direction = "asc"
        if (quotationSortConfig.key === key && quotationSortConfig.direction === "asc") {
            direction = "desc"
        }
        setQuotationSortConfig({ key, direction })
    }

    const sortQuotations = (quotations) => {
        if (!quotationSortConfig.key) return quotations
        return [...quotations].sort((a, b) => {
            let valueA = a[quotationSortConfig.key]
            let valueB = b[quotationSortConfig.key]

            // handle special cases
            if (quotationSortConfig.key === "created_at" || quotationSortConfig.key === "follow_up_date") {
                valueA = new Date(valueA)
                valueB = new Date(valueB)
            } else if (quotationSortConfig.key === "total") {
                valueA = parseFloat(a.total) || 0
                valueB = parseFloat(b.total) || 0
            } else if (quotationSortConfig.key === "customer") {
                valueA = a.customer?.name?.toLowerCase() || ""
                valueB = b.customer?.name?.toLowerCase() || ""
            } else {
                valueA = valueA ?? ""
                valueB = valueB ?? ""
            }

            if (valueA < valueB) return quotationSortConfig.direction === "asc" ? -1 : 1
            if (valueA > valueB) return quotationSortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }

    const QuotationSortIcon = ({ column }) => {
        if (quotationSortConfig.key !== column) return null
        return quotationSortConfig.direction === "asc" ? (
            <ArrowUp className="inline w-4 h-4 ml-1" />
        ) : (
            <ArrowDown className="inline w-4 h-4 ml-1" />
        )
    }

    // --- end ---

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quotations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Draft Quotations</h1>
                            <p className="text-gray-600">Manage and track all your draft quotations</p>
                        </div>
                    </div>
                </div>



                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search quotations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>

                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Showing {filteredQuotations.length} of {quotations.length} quotations
                    </p>
                </div>

                {/* Quotations Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>

                                    <th
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleQuotationSort("quotation_number")}
                                    >
                                        Quotation <QuotationSortIcon column="quotation_number" />
                                    </th>
                                    <th
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleQuotationSort("customer")}
                                    >
                                        Customer <QuotationSortIcon column="customer" />
                                    </th>

                                    <th
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleQuotationSort("total")}
                                    >
                                        Amount <QuotationSortIcon column="total" />
                                    </th>

                                    <th
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleQuotationSort("status")}
                                    >
                                        Status <QuotationSortIcon column="status" />
                                    </th>


                                    <th
                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => handleQuotationSort("created_at")}
                                    >
                                        Created <QuotationSortIcon column="created_at" />
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {sortQuotations(filteredQuotations).map((quotation) => (
                                    <tr key={quotation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{quotation.quotation_number}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Tax: {quotation.tax_rate}% | Discount: {quotation.discount}
                                                        {quotation.discount_type === "percentage" ? "%" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">

                                                <div>
                                                    <p className="font-medium text-gray-900">{quotation.customer?.name}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span className="flex items-center space-x-1">
                                                            <Building2 className="w-3 h-3" />
                                                            <span>{quotation.customer?.company_name}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">

                                                        <span className="flex items-center space-x-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{quotation.customer?.phone}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">₹{quotation.total}</p>
                                                <p className="text-sm text-gray-500">Subtotal: ₹{quotation.subtotal}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(quotation.status)}
                                                <span className={getStatusBadge(quotation.status)}>{quotation.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">

                                                <div>
                                                    <p className="text-sm text-gray-900">{new Date(quotation.created_at).toLocaleDateString()}</p>
                                                    {quotation.emailed_at && (
                                                        <p className="text-xs text-gray-500">
                                                            Emailed: {new Date(quotation.emailed_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-3 h-3 text-gray-600" />
                                                </div>
                                                <span className="text-sm text-gray-900">{quotation.assigned_to?.name || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 bg-green-700 rounded-lg px-1">
                                                <button
                                                    onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                                                    className="p-1 text-white hover:text-green-600 flex items-center justify-center gap-1"
                                                    title="Edit Quotation"
                                                >
                                                    <Edit className="w-4 h-4" />Edit
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredQuotations.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No quotations found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
