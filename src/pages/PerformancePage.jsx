"use client"

import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
	BarChart3,
	Briefcase,
	Calendar,
	CheckCircle2,
	Clock3,
	ChevronRight,
	Loader2,
	Mail,
	User,
	Target,
	TrendingUp,
	Users,
	XCircle,
	X,
} from "lucide-react"
import { formatDateGlobal } from "@/utils/dateFormat"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 2,
})

const PerformancePage = () => {
	const baseUrl = import.meta.env.VITE_BASE_URL
	const [salespeople, setSalespeople] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedSalesperson, setSelectedSalesperson] = useState(null)

	useEffect(() => {
		const fetchSalespeople = async () => {
			try {
				setLoading(true)
				setError("")

				const token = localStorage.getItem("token")
				const response = await fetch(`${baseUrl}/quotations/api/salespeople/`, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				})

				if (!response.ok) {
					throw new Error("Failed to load salesperson performance")
				}

				const result = await response.json()
				setSalespeople(Array.isArray(result?.data) ? result.data : [])
			} catch (err) {
				console.error(err)
				setError("Failed to load salesperson performance")
			} finally {
				setLoading(false)
			}
		}

		fetchSalespeople()
	}, [baseUrl])

	const summary = useMemo(() => {
		const totalSalespeople = salespeople.length
		const activeSalespeople = salespeople.filter((item) => item.is_active).length
		const totalLeadsAssigned = salespeople.reduce((sum, item) => sum + (Number(item.performance?.leads_assigned) || 0), 0)
		const totalQuotationsAssigned = salespeople.reduce((sum, item) => sum + (Number(item.performance?.quotations_assigned) || 0), 0)
		const totalRevenue = salespeople.reduce((sum, item) => sum + (Number(item.performance?.total_revenue) || 0), 0)
		const avgConversionRate = totalSalespeople
			? salespeople.reduce((sum, item) => sum + (Number(item.performance?.conversion_rate) || 0), 0) / totalSalespeople
			: 0

		return {
			totalSalespeople,
			activeSalespeople,
			totalLeadsAssigned,
			totalQuotationsAssigned,
			totalRevenue,
			avgConversionRate,
		}
	}, [salespeople])

	const sortedSalespeople = useMemo(() => {
		return [...salespeople].sort((a, b) => {
			const conversionDiff = (Number(b.performance?.conversion_rate) || 0) - (Number(a.performance?.conversion_rate) || 0)
			if (conversionDiff !== 0) return conversionDiff
			return (Number(b.performance?.total_revenue) || 0) - (Number(a.performance?.total_revenue) || 0)
		})
	}, [salespeople])

	const selectedPerformance = selectedSalesperson?.performance || {}
	const selectedLeads = selectedSalesperson?.current_work?.leads || []
	const selectedQuotations = selectedSalesperson?.current_work?.quotations || []

	const getInitials = (firstName = "", lastName = "") => {
		return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "SP"
	}

	const StatCard = ({ icon: Icon, title, value, subtitle, colorClass = "text-blue-600", bgClass = "bg-blue-50" }) => (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-gray-500">{title}</p>
					<p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
					<p className="text-xs text-gray-500 mt-1">{subtitle}</p>
				</div>
				<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass}`}>
					<Icon className={`w-6 h-6 ${colorClass}`} />
				</div>
			</div>
		</div>
	)

	const Metric = ({ label, value, tone = "gray" }) => {
		const tones = {
			gray: "bg-gray-50 text-gray-700 border-gray-200",
			blue: "bg-blue-50 text-blue-700 border-blue-100",
			green: "bg-emerald-50 text-emerald-700 border-emerald-100",
			amber: "bg-amber-50 text-amber-700 border-amber-100",
			red: "bg-red-50 text-red-700 border-red-100",
			purple: "bg-purple-50 text-purple-700 border-purple-100",
			orange: "bg-orange-50 text-orange-700 border-orange-100",
		}

		return (
			<div className={`rounded-lg border px-3 py-2 ${tones[tone] || tones.gray}`}>
				<p className="text-[11px] uppercase tracking-wide font-semibold opacity-70">{label}</p>
				<p className="text-sm font-bold mt-1">{value}</p>
			</div>
		)
	}

	const WorkList = ({ title, items, kind }) => {
		const emptyText = kind === "leads" ? "No current leads assigned" : "No current quotations assigned"

		return (
			<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						{kind === "leads" ? <Target className="w-4 h-4 text-orange-600" /> : <Briefcase className="w-4 h-4 text-purple-600" />}
						<h4 className="text-sm font-semibold text-gray-900">{title}</h4>
					</div>
					<span className="text-xs text-gray-500">{items.length} items</span>
				</div>

				{items.length > 0 ? (
					<div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        
						{items.map((item) => (
							<div
								key={item.id}
								className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm ${kind === "leads" ? "hover:border-blue-300 hover:shadow-md transition-all" : ""}`}
							>
								<div className="flex items-start justify-between gap-3">
                                    
									<div>
										{kind === "leads" ? (
											<Link to={`/leads/view/${item.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
												{item.lead_number}
											</Link>
										) : (
                                            
											<p className="text-sm font-semibold text-gray-900 cursor-pointer"
                                            onClick={() => window.open(item.pdf_url)}>{item.quotation_number}</p>
										)}
										<p className="text-xs text-gray-500 mt-1">
											{item.customer?.name} · {item.customer?.company_name}
										</p>
									</div>
									<span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
										{item.status}
									</span>
								</div>

								<div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
									<span className="inline-flex items-center gap-1">
										<Calendar className="w-3.5 h-3.5" />
										{item.follow_up_date ? formatDateGlobal(item.follow_up_date) : "No follow-up"}
									</span>
									{kind === "quotations" && (
										<span className="font-semibold text-gray-900">{currencyFormatter.format(Number(item.total) || 0)}</span>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
						{emptyText}
					</div>
				)}
			</div>
		)
	}

	const PerformanceDetailModal = () => {
		if (!selectedSalesperson) return null

		return (
			<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setSelectedSalesperson(null)}>
				<div
					className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
						<div className="flex items-start gap-4">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
								{getInitials(selectedSalesperson.first_name, selectedSalesperson.last_name)}
							</div>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h2 className="text-xl font-bold text-gray-900">
										{selectedSalesperson.first_name} {selectedSalesperson.last_name}
									</h2>
									<span
										className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedSalesperson.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
									>
										{selectedSalesperson.is_active ? "Active" : "Inactive"}
									</span>
									<span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
										Rank #{sortedSalespeople.findIndex((item) => item.id === selectedSalesperson.id) + 1}
									</span>
								</div>
								<div className="mt-2 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:gap-4">
									<span className="inline-flex items-center gap-1.5">
										<Mail className="w-4 h-4" />
										{selectedSalesperson.email}
									</span>
									<span className="inline-flex items-center gap-1.5">
										<Calendar className="w-4 h-4" />
										Joined {formatDateGlobal(selectedSalesperson.created_at)}
									</span>
									<span className="inline-flex items-center gap-1.5">
										<Clock3 className="w-4 h-4" />
										Last login {selectedSalesperson.last_login ? formatDateGlobal(selectedSalesperson.last_login) : "Never"}
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={() => setSelectedSalesperson(null)}
							className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
							aria-label="Close performance details"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="p-6 overflow-y-auto space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
							<StatCard
								icon={Target}
								title="Leads Assigned"
								value={selectedPerformance.leads_assigned ?? 0}
								subtitle="Assigned to this salesperson"
								colorClass="text-orange-600"
								bgClass="bg-orange-50"
							/>
							<StatCard
								icon={Briefcase}
								title="Quotations Assigned"
								value={selectedPerformance.quotations_assigned ?? 0}
								subtitle="Assigned to this salesperson"
								colorClass="text-purple-600"
								bgClass="bg-purple-50"
							/>
							<StatCard
								icon={TrendingUp}
								title="Revenue"
								value={currencyFormatter.format(Number(selectedPerformance.total_revenue) || 0)}
								subtitle="Accepted quotation value"
								colorClass="text-emerald-600"
								bgClass="bg-emerald-50"
							/>
							<StatCard
								icon={CheckCircle2}
								title="Conversion Rate"
								value={`${Number(selectedPerformance.conversion_rate || 0).toFixed(2)}%`}
								subtitle="Lead to sale conversion"
								colorClass="text-amber-600"
								bgClass="bg-amber-50"
							/>
							<StatCard
								icon={Users}
								title="Current Work"
								value={(selectedLeads.length || 0) + (selectedQuotations.length || 0)}
								subtitle="Open leads and quotations"
								colorClass="text-blue-600"
								bgClass="bg-blue-50"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
							<Metric label="Leads Created" value={selectedPerformance.leads_created ?? 0} tone="blue" />
							<Metric label="Converted Leads" value={selectedPerformance.converted_leads ?? 0} tone="green" />
							<Metric label="Lost Leads" value={selectedPerformance.lost_leads ?? 0} tone="red" />
							<Metric label="Quotations Created" value={selectedPerformance.quotations_created ?? 0} tone="purple" />
							<Metric label="Sent Quotations" value={selectedPerformance.sent_quotations ?? 0} tone="amber" />
							<Metric label="Accepted Quotations" value={selectedPerformance.accepted_quotations ?? 0} tone="green" />
							<Metric label="Rejected Quotations" value={selectedPerformance.rejected_quotations ?? 0} tone="red" />
							<Metric label="Revenue" value={currencyFormatter.format(Number(selectedPerformance.total_revenue) || 0)} tone="green" />
						</div>

						<div>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold text-gray-900">Conversion Performance</h3>
								<span className="text-sm font-bold text-gray-700">{Number(selectedPerformance.conversion_rate || 0).toFixed(2)}%</span>
							</div>
							<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
								<div
									className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
									style={{ width: `${Math.min(Number(selectedPerformance.conversion_rate || 0), 100)}%` }}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
							<WorkList title="Current Leads" items={selectedLeads} kind="leads" />
							<WorkList title="Current Quotations" items={selectedQuotations} kind="quotations" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="flex items-center gap-3 text-gray-600">
					<Loader2 className="w-5 h-5 animate-spin" />
					<span>Loading performance data...</span>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-red-200 p-6 text-center">
				<XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
				<h2 className="text-lg font-semibold text-gray-900">Unable to load performance</h2>
				<p className="text-sm text-gray-500 mt-1">{error}</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Salesperson Performance</h1>
					<p className="text-sm text-gray-500 mt-1">Individual performance, current work, and key activity metrics.</p>
				</div>
				<div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 w-fit">
					<BarChart3 className="w-4 h-4" />
					Live API data
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
				<StatCard
					icon={Users}
					title="Salespeople"
					value={summary.totalSalespeople}
					subtitle={`${summary.activeSalespeople} active users`}
					colorClass="text-blue-600"
					bgClass="bg-blue-50"
				/>
				<StatCard
					icon={Target}
					title="Leads Assigned"
					value={summary.totalLeadsAssigned}
					subtitle="Across all salespeople"
					colorClass="text-orange-600"
					bgClass="bg-orange-50"
				/>
				<StatCard
					icon={Briefcase}
					title="Quotations Assigned"
					value={summary.totalQuotationsAssigned}
					subtitle="Across all salespeople"
					colorClass="text-purple-600"
					bgClass="bg-purple-50"
				/>
				<StatCard
					icon={TrendingUp}
					title="Total Revenue"
					value={currencyFormatter.format(summary.totalRevenue)}
					subtitle="Accepted quotation value"
					colorClass="text-emerald-600"
					bgClass="bg-emerald-50"
				/>
				<StatCard
					icon={CheckCircle2}
					title="Avg. Conversion"
					value={`${summary.avgConversionRate.toFixed(2)}%`}
					subtitle="Average across team"
					colorClass="text-amber-600"
					bgClass="bg-amber-50"
				/>
			</div>

			{sortedSalespeople.length > 0 ? (
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold text-gray-900">Salespeople</h2>
							<p className="text-sm text-gray-500">Click any salesperson to view detailed performance</p>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<User className="w-4 h-4" />
							{sortedSalespeople.length} users
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
								<tr>
									<th className="px-5 py-3">Name</th>
									<th className="px-5 py-3">Email</th>
									<th className="px-5 py-3">Status</th>
									<th className="px-5 py-3 text-center">Leads</th>
									<th className="px-5 py-3 text-center">Quotations</th>
									<th className="px-5 py-3 text-center">Revenue</th>
									<th className="px-5 py-3 text-center">Conversion</th>
									<th className="px-5 py-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{sortedSalespeople.map((salesperson, index) => {
									const performance = salesperson.performance || {}
									return (
										<tr
											key={salesperson.id}
											className="hover:bg-gray-50 cursor-pointer transition-colors"
											onClick={() => setSelectedSalesperson(salesperson)}
										>
											<td className="px-5 py-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
														{getInitials(salesperson.first_name, salesperson.last_name)}
													</div>
													<div>
														<p className="font-semibold text-gray-900">
															{salesperson.first_name} {salesperson.last_name}
														</p>
														<p className="text-xs text-gray-500">Rank #{index + 1}</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-4 text-sm text-gray-600">{salesperson.email}</td>
											<td className="px-5 py-4">
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${salesperson.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
												>
													{salesperson.is_active ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="px-5 py-4 text-center font-semibold text-gray-900">{salesperson.lead_count ?? 0}</td>
											<td className="px-5 py-4 text-center font-semibold text-gray-900">{salesperson.quotation_count ?? 0}</td>
											<td className="px-5 py-4 text-center font-semibold text-gray-900">
												{currencyFormatter.format(Number(performance.total_revenue) || 0)}
											</td>
											<td className="px-5 py-4 text-center">
												<span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
													{Number(performance.conversion_rate || 0).toFixed(2)}%
												</span>
											</td>
											<td className="px-5 py-4 text-right">
												<button className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
													View <ChevronRight className="w-4 h-4" />
												</button>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
					<BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
					<h3 className="text-lg font-semibold text-gray-900">No performance data found</h3>
					<p className="text-sm text-gray-500 mt-1">The salespeople API returned an empty list.</p>
				</div>
			)}

			<PerformanceDetailModal />
		</div>
	)
}

export default PerformancePage
